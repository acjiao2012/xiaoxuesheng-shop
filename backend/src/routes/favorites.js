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

// 添加商品收藏
router.post('/add', [
  body('productId').isString().withMessage('商品ID必须是字符串')
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

    const { productId } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查商品是否存在
    const product = await db.get(`
      SELECT id, name, status
      FROM products
      WHERE id = ? AND status = "active"
    `, [productId]);

    if (!product) {
      return res.status(404).json({
        error: '商品不存在或已下架'
      });
    }

    // 检查是否已收藏
    const existingFavorite = await db.get(`
      SELECT id FROM favorites
      WHERE user_id = ? AND product_id = ?
    `, [userId, productId]);

    if (existingFavorite) {
      return res.status(400).json({
        error: '商品已在收藏列表中'
      });
    }

    // 添加收藏
    const favoriteId = uuidv4();
    await db.run(`
      INSERT INTO favorites (id, user_id, product_id)
      VALUES (?, ?, ?)
    `, [favoriteId, userId, productId]);

    res.status(201).json({
      message: '收藏成功',
      favoriteId
    });
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({
      error: '添加收藏失败'
    });
  }
});

// 取消商品收藏
router.delete('/remove/:productId', [
  param('productId').isString().withMessage('商品ID必须是字符串')
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

    const { productId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查收藏是否存在
    const favorite = await db.get(`
      SELECT id FROM favorites
      WHERE user_id = ? AND product_id = ?
    `, [userId, productId]);

    if (!favorite) {
      return res.status(404).json({
        error: '收藏记录不存在'
      });
    }

    // 删除收藏
    await db.run(`
      DELETE FROM favorites
      WHERE user_id = ? AND product_id = ?
    `, [userId, productId]);

    res.json({
      message: '取消收藏成功'
    });
  } catch (error) {
    console.error('取消收藏错误:', error);
    res.status(500).json({
      error: '取消收藏失败'
    });
  }
});

