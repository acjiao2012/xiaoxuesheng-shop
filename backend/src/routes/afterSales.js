import express from 'express';
import jwt from 'jsonwebtoken';
import { body, param, query, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 中间件：验证用户身份
const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: '无效的认证令牌'
    });
  }
};

// 订单状态流转
const ORDER_STATUS_FLOW = {
  'pending': ['paid', 'cancelled'],
  'paid': ['shipped', 'refunded'],
  'shipped': ['delivered', 'returned'],
  'delivered': ['completed', 'returned'],
  'completed': ['returned'],
  'cancelled': [],
  'refunded': [],
  'returned': ['refunded']
};

// 申请售后
router.post('/apply', [
  body('orderId').isString().withMessage('订单ID必须是字符串'),
  body('type').isIn(['refund', 'return', 'exchange']).withMessage('售后类型无效'),
  body('reason').notEmpty().withMessage('申请原因不能为空'),
  body('description').optional().isString().withMessage('详细描述必须是字符串'),
  body('images').optional().isArray().withMessage('图片必须是数组')
], authenticateUser, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '参数验证失败',
        details: errors.array()
      });
    }

    const { orderId, type, reason, description, images = [] } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查订单是否存在且属于当前用户
    const order = await db.get(`
      SELECT id, order_no, status, payment_status, shipping_status, created_at
      FROM orders
      WHERE id = ? AND user_id = ?
    `, [orderId, userId]);

    if (!order) {
      return res.status(404).json({
        error: '订单不存在'
      });
    }

    // 检查订单状态是否允许申请售后
    const allowedStatuses = ['paid', 'shipped', 'delivered', 'completed'];
    if (!allowedStatuses.includes(order.status)) {
      return res.status(400).json({
        error: '订单状态不允许申请售后'
      });
    }

    // 检查是否在售后期限内（30天）
    const orderDate = new Date(order.created_at);
    const now = new Date();
    const daysDiff = (now - orderDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 30) {
      return res.status(400).json({
        error: '订单已超过30天售后期限'
      });
    }

    // 检查是否已有售后申请
    const existingAfterSales = await db.get(`
      SELECT id FROM after_sales
      WHERE order_id = ? AND status IN ('pending', 'approved', 'processing')
    `, [orderId]);

    if (existingAfterSales) {
      return res.status(400).json({
        error: '该订单已有售后申请在处理中'
      });
    }

    // 创建售后申请
    const afterSalesId = uuidv4();
    await db.run(`
      INSERT INTO after_sales (
        id, order_id, user_id, type, reason, description, images, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [afterSalesId, orderId, userId, type, reason, description, JSON.stringify(images), 'pending']);

    res.status(201).json({
      message: '售后申请提交成功',
      afterSalesId
    });
  } catch (error) {
    console.error('申请售后错误:', error);
    res.status(500).json({
      error: '申请售后失败'
    });
  }
});

// 获取售后申请列表
router.get('/list', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'processing', 'completed']).withMessage('状态无效')
], authenticateUser, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '参数验证失败',
        details: errors.array()
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.userId;
    const db = getDatabase();
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereConditions = ['as.user_id = ?'];
    let queryParams = [userId];

    if (status) {
      whereConditions.push('as.status = ?');
      queryParams.push(status);
    }

    // 查询售后申请总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM after_sales as
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await db.get(countQuery, queryParams);
    const total = countResult.total;

    // 查询售后申请列表
    const afterSalesQuery = `
      SELECT 
        as.id,
        as.type,
        as.reason,
        as.description,
        as.images,
        as.status,
        as.created_at,
        as.updated_at,
        o.order_no,
        o.total_amount,
        o.status as order_status
      FROM after_sales as
      JOIN orders o ON as.order_id = o.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY as.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const afterSales = await db.all(afterSalesQuery, [...queryParams, limit, offset]);

    // 处理售后申请数据
    const processedAfterSales = afterSales.map(item => ({
      id: item.id,
      type: item.type,
      reason: item.reason,
      description: item.description,
      images: JSON.parse(item.images || '[]'),
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      order: {
        orderNo: item.order_no,
        totalAmount: parseFloat(item.total_amount),
        status: item.order_status
      }
    }));

    res.json({
      afterSales: processedAfterSales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取售后申请列表错误:', error);
    res.status(500).json({
      error: '获取售后申请列表失败'
    });
  }
});

