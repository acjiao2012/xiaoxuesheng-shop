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

// 模拟支付配置
const PAYMENT_CONFIG = {
  alipay: {
    appId: process.env.ALIPAY_APP_ID || 'mock_alipay_app_id',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || 'mock_private_key',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || 'mock_public_key',
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipaydev.com/gateway.do'
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID || 'mock_wechat_app_id',
    mchId: process.env.WECHAT_MCH_ID || 'mock_mch_id',
    apiKey: process.env.WECHAT_API_KEY || 'mock_api_key'
  }
};

// 创建支付订单
router.post('/create', [
  body('orderId').isString().withMessage('订单ID必须是字符串'),
  body('paymentMethod').isIn(['alipay', 'wechat', 'balance']).withMessage('支付方式无效'),
  body('amount').isFloat({ min: 0.01 }).withMessage('支付金额必须大于0')
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

    const { orderId, paymentMethod, amount } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查订单是否存在且属于当前用户
    const order = await db.get(`
      SELECT id, order_no, total_amount, status, payment_status
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
        error: '订单状态不允许支付'
      });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        error: '订单已支付'
      });
    }

    if (Math.abs(order.total_amount - amount) > 0.01) {
      return res.status(400).json({
        error: '支付金额与订单金额不匹配'
      });
    }

    // 创建支付记录
    const paymentId = uuidv4();
    const paymentNo = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    await db.run(`
      INSERT INTO payments (
        id, order_id, user_id, payment_no, amount, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [paymentId, orderId, userId, paymentNo, amount, paymentMethod, 'pending']);

    // 根据支付方式生成支付参数
    let paymentData = {};
    
    switch (paymentMethod) {
      case 'alipay':
        paymentData = {
          paymentUrl: `https://openapi.alipaydev.com/gateway.do?app_id=${PAYMENT_CONFIG.alipay.appId}&method=alipay.trade.page.pay&format=json&charset=utf-8&sign_type=RSA2&timestamp=${new Date().toISOString()}&version=1.0&notify_url=${process.env.BASE_URL}/api/payment/alipay/notify&return_url=${process.env.FRONTEND_URL}/payment/result&biz_content=${encodeURIComponent(JSON.stringify({
            out_trade_no: paymentNo,
            product_code: 'FAST_INSTANT_TRADE_PAY',
            total_amount: amount,
            subject: `订单${order.order_no}`,
            body: '小学生手办商城'
          }))}`,
          paymentNo,
          amount
        };
        break;
        
      case 'wechat':
        paymentData = {
          paymentUrl: `weixin://wxpay/bizpayurl?pr=${paymentNo}`,
          paymentNo,
          amount,
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==` // 模拟二维码
        };
        break;
        
      case 'balance':
        // 余额支付直接处理
        await processBalancePayment(db, paymentId, userId, amount);
        paymentData = {
          success: true,
          message: '余额支付成功'
        };
        break;
    }

    res.json({
      message: '支付订单创建成功',
      paymentId,
      paymentNo,
      paymentData
    });
  } catch (error) {
    console.error('创建支付订单错误:', error);
    res.status(500).json({
      error: '创建支付订单失败'
    });
  }
});

// 处理余额支付
async function processBalancePayment(db, paymentId, userId, amount) {
  // 开始事务
  await db.run('BEGIN TRANSACTION');
  
  try {
    // 检查用户余额
    const user = await db.get('SELECT balance FROM users WHERE id = ?', [userId]);
    if (!user || user.balance < amount) {
      throw new Error('余额不足');
    }

    // 扣除余额
    await db.run(`
      UPDATE users 
      SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [amount, userId]);

    // 更新支付状态
    await db.run(`
      UPDATE payments 
      SET status = 'success', paid_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [paymentId]);

    // 获取订单信息
    const payment = await db.get(`
      SELECT order_id FROM payments WHERE id = ?
    `, [paymentId]);

    // 更新订单状态
    await db.run(`
      UPDATE orders 
      SET status = 'paid', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [payment.order_id]);

    // 提交事务
    await db.run('COMMIT');
  } catch (error) {
    // 回滚事务
    await db.run('ROLLBACK');
    throw error;
  }
}

// 支付回调处理
router.post('/callback/:paymentMethod', [
  param('paymentMethod').isIn(['alipay', 'wechat']).withMessage('支付方式无效')
], async (req, res) => {
  try {
    const { paymentMethod } = req.params;
    const { payment_no, status, amount } = req.body;
    const db = getDatabase();

    // 验证支付回调
    if (!verifyPaymentCallback(paymentMethod, req.body)) {
      return res.status(400).json({
        error: '支付回调验证失败'
      });
    }

    // 查找支付记录
    const payment = await db.get(`
      SELECT id, order_id, user_id, amount, status
      FROM payments
      WHERE payment_no = ?
    `, [payment_no]);

    if (!payment) {
      return res.status(404).json({
        error: '支付记录不存在'
      });
    }

    if (payment.status === 'success') {
      return res.json({ message: '支付已处理' });
    }

    if (status === 'success' && Math.abs(payment.amount - amount) < 0.01) {
      // 开始事务
      await db.run('BEGIN TRANSACTION');
      
      try {
        // 更新支付状态
        await db.run(`
          UPDATE payments 
          SET status = 'success', paid_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [payment.id]);

        // 更新订单状态
        await db.run(`
          UPDATE orders 
          SET status = 'paid', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [payment.order_id]);

        // 提交事务
        await db.run('COMMIT');

        res.json({ message: '支付成功' });
      } catch (error) {
        // 回滚事务
        await db.run('ROLLBACK');
        throw error;
      }
    } else {
      // 支付失败
      await db.run(`
        UPDATE payments 
        SET status = 'failed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [payment.id]);

      res.json({ message: '支付失败' });
    }
  } catch (error) {
    console.error('支付回调处理错误:', error);
    res.status(500).json({
      error: '支付回调处理失败'
    });
  }
});

// 验证支付回调（模拟）
function verifyPaymentCallback(paymentMethod, callbackData) {
  // 实际项目中需要根据支付平台的签名验证规则进行验证
  console.log(`${paymentMethod} 支付回调验证:`, callbackData);
  return true; // 模拟验证成功
}

// 查询支付状态
router.get('/status/:paymentId', [
  param('paymentId').isString().withMessage('支付ID必须是字符串')
], authenticateUser, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    const payment = await db.get(`
      SELECT p.id, p.payment_no, p.amount, p.payment_method, p.status, p.paid_at,
             o.order_no, o.status as order_status
      FROM payments p
      JOIN orders o ON p.order_id = o.id
      WHERE p.id = ? AND p.user_id = ?
    `, [paymentId, userId]);

    if (!payment) {
      return res.status(404).json({
        error: '支付记录不存在'
      });
    }

    res.json({
      payment: {
        id: payment.id,
        paymentNo: payment.payment_no,
        amount: parseFloat(payment.amount),
        paymentMethod: payment.payment_method,
        status: payment.status,
        paidAt: payment.paid_at,
        orderNo: payment.order_no,
        orderStatus: payment.order_status
      }
    });
  } catch (error) {
    console.error('查询支付状态错误:', error);
    res.status(500).json({
      error: '查询支付状态失败'
    });
  }
});

// 申请退款
router.post('/refund', [
  body('orderId').isString().withMessage('订单ID必须是字符串'),
  body('reason').notEmpty().withMessage('退款原因不能为空'),
  body('amount').isFloat({ min: 0.01 }).withMessage('退款金额必须大于0')
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

    const { orderId, reason, amount } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查订单是否存在且属于当前用户
    const order = await db.get(`
      SELECT id, order_no, total_amount, status, payment_status
      FROM orders
      WHERE id = ? AND user_id = ?
    `, [orderId, userId]);

    if (!order) {
      return res.status(404).json({
        error: '订单不存在'
      });
    }

    if (order.payment_status !== 'paid') {
      return res.status(400).json({
        error: '订单未支付，无法申请退款'
      });
    }

    if (amount > order.total_amount) {
      return res.status(400).json({
        error: '退款金额不能超过订单金额'
      });
    }

    // 创建退款记录
    const refundId = uuidv4();
    const refundNo = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    await db.run(`
      INSERT INTO refunds (
        id, order_id, user_id, refund_no, amount, reason, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [refundId, orderId, userId, refundNo, amount, reason, 'pending']);

    res.status(201).json({
      message: '退款申请提交成功',
      refundId,
      refundNo
    });
  } catch (error) {
    console.error('申请退款错误:', error);
    res.status(500).json({
      error: '申请退款失败'
    });
  }
});

export default router; 