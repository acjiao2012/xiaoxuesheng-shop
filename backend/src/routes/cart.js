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

// 获取购物车列表
router.get('/', authenticateUser, async (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.userId;

    const cartItems = await db.all(`
      SELECT 
        ci.id,
        ci.quantity,
        ci.created_at,
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.price,
        p.original_price,
        p.images,
        p.stock,
        p.status as product_status
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = "active"
      ORDER BY ci.created_at DESC
    `, [userId]);

    // 处理购物车数据
    const processedItems = cartItems.map(item => ({
      id: item.id,
      quantity: parseInt(item.quantity),
      product: {
        id: item.product_id,
        name: item.product_name,
        description: item.product_description,
        price: parseFloat(item.price),
        original_price: item.original_price ? parseFloat(item.original_price) : null,
        images: JSON.parse(item.images || '[]'),
        stock: parseInt(item.stock),
        status: item.product_status
      },
      subtotal: parseFloat(item.price) * parseInt(item.quantity),
      created_at: item.created_at
    }));

    // 计算总计
    const total = processedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const totalQuantity = processedItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      items: processedItems,
      total: parseFloat(total.toFixed(2)),
      totalQuantity,
      itemCount: processedItems.length
    });
  } catch (error) {
    console.error('获取购物车错误:', error);
    res.status(500).json({
      error: '获取购物车失败'
    });
  }
});

// 添加商品到购物车
router.post('/add', [
  body('productId').isString().withMessage('商品ID必须是字符串'),
  body('quantity').isInt({ min: 1 }).withMessage('数量必须是正整数')
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

    const { productId, quantity } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查商品是否存在且有效
    const product = await db.get(`
      SELECT id, name, price, stock, status
      FROM products
      WHERE id = ? AND status = "active"
    `, [productId]);

    if (!product) {
      return res.status(404).json({
        error: '商品不存在或已下架'
      });
    }

    // 检查库存
    if (product.stock < quantity) {
      return res.status(400).json({
        error: '商品库存不足'
      });
    }

    // 检查购物车中是否已存在该商品
    const existingItem = await db.get(`
      SELECT id, quantity FROM cart_items
      WHERE user_id = ? AND product_id = ?
    `, [userId, productId]);

    if (existingItem) {
      // 更新数量
      const newQuantity = existingItem.quantity + quantity;
      
      // 再次检查库存
      if (product.stock < newQuantity) {
        return res.status(400).json({
          error: '商品库存不足'
        });
      }

      await db.run(`
        UPDATE cart_items 
        SET quantity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newQuantity, existingItem.id]);

      res.json({
        message: '购物车商品数量已更新',
        cartItemId: existingItem.id,
        quantity: newQuantity
      });
    } else {
      // 添加新商品到购物车
      const cartItemId = uuidv4();
      await db.run(`
        INSERT INTO cart_items (id, user_id, product_id, quantity)
        VALUES (?, ?, ?, ?)
      `, [cartItemId, userId, productId, quantity]);

      res.status(201).json({
        message: '商品已添加到购物车',
        cartItemId,
        quantity
      });
    }
  } catch (error) {
    console.error('添加购物车错误:', error);
    res.status(500).json({
      error: '添加购物车失败'
    });
  }
});

// 更新购物车商品数量
router.put('/:itemId/quantity', [
  param('itemId').isString().withMessage('购物车项ID必须是字符串'),
  body('quantity').isInt({ min: 1 }).withMessage('数量必须是正整数')
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

    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查购物车项是否存在且属于当前用户
    const cartItem = await db.get(`
      SELECT ci.id, ci.quantity, p.stock, p.name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.id = ? AND ci.user_id = ? AND p.status = "active"
    `, [itemId, userId]);

    if (!cartItem) {
      return res.status(404).json({
        error: '购物车项不存在'
      });
    }

    // 检查库存
    if (cartItem.stock < quantity) {
      return res.status(400).json({
        error: `商品"${cartItem.name}"库存不足，当前库存: ${cartItem.stock}`
      });
    }

    // 更新数量
    await db.run(`
      UPDATE cart_items 
      SET quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [quantity, itemId]);

    res.json({
      message: '购物车商品数量已更新',
      quantity
    });
  } catch (error) {
    console.error('更新购物车数量错误:', error);
    res.status(500).json({
      error: '更新购物车数量失败'
    });
  }
});

// 删除购物车商品
router.delete('/:itemId', [
  param('itemId').isString().withMessage('购物车项ID必须是字符串')
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

    const { itemId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查购物车项是否存在且属于当前用户
    const cartItem = await db.get(`
      SELECT id FROM cart_items
      WHERE id = ? AND user_id = ?
    `, [itemId, userId]);

    if (!cartItem) {
      return res.status(404).json({
        error: '购物车项不存在'
      });
    }

    // 删除购物车项
    await db.run('DELETE FROM cart_items WHERE id = ?', [itemId]);

    res.json({
      message: '购物车商品已删除'
    });
  } catch (error) {
    console.error('删除购物车商品错误:', error);
    res.status(500).json({
      error: '删除购物车商品失败'
    });
  }
});

// 清空购物车
router.delete('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    await db.run('DELETE FROM cart_items WHERE user_id = ?', [userId]);

    res.json({
      message: '购物车已清空'
    });
  } catch (error) {
    console.error('清空购物车错误:', error);
    res.status(500).json({
      error: '清空购物车失败'
    });
  }
});

// 批量删除购物车商品
router.post('/batch-delete', [
  body('itemIds').isArray().withMessage('商品ID列表必须是数组'),
  body('itemIds.*').isString().withMessage('商品ID必须是字符串')
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

    const { itemIds } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    if (itemIds.length === 0) {
      return res.status(400).json({
        error: '请选择要删除的商品'
      });
    }

    // 删除指定的购物车项
    const placeholders = itemIds.map(() => '?').join(',');
    await db.run(`
      DELETE FROM cart_items 
      WHERE id IN (${placeholders}) AND user_id = ?
    `, [...itemIds, userId]);

    res.json({
      message: '选中的商品已从购物车删除',
      deletedCount: itemIds.length
    });
  } catch (error) {
    console.error('批量删除购物车商品错误:', error);
    res.status(500).json({
      error: '批量删除购物车商品失败'
    });
  }
});

// 获取购物车统计信息
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    const stats = await db.get(`
      SELECT 
        COUNT(*) as itemCount,
        SUM(ci.quantity) as totalQuantity,
        SUM(ci.quantity * p.price) as totalAmount
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ? AND p.status = "active"
    `, [userId]);

    res.json({
      itemCount: parseInt(stats.itemCount || 0),
      totalQuantity: parseInt(stats.totalQuantity || 0),
      totalAmount: parseFloat(stats.totalAmount || 0).toFixed(2)
    });
  } catch (error) {
    console.error('获取购物车统计错误:', error);
    res.status(500).json({
      error: '获取购物车统计失败'
    });
  }
});

export default router; 