// 获取售后申请详情
router.get('/detail/:afterSalesId', [
  param('afterSalesId').isString().withMessage('售后申请ID必须是字符串')
], authenticateUser, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '参数验证失败',
        details: errors.array()
      });
    }

    const { afterSalesId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    const afterSales = await db.get(`
      SELECT 
        as.id,
        as.type,
        as.reason,
        as.description,
        as.images,
        as.status,
        as.admin_reply,
        as.created_at,
        as.updated_at,
        o.id as order_id,
        o.order_no,
        o.total_amount,
        o.status as order_status,
        o.shipping_address
      FROM after_sales as
      JOIN orders o ON as.order_id = o.id
      WHERE as.id = ? AND as.user_id = ?
    `, [afterSalesId, userId]);

    if (!afterSales) {
      return res.status(404).json({
        error: '售后申请不存在'
      });
    }

    res.json({
      afterSales: {
        id: afterSales.id,
        type: afterSales.type,
        reason: afterSales.reason,
        description: afterSales.description,
        images: JSON.parse(afterSales.images || '[]'),
        status: afterSales.status,
        adminReply: afterSales.admin_reply,
        createdAt: afterSales.created_at,
        updatedAt: afterSales.updated_at,
        order: {
          id: afterSales.order_id,
          orderNo: afterSales.order_no,
          totalAmount: parseFloat(afterSales.total_amount),
          status: afterSales.order_status,
          shippingAddress: JSON.parse(afterSales.shipping_address || '{}')
        }
      }
    });
  } catch (error) {
    console.error('获取售后申请详情错误:', error);
    res.status(500).json({
      error: '获取售后申请详情失败'
    });
  }
});

// 取消售后申请
router.post('/cancel/:afterSalesId', [
  param('afterSalesId').isString().withMessage('售后申请ID必须是字符串')
], authenticateUser, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '参数验证失败',
        details: errors.array()
      });
    }

    const { afterSalesId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查售后申请是否存在且属于当前用户
    const afterSales = await db.get(`
      SELECT id, status FROM after_sales
      WHERE id = ? AND user_id = ?
    `, [afterSalesId, userId]);

    if (!afterSales) {
      return res.status(404).json({
        error: '售后申请不存在'
      });
    }

    if (afterSales.status !== 'pending') {
      return res.status(400).json({
        error: '只能取消待处理的售后申请'
      });
    }

    // 更新售后申请状态
    await db.run(`
      UPDATE after_sales 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [afterSalesId]);

    res.json({
      message: '售后申请取消成功'
    });
  } catch (error) {
    console.error('取消售后申请错误:', error);
    res.status(500).json({
      error: '取消售后申请失败'
    });
  }
});

// 更新订单状态（管理员接口）
router.put('/order-status/:orderId', [
  param('orderId').isString().withMessage('订单ID必须是字符串'),
  body('status').isIn(Object.keys(ORDER_STATUS_FLOW)).withMessage('订单状态无效'),
  body('remark').optional().isString().withMessage('备注必须是字符串')
], authenticateUser, async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '参数验证失败',
        details: errors.array()
      });
    }

    const { orderId } = req.params;
    const { status, remark } = req.body;
    const db = getDatabase();

    // 检查订单是否存在
    const order = await db.get(`
      SELECT id, status FROM orders
      WHERE id = ?
    `, [orderId]);

    if (!order) {
      return res.status(404).json({
        error: '订单不存在'
      });
    }

    // 检查状态流转是否合法
    if (!ORDER_STATUS_FLOW[order.status].includes(status)) {
      return res.status(400).json({
        error: `订单状态不能从 ${order.status} 直接变更为 ${status}`,
        allowedStatuses: ORDER_STATUS_FLOW[order.status]
      });
    }

    // 更新订单状态
    await db.run(`
      UPDATE orders 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, orderId]);

    // 记录状态变更日志
    if (remark) {
      await db.run(`
        INSERT INTO order_logs (
          id, order_id, action, description, created_at
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [uuidv4(), orderId, 'status_change', `${order.status} -> ${status}: ${remark}`]);
    }

    res.json({
      message: '订单状态更新成功',
      newStatus: status
    });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({
      error: '更新订单状态失败'
    });
  }
});

// 获取售后统计
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_after_sales,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM after_sales
      WHERE user_id = ?
    `, [userId]);

    res.json({
      stats: {
        total: parseInt(stats.total_after_sales || 0),
        pending: parseInt(stats.pending_count || 0),
        approved: parseInt(stats.approved_count || 0),
        rejected: parseInt(stats.rejected_count || 0),
        processing: parseInt(stats.processing_count || 0),
        completed: parseInt(stats.completed_count || 0)
      }
    });
  } catch (error) {
    console.error('获取售后统计错误:', error);
    res.status(500).json({
      error: '获取售后统计失败'
    });
  }
});

export default router; 