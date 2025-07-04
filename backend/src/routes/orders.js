import express from 'express';
import jwt from 'jsonwebtoken';
import { body, param, query, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';
import { addUserPoints } from './users.js'

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

// 生成订单号
function generateOrderNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${month}${day}${random}`;
}

// 创建订单
router.post('/create', [
  body('items').isArray().withMessage('商品列表必须是数组'),
  body('items.*.productId').isString().withMessage('商品ID必须是字符串'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('数量必须是正整数'),
  body('shippingAddress').isObject().withMessage('收货地址必须是对象'),
  body('shippingAddress.name').notEmpty().withMessage('收货人姓名不能为空'),
  body('shippingAddress.phone').notEmpty().withMessage('收货人电话不能为空'),
  body('shippingAddress.address').notEmpty().withMessage('收货地址不能为空'),
  body('remark').optional().isString().withMessage('备注必须是字符串'),
  body('couponId').optional().isString().withMessage('优惠券ID必须是字符串')
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

    const { items, shippingAddress, remark, couponId } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    if (items.length === 0) {
      return res.status(400).json({
        error: '订单商品不能为空'
      });
    }

    // 开始事务
    await db.run('BEGIN TRANSACTION');

    try {
      // 验证商品和库存
      const orderItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const product = await db.get(`
          SELECT id, name, price, stock, images, status
          FROM products
          WHERE id = ? AND status = "active"
        `, [item.productId]);

        if (!product) {
          throw new Error(`商品"${item.productId}"不存在或已下架`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`商品"${product.name}"库存不足，当前库存: ${product.stock}`);
        }

        // 更新库存
        await db.run(`
          UPDATE products 
          SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [item.quantity, item.productId]);

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          productImage: JSON.parse(product.images || '[]')[0] || '',
          price: product.price,
          quantity: item.quantity,
          subtotal
        });
      }

      // 处理优惠券
      let discountAmount = 0;
      if (couponId) {
        const coupon = await db.get(`
          SELECT c.*, uc.status as user_coupon_status
          FROM coupons c
          LEFT JOIN user_coupons uc ON c.id = uc.coupon_id AND uc.user_id = ?
          WHERE c.id = ? AND c.status = "active"
        `, [userId, couponId]);

        if (!coupon) {
          throw new Error('优惠券不存在或已失效');
        }

        if (coupon.user_coupon_status === 'used') {
          throw new Error('优惠券已被使用');
        }

        if (totalAmount < coupon.min_amount) {
          throw new Error(`订单金额不足，无法使用该优惠券，最低消费: ¥${coupon.min_amount}`);
        }

        discountAmount = Math.min(coupon.value, totalAmount);
      }

      // 计算运费（这里简化为满99包邮）
      const shippingFee = totalAmount >= 99 ? 0 : 10;

      // 计算最终金额
      const finalAmount = totalAmount - discountAmount + shippingFee;

      // 创建订单
      const orderId = uuidv4();
      const orderNo = generateOrderNo();

      await db.run(`
        INSERT INTO orders (
          id, user_id, order_no, total_amount, shipping_fee, 
          discount_amount, shipping_address, shipping_phone, 
          shipping_name, remark, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId, userId, orderNo, finalAmount, shippingFee,
        discountAmount, shippingAddress.address, shippingAddress.phone,
        shippingAddress.name, remark || '', 'pending'
      ]);

      // 创建订单详情
      for (const item of orderItems) {
        await db.run(`
          INSERT INTO order_items (
            id, order_id, product_id, product_name, product_image,
            price, quantity, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(), orderId, item.productId, item.productName,
          item.productImage, item.price, item.quantity, item.subtotal
        ]);
      }

      // 使用优惠券
      if (couponId) {
        await db.run(`
          UPDATE user_coupons 
          SET status = "used", used_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND coupon_id = ?
        `, [userId, couponId]);
      }

      // 清空购物车中的已购买商品
      const productIds = items.map(item => item.productId);
      const placeholders = productIds.map(() => '?').join(',');
      await db.run(`
        DELETE FROM cart_items 
        WHERE user_id = ? AND product_id IN (${placeholders})
      `, [userId, ...productIds]);

      // 提交事务
      await db.run('COMMIT');

      // 下单成功加积分（如每单+10分）
      try {
        await addUserPoints(userId, 10, 'order', '下单获得积分');
      } catch (e) { /* 忽略积分异常 */ }

      res.status(201).json({
        message: '订单创建成功',
        order: {
          id: orderId,
          orderNo,
          totalAmount: finalAmount,
          shippingFee,
          discountAmount,
          status: 'pending'
        }
      });
    } catch (error) {
      // 回滚事务
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      error: error.message || '创建订单失败'
    });
  }
});

