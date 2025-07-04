import express from 'express';
import jwt from 'jsonwebtoken';
import { body, param, validationResult } from 'express-validator';
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

// 模拟物流公司配置
const LOGISTICS_COMPANIES = {
  'SF': { name: '顺丰速运', code: 'SF' },
  'YTO': { name: '圆通速递', code: 'YTO' },
  'ZTO': { name: '中通快递', code: 'ZTO' },
  'STO': { name: '申通快递', code: 'STO' },
  'YD': { name: '韵达速递', code: 'YD' },
  'JD': { name: '京东物流', code: 'JD' }
};

// 发货
router.post('/ship', [
  body('orderId').isString().withMessage('订单ID必须是字符串'),
  body('logisticsCompany').isIn(Object.keys(LOGISTICS_COMPANIES)).withMessage('物流公司无效'),
  body('trackingNumber').notEmpty().withMessage('运单号不能为空')
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

    const { orderId, logisticsCompany, trackingNumber } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查订单是否存在且属于当前用户
    const order = await db.get(`
      SELECT id, order_no, status, payment_status
      FROM orders
      WHERE id = ? AND user_id = ?
    `, [orderId, userId]);

    if (!order) {
      return res.status(404).json({
        error: '订单不存在'
      });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({
        error: '订单未支付，无法发货'
      });
    }

    // 检查是否已发货
    const existingShipment = await db.get(`
      SELECT id FROM logistics
      WHERE order_id = ?
    `, [orderId]);

    if (existingShipment) {
      return res.status(400).json({
        error: '订单已发货'
      });
    }

    // 创建物流记录
    const logisticsId = uuidv4();
    await db.run(`
      INSERT INTO logistics (
        id, order_id, logistics_company, tracking_number, status
      ) VALUES (?, ?, ?, ?, ?)
    `, [logisticsId, orderId, logisticsCompany, trackingNumber, 'shipped']);

    // 更新订单状态
    await db.run(`
      UPDATE orders 
      SET status = 'shipped', shipping_status = 'shipped', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [orderId]);

    res.json({
      message: '发货成功',
      logisticsId,
      trackingNumber,
      logisticsCompany: LOGISTICS_COMPANIES[logisticsCompany].name
    });
  } catch (error) {
    console.error('发货错误:', error);
    res.status(500).json({
      error: '发货失败'
    });
  }
});

// 获取物流信息
router.get('/tracking/:orderId', [
  param('orderId').isString().withMessage('订单ID必须是字符串')
], authenticateUser, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查订单是否存在且属于当前用户
    const order = await db.get(`
      SELECT id, order_no FROM orders
      WHERE id = ? AND user_id = ?
    `, [orderId, userId]);

    if (!order) {
      return res.status(404).json({
        error: '订单不存在'
      });
    }

    // 获取物流信息
    const logistics = await db.get(`
      SELECT id, logistics_company, tracking_number, status, created_at
      FROM logistics
      WHERE order_id = ?
    `, [orderId]);

    if (!logistics) {
      return res.status(404).json({
        error: '物流信息不存在'
      });
    }

    // 模拟物流轨迹数据
    const trackingInfo = await getTrackingInfo(logistics.tracking_number, logistics.logistics_company);

    res.json({
      logistics: {
        id: logistics.id,
        company: LOGISTICS_COMPANIES[logistics.logistics_company].name,
        companyCode: logistics.logistics_company,
        trackingNumber: logistics.tracking_number,
        status: logistics.status,
        createdAt: logistics.created_at,
        trackingInfo
      }
    });
  } catch (error) {
    console.error('获取物流信息错误:', error);
    res.status(500).json({
      error: '获取物流信息失败'
    });
  }
});

// 模拟获取物流轨迹信息
async function getTrackingInfo(trackingNumber, companyCode) {
  // 实际项目中需要调用物流API获取真实轨迹
  const mockTrackingData = [
    {
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: '深圳市',
      status: '已揽收',
      description: '快件已被揽收'
    },
    {
      time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      location: '深圳市',
      status: '运输中',
      description: '快件正在运输中'
    },
    {
      time: new Date().toISOString(),
      location: '广州市',
      status: '派送中',
      description: '快件正在派送中'
    }
  ];

  return {
    trackingNumber,
    company: LOGISTICS_COMPANIES[companyCode].name,
    status: '派送中',
    traces: mockTrackingData
  };
}

// 获取物流公司列表
router.get('/companies', async (req, res) => {
  try {
    const companies = Object.entries(LOGISTICS_COMPANIES).map(([code, info]) => ({
      code,
      name: info.name
    }));

    res.json({
      companies
    });
  } catch (error) {
    console.error('获取物流公司列表错误:', error);
    res.status(500).json({
      error: '获取物流公司列表失败'
    });
  }
});

// 批量发货
router.post('/batch-ship', [
  body('shipments').isArray().withMessage('发货列表必须是数组'),
  body('shipments.*.orderId').isString().withMessage('订单ID必须是字符串'),
  body('shipments.*.logisticsCompany').isIn(Object.keys(LOGISTICS_COMPANIES)).withMessage('物流公司无效'),
  body('shipments.*.trackingNumber').notEmpty().withMessage('运单号不能为空')
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

    const { shipments } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    if (shipments.length === 0) {
      return res.status(400).json({
        error: '发货列表不能为空'
      });
    }

    const results = [];
    const batchErrors = [];

    for (const shipment of shipments) {
      try {
        // 检查订单是否存在且属于当前用户
        const order = await db.get(`
          SELECT id, order_no, status, payment_status
          FROM orders
          WHERE id = ? AND user_id = ?
        `, [shipment.orderId, userId]);

        if (!order) {
          batchErrors.push({
            orderId: shipment.orderId,
            error: '订单不存在'
          });
          continue;
        }

        if (order.status !== 'paid') {
          batchErrors.push({
            orderId: shipment.orderId,
            error: '订单未支付，无法发货'
          });
          continue;
        }

        // 检查是否已发货
        const existingShipment = await db.get(`
          SELECT id FROM logistics
          WHERE order_id = ?
        `, [shipment.orderId]);

        if (existingShipment) {
          batchErrors.push({
            orderId: shipment.orderId,
            error: '订单已发货'
          });
          continue;
        }

        // 创建物流记录
        const logisticsId = uuidv4();
        await db.run(`
          INSERT INTO logistics (
            id, order_id, logistics_company, tracking_number, status
          ) VALUES (?, ?, ?, ?, ?)
        `, [logisticsId, shipment.orderId, shipment.logisticsCompany, shipment.trackingNumber, 'shipped']);

        // 更新订单状态
        await db.run(`
          UPDATE orders 
          SET status = 'shipped', shipping_status = 'shipped', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [shipment.orderId]);

        results.push({
          orderId: shipment.orderId,
          logisticsId,
          trackingNumber: shipment.trackingNumber,
          success: true
        });
      } catch (error) {
        batchErrors.push({
          orderId: shipment.orderId,
          error: error.message
        });
      }
    }

    res.json({
      message: '批量发货完成',
      results,
      errors: batchErrors
    });

    res.json({
      message: '批量发货完成',
      results,
      errors
    });
  } catch (error) {
    console.error('批量发货错误:', error);
    res.status(500).json({
      error: '批量发货失败'
    });
  }
});

