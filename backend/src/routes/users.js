import express from 'express';
import jwt from 'jsonwebtoken';
import { body, param, validationResult, query } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const upload = multer({
  dest: path.join(process.cwd(), 'uploads/avatars/'),
  limits: { fileSize: 2 * 1024 * 1024 }
});

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

// 获取用户收货地址列表
router.get('/addresses', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    const addresses = await db.all(`
      SELECT 
        id,
        name,
        phone,
        province,
        city,
        district,
        detail_address,
        is_default,
        created_at
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `, [userId]);

    res.json({
      addresses: addresses.map(address => ({
        ...address,
        is_default: Boolean(address.is_default)
      }))
    });
  } catch (error) {
    console.error('获取收货地址错误:', error);
    res.status(500).json({
      error: '获取收货地址失败'
    });
  }
});

// 添加收货地址
router.post('/addresses', [
  body('name').notEmpty().withMessage('收货人姓名不能为空'),
  body('phone').notEmpty().withMessage('收货人电话不能为空'),
  body('province').notEmpty().withMessage('省份不能为空'),
  body('city').notEmpty().withMessage('城市不能为空'),
  body('district').notEmpty().withMessage('区县不能为空'),
  body('detailAddress').notEmpty().withMessage('详细地址不能为空'),
  body('isDefault').optional().isBoolean().withMessage('是否默认地址必须是布尔值')
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

    const { name, phone, province, city, district, detailAddress, isDefault } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault) {
      await db.run(`
        UPDATE addresses 
        SET is_default = 0
        WHERE user_id = ?
      `, [userId]);
    }

    // 添加新地址
    const addressId = uuidv4();
    await db.run(`
      INSERT INTO addresses (
        id, user_id, name, phone, province, city, district, 
        detail_address, is_default
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [addressId, userId, name, phone, province, city, district, detailAddress, isDefault ? 1 : 0]);

    res.status(201).json({
      message: '收货地址添加成功',
      addressId
    });
  } catch (error) {
    console.error('添加收货地址错误:', error);
    res.status(500).json({
      error: '添加收货地址失败'
    });
  }
});

// 更新收货地址
router.put('/addresses/:addressId', [
  param('addressId').isString().withMessage('地址ID必须是字符串'),
  body('name').notEmpty().withMessage('收货人姓名不能为空'),
  body('phone').notEmpty().withMessage('收货人电话不能为空'),
  body('province').notEmpty().withMessage('省份不能为空'),
  body('city').notEmpty().withMessage('城市不能为空'),
  body('district').notEmpty().withMessage('区县不能为空'),
  body('detailAddress').notEmpty().withMessage('详细地址不能为空'),
  body('isDefault').optional().isBoolean().withMessage('是否默认地址必须是布尔值')
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

    const { addressId } = req.params;
    const { name, phone, province, city, district, detailAddress, isDefault } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查地址是否存在且属于当前用户
    const address = await db.get(`
      SELECT id FROM addresses
      WHERE id = ? AND user_id = ?
    `, [addressId, userId]);

    if (!address) {
      return res.status(404).json({
        error: '收货地址不存在'
      });
    }

    // 如果设置为默认地址，先取消其他默认地址
    if (isDefault) {
      await db.run(`
        UPDATE addresses 
        SET is_default = 0
        WHERE user_id = ? AND id != ?
      `, [userId, addressId]);
    }

    // 更新地址
    await db.run(`
      UPDATE addresses 
      SET name = ?, phone = ?, province = ?, city = ?, district = ?,
          detail_address = ?, is_default = ?
      WHERE id = ?
    `, [name, phone, province, city, district, detailAddress, isDefault ? 1 : 0, addressId]);

    res.json({
      message: '收货地址更新成功'
    });
  } catch (error) {
    console.error('更新收货地址错误:', error);
    res.status(500).json({
      error: '更新收货地址失败'
    });
  }
});

// 删除收货地址
router.delete('/addresses/:addressId', [
  param('addressId').isString().withMessage('地址ID必须是字符串')
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

    const { addressId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查地址是否存在且属于当前用户
    const address = await db.get(`
      SELECT id FROM addresses
      WHERE id = ? AND user_id = ?
    `, [addressId, userId]);

    if (!address) {
      return res.status(404).json({
        error: '收货地址不存在'
      });
    }

    // 删除地址
    await db.run('DELETE FROM addresses WHERE id = ?', [addressId]);

    res.json({
      message: '收货地址删除成功'
    });
  } catch (error) {
    console.error('删除收货地址错误:', error);
    res.status(500).json({
      error: '删除收货地址失败'
    });
  }
});

// 设置默认收货地址
router.post('/addresses/:addressId/default', [
  param('addressId').isString().withMessage('地址ID必须是字符串')
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

    const { addressId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查地址是否存在且属于当前用户
    const address = await db.get(`
      SELECT id FROM addresses
      WHERE id = ? AND user_id = ?
    `, [addressId, userId]);

    if (!address) {
      return res.status(404).json({
        error: '收货地址不存在'
      });
    }

    // 取消其他默认地址
    await db.run(`
      UPDATE addresses 
      SET is_default = 0
      WHERE user_id = ?
    `, [userId]);

    // 设置当前地址为默认
    await db.run(`
      UPDATE addresses 
      SET is_default = 1
      WHERE id = ?
    `, [addressId]);

    res.json({
      message: '默认地址设置成功'
    });
  } catch (error) {
    console.error('设置默认地址错误:', error);
    res.status(500).json({
      error: '设置默认地址失败'
    });
  }
});

// 获取用户优惠券列表
router.get('/coupons', [
  query('status').optional().isIn(['unused', 'used', 'expired']).withMessage('优惠券状态无效')
], authenticateUser, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.userId;
    const db = getDatabase();

    // 构建查询条件
    let whereConditions = ['uc.user_id = ?'];
    let queryParams = [userId];

    if (status) {
      whereConditions.push('uc.status = ?');
      queryParams.push(status);
    }

    const coupons = await db.all(`
      SELECT 
        uc.id,
        uc.status,
        uc.used_at,
        uc.created_at,
        c.id as coupon_id,
        c.name,
        c.type,
        c.value,
        c.min_amount,
        c.start_date,
        c.end_date
      FROM user_coupons uc
      JOIN coupons c ON uc.coupon_id = c.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY uc.created_at DESC
    `, queryParams);

    // 处理优惠券数据
    const processedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      status: coupon.status,
      usedAt: coupon.used_at,
      createdAt: coupon.created_at,
      coupon: {
        id: coupon.coupon_id,
        name: coupon.name,
        type: coupon.type,
        value: parseFloat(coupon.value),
        minAmount: parseFloat(coupon.min_amount),
        startDate: coupon.start_date,
        endDate: coupon.end_date
      }
    }));

    res.json({
      coupons: processedCoupons
    });
  } catch (error) {
    console.error('获取用户优惠券错误:', error);
    res.status(500).json({
      error: '获取用户优惠券失败'
    });
  }
});

// 领取优惠券
router.post('/coupons/:couponId/claim', [
  param('couponId').isString().withMessage('优惠券ID必须是字符串')
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

    const { couponId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查优惠券是否存在且有效
    const coupon = await db.get(`
      SELECT id, name, total_count, used_count, status
      FROM coupons
      WHERE id = ? AND status = "active"
    `, [couponId]);

    if (!coupon) {
      return res.status(404).json({
        error: '优惠券不存在或已失效'
      });
    }

    // 检查优惠券是否已领完
    if (coupon.total_count > 0 && coupon.used_count >= coupon.total_count) {
      return res.status(400).json({
        error: '优惠券已被领完'
      });
    }

    // 检查用户是否已领取过该优惠券
    const existingUserCoupon = await db.get(`
      SELECT id FROM user_coupons
      WHERE user_id = ? AND coupon_id = ?
    `, [userId, couponId]);

    if (existingUserCoupon) {
      return res.status(400).json({
        error: '您已领取过该优惠券'
      });
    }

    // 领取优惠券
    const userCouponId = uuidv4();
    await db.run(`
      INSERT INTO user_coupons (id, user_id, coupon_id)
      VALUES (?, ?, ?)
    `, [userCouponId, userId, couponId]);

    // 更新优惠券领取数量
    await db.run(`
      UPDATE coupons 
      SET used_count = used_count + 1
      WHERE id = ?
    `, [couponId]);

    res.status(201).json({
      message: '优惠券领取成功',
      userCouponId
    });
  } catch (error) {
    console.error('领取优惠券错误:', error);
    res.status(500).json({
      error: '领取优惠券失败'
    });
  }
});

// 获取用户统计信息
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    // 获取订单统计
    const orderStats = await db.get(`
      SELECT 
        COUNT(*) as totalOrders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendingOrders,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paidOrders,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shippedOrders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as deliveredOrders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledOrders,
        SUM(total_amount) as totalSpent
      FROM orders
      WHERE user_id = ?
    `, [userId]);

    // 获取优惠券统计
    const couponStats = await db.get(`
      SELECT 
        COUNT(*) as totalCoupons,
        SUM(CASE WHEN status = 'unused' THEN 1 ELSE 0 END) as unusedCoupons,
        SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as usedCoupons
      FROM user_coupons
      WHERE user_id = ?
    `, [userId]);

    // 获取地址统计
    const addressStats = await db.get(`
      SELECT COUNT(*) as totalAddresses
      FROM addresses
      WHERE user_id = ?
    `, [userId]);

    res.json({
      orders: {
        total: parseInt(orderStats.totalOrders || 0),
        pending: parseInt(orderStats.pendingOrders || 0),
        paid: parseInt(orderStats.paidOrders || 0),
        shipped: parseInt(orderStats.shippedOrders || 0),
        delivered: parseInt(orderStats.deliveredOrders || 0),
        cancelled: parseInt(orderStats.cancelledOrders || 0),
        totalSpent: parseFloat(orderStats.totalSpent || 0).toFixed(2)
      },
      coupons: {
        total: parseInt(couponStats.totalCoupons || 0),
        unused: parseInt(couponStats.unusedCoupons || 0),
        used: parseInt(couponStats.usedCoupons || 0)
      },
      addresses: {
        total: parseInt(addressStats.totalAddresses || 0)
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      error: '获取用户统计失败'
    });
  }
});

// 获取当前用户资料
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, name, email, avatar, gender, birthday, type FROM users WHERE id = ?',
      [userId]
    );
    if (!user) return res.status(404).json({ code: 1, msg: '用户不存在' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ code: 1, msg: '获取用户信息失败' });
  }
});

// 更新当前用户资料
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, avatar, gender, birthday } = req.body;
    const db = getDatabase();
    await db.run(
      'UPDATE users SET name = ?, email = ?, avatar = ?, gender = ?, birthday = ? WHERE id = ?',
      [name, email, avatar, gender, birthday, userId]
    );
    res.json({ code: 0, msg: '更新成功' });
  } catch (e) {
    res.status(500).json({ code: 1, msg: '更新失败' });
  }
});

// 头像上传接口
router.post('/upload-avatar', authenticateUser, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ code: 1, msg: '未上传文件' });
  const ext = path.extname(req.file.originalname);
  const newName = req.file.filename + ext;
  const newPath = path.join(req.file.destination, newName);
  fs.renameSync(req.file.path, newPath);
  const url = `/uploads/avatars/${newName}`;
  res.json({ code: 0, url });
});

// 获取当前用户积分和等级
router.get('/points', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();
    const user = await db.get('SELECT points, level FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ code: 1, msg: '用户不存在' });
    // 假设每100积分升一级，最高10级
    const nextLevel = Math.min(user.level + 1, 10);
    const nextLevelPoints = nextLevel * 100;
    res.json({
      code: 0,
      data: {
        points: user.points,
        level: user.level,
        nextLevel,
        nextLevelPoints,
        progress: Math.min(user.points / nextLevelPoints, 1)
      }
    });
  } catch (e) {
    res.status(500).json({ code: 1, msg: '获取积分失败' });
  }
});

// 获取当前用户积分变动日志
router.get('/points-log', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();
    const logs = await db.all('SELECT change, type, description, created_at FROM points_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', [userId]);
    res.json({ code: 0, data: logs });
  } catch (e) {
    res.status(500).json({ code: 1, msg: '获取积分日志失败' });
  }
});

// 通用积分变动服务函数（可在下单、评价等业务中调用）
export async function addUserPoints(userId, change, type = 'other', description = '') {
  const db = getDatabase();
  // 写入积分日志
  await db.run('INSERT INTO points_log (user_id, change, type, description) VALUES (?, ?, ?, ?)', [userId, change, type, description]);
  // 更新用户积分
  const user = await db.get('SELECT points, level FROM users WHERE id = ?', [userId]);
  let newPoints = (user?.points || 0) + change;
  let newLevel = user?.level || 1;
  // 每100积分升一级，最高10级
  while (newPoints >= (newLevel + 1) * 100 && newLevel < 10) {
    newLevel++;
  }
  await db.run('UPDATE users SET points = ?, level = ? WHERE id = ?', [newPoints, newLevel, userId]);
}

// 每日签到接口
router.post('/sign-in', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();
    // 检查今天是否已签到
    const today = new Date().toISOString().slice(0, 10);
    const signed = await db.get('SELECT id FROM points_log WHERE user_id = ? AND type = ? AND date(created_at) = ?', [userId, 'sign_in', today]);
    if (signed) {
      return res.json({ code: 0, msg: '今日已签到', already: true });
    }
    // 签到加积分（如+2分）
    await addUserPoints(userId, 2, 'sign_in', '每日签到');
    res.json({ code: 0, msg: '签到成功', already: false });
  } catch (e) {
    res.status(500).json({ code: 1, msg: '签到失败' });
  }
});

// 积分兑换接口（示例：兑换优惠券或商品）
router.post('/exchange', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId, type } = req.body; // type: coupon/product
    const db = getDatabase();
    // 示例商品/优惠券配置
    const shopItems = [
      { id: 1, type: 'coupon', title: '10元优惠券', cost: 100 },
      { id: 2, type: 'coupon', title: '20元优惠券', cost: 180 },
      { id: 3, type: 'product', title: '限量周边公仔', cost: 300 },
      { id: 4, type: 'product', title: '精美贴纸包', cost: 80 },
    ];
    const item = shopItems.find(i => i.id === itemId && i.type === type);
    if (!item) return res.status(400).json({ code: 1, msg: '兑换项不存在' });
    // 查询用户积分
    const user = await db.get('SELECT points FROM users WHERE id = ?', [userId]);
    if (!user || user.points < item.cost) return res.status(400).json({ code: 1, msg: '积分不足' });
    // 扣除积分
    await addUserPoints(userId, -item.cost, 'exchange', `兑换${item.title}`);
    // 业务处理（如发放优惠券、发货等）
    // ...
    res.json({ code: 0, msg: `兑换成功，已消耗${item.cost}积分！` });
  } catch (e) {
    res.status(500).json({ code: 1, msg: '兑换失败' });
  }
});

// 获取用户消息通知列表
router.get('/notifications', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();
    const notifications = await db.all('SELECT id, title, content, created_at, read FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(notifications.map(n => ({
      ...n,
      read: !!n.read,
      createdAt: n.created_at
    })));
  } catch (e) {
    res.status(500).json({ message: '获取消息失败' });
  }
});

// 标记消息为已读
router.post('/notifications/read', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.body;
    const db = getDatabase();
    await db.run('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: '已标记为已读' });
  } catch (e) {
    res.status(500).json({ message: '操作失败' });
  }
});

export default router; 