// 获取订单列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间'),
  query('status').optional().isIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled']).withMessage('订单状态无效')
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
    let whereConditions = ['o.user_id = ?'];
    let queryParams = [userId];

    if (status) {
      whereConditions.push('o.status = ?');
      queryParams.push(status);
    }

    // 查询订单总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await db.get(countQuery, queryParams);
    const total = countResult.total;

    // 查询订单列表
    const ordersQuery = `
      SELECT 
        o.id,
        o.order_no,
        o.total_amount,
        o.shipping_fee,
        o.discount_amount,
        o.status,
        o.payment_status,
        o.shipping_status,
        o.shipping_name,
        o.shipping_phone,
        o.shipping_address,
        o.remark,
        o.created_at,
        o.updated_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const orders = await db.all(ordersQuery, [...queryParams, limit, offset]);

    // 获取每个订单的商品信息
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db.all(`
          SELECT 
            oi.id,
            oi.product_id,
            oi.product_name,
            oi.product_image,
            oi.price,
            oi.quantity,
            oi.subtotal
          FROM order_items oi
          WHERE oi.order_id = ?
        `, [order.id]);

        return {
          ...order,
          total_amount: parseFloat(order.total_amount),
          shipping_fee: parseFloat(order.shipping_fee),
          discount_amount: parseFloat(order.discount_amount),
          item_count: parseInt(order.item_count),
          items: items.map(item => ({
            ...item,
            price: parseFloat(item.price),
            subtotal: parseFloat(item.subtotal)
          }))
        };
      })
    );

    res.json({
      orders: ordersWithItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      error: '获取订单列表失败'
    });
  }
});

// 获取订单详情
router.get('/:orderId', [
  param('orderId').isString().withMessage('订单ID必须是字符串')
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
    const userId = req.user.userId;
    const db = getDatabase();

    // 查询订单详情
    const order = await db.get(`
      SELECT 
        id,
        order_no,
        total_amount,
        shipping_fee,
        discount_amount,
        status,
        payment_status,
        shipping_status,
        shipping_name,
        shipping_phone,
        shipping_address,
        remark,
        created_at,
        updated_at
      FROM orders
      WHERE id = ? AND user_id = ?
    `, [orderId, userId]);

    if (!order) {
      return res.status(404).json({
        error: '订单不存在'
      });
    }

    // 查询订单商品
    const items = await db.all(`
      SELECT 
        id,
        product_id,
        product_name,
        product_image,
        price,
        quantity,
        subtotal
      FROM order_items
      WHERE order_id = ?
    `, [orderId]);

    res.json({
      order: {
        ...order,
        total_amount: parseFloat(order.total_amount),
        shipping_fee: parseFloat(order.shipping_fee),
        discount_amount: parseFloat(order.discount_amount),
        items: items.map(item => ({
          ...item,
          price: parseFloat(item.price),
          subtotal: parseFloat(item.subtotal)
        }))
      }
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      error: '获取订单详情失败'
    });
  }
});

// 取消订单
router.post('/:orderId/cancel', [
  param('orderId').isString().withMessage('订单ID必须是字符串')
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
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查订单是否存在且属于当前用户
    const order = await db.get(`
      SELECT id, status, payment_status
      FROM orders
      WHERE id = ? AND user_id = ?
    `, [orderId, userId]);

    if (!order) {
      return res.status(404).json({
        error: '订单不存在'
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        error: '只能取消待付款的订单'
      });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        error: '已付款的订单不能取消'
      });
    }

    // 开始事务
    await db.run('BEGIN TRANSACTION');

    try {
      // 更新订单状态
      await db.run(`
        UPDATE orders 
        SET status = "cancelled", updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [orderId]);

      // 恢复商品库存
      const items = await db.all(`
        SELECT product_id, quantity
        FROM order_items
        WHERE order_id = ?
      `, [orderId]);

      for (const item of items) {
        await db.run(`
          UPDATE products 
          SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [item.quantity, item.product_id]);
      }

      // 提交事务
      await db.run('COMMIT');

      res.json({
        message: '订单已取消'
      });
    } catch (error) {
      // 回滚事务
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('取消订单错误:', error);
    res.status(500).json({
      error: error.message || '取消订单失败'
    });
  }
});

// 确认收货
router.post('/:orderId/confirm', [
  param('orderId').isString().withMessage('订单ID必须是字符串')
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
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查订单是否存在且属于当前用户
    const order = await db.get(`
      SELECT id, status, shipping_status
      FROM orders
      WHERE id = ? AND user_id = ?
    `, [orderId, userId]);

    if (!order) {
      return res.status(404).json({
        error: '订单不存在'
      });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({
        error: '只能确认已发货的订单'
      });
    }

    // 更新订单状态
    await db.run(`
      UPDATE orders 
      SET status = "delivered", shipping_status = "delivered", updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [orderId]);

    res.json({
      message: '订单已确认收货'
    });
  } catch (error) {
    console.error('确认收货错误:', error);
    res.status(500).json({
      error: '确认收货失败'
    });
  }
});

export default router; 