// 获取用户收藏列表
router.get('/list', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间')
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

    const { page = 1, limit = 12 } = req.query;
    const userId = req.user.userId;
    const db = getDatabase();
    const offset = (page - 1) * limit;

    // 查询收藏总数
    const countResult = await db.get(`
      SELECT COUNT(*) as total
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      WHERE f.user_id = ? AND p.status = "active"
    `, [userId]);
    const total = countResult.total;

    // 查询收藏列表
    const favorites = await db.all(`
      SELECT 
        f.id as favorite_id,
        f.created_at as favorite_time,
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.price,
        p.original_price,
        p.images,
        p.stock,
        p.sales,
        p.rating,
        p.review_count,
        c.name as category_name
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE f.user_id = ? AND p.status = "active"
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    // 处理收藏数据
    const processedFavorites = favorites.map(favorite => ({
      id: favorite.favorite_id,
      favoriteTime: favorite.favorite_time,
      product: {
        id: favorite.product_id,
        name: favorite.product_name,
        description: favorite.product_description,
        price: parseFloat(favorite.price),
        originalPrice: favorite.original_price ? parseFloat(favorite.original_price) : null,
        images: JSON.parse(favorite.images || '[]'),
        stock: parseInt(favorite.stock),
        sales: parseInt(favorite.sales),
        rating: parseFloat(favorite.rating),
        reviewCount: parseInt(favorite.review_count),
        categoryName: favorite.category_name
      }
    }));

    res.json({
      favorites: processedFavorites,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({
      error: '获取收藏列表失败'
    });
  }
});

// 检查商品是否已收藏
router.get('/check/:productId', [
  param('productId').isString().withMessage('商品ID必须是字符串')
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

    const { productId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    const favorite = await db.get(`
      SELECT id, created_at
      FROM favorites
      WHERE user_id = ? AND product_id = ?
    `, [userId, productId]);

    res.json({
      isFavorited: !!favorite,
      favoriteTime: favorite ? favorite.created_at : null
    });
  } catch (error) {
    console.error('检查收藏状态错误:', error);
    res.status(500).json({
      error: '检查收藏状态失败'
    });
  }
});

// 批量取消收藏
router.post('/batch-remove', [
  body('productIds').isArray().withMessage('商品ID列表必须是数组'),
  body('productIds.*').isString().withMessage('商品ID必须是字符串')
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

    const { productIds } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    if (productIds.length === 0) {
      return res.status(400).json({
        error: '请选择要取消收藏的商品'
      });
    }

    // 批量删除收藏
    const placeholders = productIds.map(() => '?').join(',');
    await db.run(`
      DELETE FROM favorites 
      WHERE user_id = ? AND product_id IN (${placeholders})
    `, [userId, ...productIds]);

    res.json({
      message: '批量取消收藏成功',
      removedCount: productIds.length
    });
  } catch (error) {
    console.error('批量取消收藏错误:', error);
    res.status(500).json({
      error: '批量取消收藏失败'
    });
  }
});

// 获取收藏统计
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    const stats = await db.get(`
      SELECT COUNT(*) as total_favorites
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      WHERE f.user_id = ? AND p.status = "active"
    `, [userId]);

    res.json({
      stats: {
        totalFavorites: parseInt(stats.total_favorites || 0)
      }
    });
  } catch (error) {
    console.error('获取收藏统计错误:', error);
    res.status(500).json({
      error: '获取收藏统计失败'
    });
  }
});

// 获取推荐商品（基于收藏）
router.get('/recommendations', [
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('推荐数量必须在1-20之间')
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

    const { limit = 6 } = req.query;
    const userId = req.user.userId;
    const db = getDatabase();

    // 获取用户收藏的商品分类
    const favoriteCategories = await db.all(`
      SELECT DISTINCT p.category_id
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      WHERE f.user_id = ? AND p.status = "active"
    `, [userId]);

    if (favoriteCategories.length === 0) {
      // 如果没有收藏，返回热门商品
      const popularProducts = await db.all(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price,
          p.original_price,
          p.images,
          p.stock,
          p.sales,
          p.rating,
          p.review_count,
          c.name as category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = "active"
        ORDER BY p.sales DESC, p.rating DESC
        LIMIT ?
      `, [limit]);

      const processedProducts = popularProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        originalPrice: product.original_price ? parseFloat(product.original_price) : null,
        images: JSON.parse(product.images || '[]'),
        stock: parseInt(product.stock),
        sales: parseInt(product.sales),
        rating: parseFloat(product.rating),
        reviewCount: parseInt(product.review_count),
        categoryName: product.category_name
      }));

      return res.json({
        products: processedProducts,
        type: 'popular'
      });
    }

    // 基于收藏分类推荐商品
    const categoryIds = favoriteCategories.map(cat => cat.category_id);
    const placeholders = categoryIds.map(() => '?').join(',');
    
    const recommendedProducts = await db.all(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.images,
        p.stock,
        p.sales,
        p.rating,
        p.review_count,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = "active" 
        AND p.category_id IN (${placeholders})
        AND p.id NOT IN (
          SELECT product_id FROM favorites WHERE user_id = ?
        )
      ORDER BY p.rating DESC, p.sales DESC
      LIMIT ?
    `, [...categoryIds, userId, limit]);

    const processedProducts = recommendedProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      originalPrice: product.original_price ? parseFloat(product.original_price) : null,
      images: JSON.parse(product.images || '[]'),
      stock: parseInt(product.stock),
      sales: parseInt(product.sales),
      rating: parseFloat(product.rating),
      reviewCount: parseInt(product.review_count),
      categoryName: product.category_name
    }));

    res.json({
      products: processedProducts,
      type: 'favorite_based'
    });
  } catch (error) {
    console.error('获取推荐商品错误:', error);
    res.status(500).json({
      error: '获取推荐商品失败'
    });
  }
});

export default router; 