// 更新物流状态（管理员接口）
router.put('/status/:logisticsId', [
  param('logisticsId').isString().withMessage('物流ID必须是字符串'),
  body('status').isIn(['shipped', 'in_transit', 'out_for_delivery', 'delivered']).withMessage('物流状态无效'),
  body('description').optional().isString().withMessage('状态描述必须是字符串')
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

    const { logisticsId } = req.params;
    const { status, description } = req.body;
    const db = getDatabase();

    // 检查物流记录是否存在
    const logistics = await db.get(`
      SELECT id, order_id FROM logistics
      WHERE id = ?
    `, [logisticsId]);

    if (!logistics) {
      return res.status(404).json({
        error: '物流记录不存在'
      });
    }

    // 更新物流状态
    await db.run(`
      UPDATE logistics 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, logisticsId]);

    // 如果状态为已送达，更新订单状态
    if (status === 'delivered') {
      await db.run(`
        UPDATE orders 
        SET shipping_status = 'delivered', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [logistics.order_id]);
    }

    // 添加物流轨迹记录
    if (description) {
      await db.run(`
        INSERT INTO logistics_traces (
          id, logistics_id, status, description
        ) VALUES (?, ?, ?, ?)
      `, [uuidv4(), logisticsId, status, description]);
    }

    res.json({
      message: '物流状态更新成功',
      status
    });
  } catch (error) {
    console.error('更新物流状态错误:', error);
    res.status(500).json({
      error: '更新物流状态失败'
    });
  }
});

// 获取物流统计信息
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    const stats = await db.get(`
      SELECT 
        COUNT(*) as totalShipments,
        SUM(CASE WHEN l.status = 'shipped' THEN 1 ELSE 0 END) as shippedCount,
        SUM(CASE WHEN l.status = 'in_transit' THEN 1 ELSE 0 END) as inTransitCount,
        SUM(CASE WHEN l.status = 'out_for_delivery' THEN 1 ELSE 0 END) as outForDeliveryCount,
        SUM(CASE WHEN l.status = 'delivered' THEN 1 ELSE 0 END) as deliveredCount
      FROM logistics l
      JOIN orders o ON l.order_id = o.id
      WHERE o.user_id = ?
    `, [userId]);

    res.json({
      stats: {
        total: parseInt(stats.totalShipments || 0),
        shipped: parseInt(stats.shippedCount || 0),
        inTransit: parseInt(stats.inTransitCount || 0),
        outForDelivery: parseInt(stats.outForDeliveryCount || 0),
        delivered: parseInt(stats.deliveredCount || 0)
      }
    });
  } catch (error) {
    console.error('获取物流统计错误:', error);
    res.status(500).json({
      error: '获取物流统计失败'
    });
  }
});

export default router; 