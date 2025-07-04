import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 注册
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('用户名至少3个字符'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
  body('email').isEmail().withMessage('邮箱格式不正确'),
  body('nickname').optional().isLength({ min: 1 }).withMessage('昵称不能为空')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const { username, password, email, nickname } = req.body;
    const db = getDatabase();

    // 检查用户名是否已存在
    const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(400).json({
        error: '用户名已存在'
      });
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await db.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existingEmail) {
        return res.status(400).json({
          error: '邮箱已被注册'
        });
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const userId = uuidv4();
    await db.run(`
      INSERT INTO users (id, username, email, password, nickname)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, username, email, hashedPassword, nickname || username]);

    // 生成JWT token
    const token = jwt.sign(
      { userId, username, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: userId,
        username,
        email,
        nickname: nickname || username,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      error: '注册失败，请稍后重试'
    });
  }
});

// 登录
router.post('/login', [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const { username, password } = req.body;
    const db = getDatabase();

    // 查找用户
    const user = await db.get(`
      SELECT id, username, email, password, nickname, role, status
      FROM users WHERE username = ?
    `, [username]);

    if (!user) {
      return res.status(401).json({
        error: '用户名或密码错误'
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({
        error: '账户已被禁用'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: '用户名或密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      error: '登录失败，请稍后重试'
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDatabase();

    const user = await db.get(`
      SELECT id, username, email, nickname, avatar, phone, role, status, created_at
      FROM users WHERE id = ?
    `, [decoded.userId]);

    if (!user) {
      return res.status(401).json({
        error: '用户不存在'
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({
        error: '账户已被禁用'
      });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: '无效的认证令牌'
      });
    }
    
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      error: '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/profile', [
  body('nickname').optional().isLength({ min: 1 }).withMessage('昵称不能为空'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('phone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确')
], async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { nickname, email, phone } = req.body;
    const db = getDatabase();

    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '输入验证失败',
        details: errors.array()
      });
    }

    // 检查邮箱是否被其他用户使用
    if (email) {
      const existingEmail = await db.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, decoded.userId]
      );
      if (existingEmail) {
        return res.status(400).json({
          error: '邮箱已被其他用户使用'
        });
      }
    }

    // 更新用户信息
    const updateFields = [];
    const updateValues = [];
    
    if (nickname) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(decoded.userId);

    if (updateFields.length > 1) {
      await db.run(`
        UPDATE users SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);
    }

    // 获取更新后的用户信息
    const user = await db.get(`
      SELECT id, username, email, nickname, avatar, phone, role, status, created_at
      FROM users WHERE id = ?
    `, [decoded.userId]);

    res.json({
      message: '用户信息更新成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: '无效的认证令牌'
      });
    }
    
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      error: '更新用户信息失败'
    });
  }
});

// 修改密码
router.put('/password', [
  body('oldPassword').notEmpty().withMessage('原密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6个字符')
], async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { oldPassword, newPassword } = req.body;
    const db = getDatabase();

    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '输入验证失败',
        details: errors.array()
      });
    }

    // 获取用户当前密码
    const user = await db.get('SELECT password FROM users WHERE id = ?', [decoded.userId]);
    if (!user) {
      return res.status(404).json({
        error: '用户不存在'
      });
    }

    // 验证原密码
    const isValidOldPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidOldPassword) {
      return res.status(400).json({
        error: '原密码错误'
      });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await db.run(`
      UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [hashedNewPassword, decoded.userId]);

    res.json({
      message: '密码修改成功'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: '无效的认证令牌'
      });
    }
    
    console.error('修改密码错误:', error);
    res.status(500).json({
      error: '修改密码失败'
    });
  }
});

export default router; 