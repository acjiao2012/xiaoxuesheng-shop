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

// 创建商品评价
router.post('/', [
  body('productId').isString().withMessage('商品ID必须是字符串'),
  body('orderId').isString().withMessage('订单ID必须是字符串'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
  body('content').isLength({ min: 5, max: 500 }).withMessage('评价内容长度必须在5-500字符之间'),
  body('images').optional().isArray().withMessage('图片必须是数组'),
  body('images.*').isString().withMessage('图片URL必须是字符串')
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

    const { productId, orderId, rating, content, images = [] } = req.body;
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

    if (order.status !== 'delivered' && order.shipping_status !== 'delivered') {
      return res.status(400).json({
        error: '订单未完成，无法评价'
      });
    }

    // 检查订单中是否包含该商品
    const orderItem = await db.get(`
      SELECT id FROM order_items
      WHERE order_id = ? AND product_id = ?
    `, [orderId, productId]);

    if (!orderItem) {
      return res.status(400).json({
        error: '订单中不包含该商品'
      });
    }

    // 检查是否已评价过
    const existingReview = await db.get(`
      SELECT id FROM reviews
      WHERE user_id = ? AND product_id = ? AND order_id = ?
    `, [userId, productId, orderId]);

    if (existingReview) {
      return res.status(400).json({
        error: '您已评价过该商品'
      });
    }

    // 创建评价
    const reviewId = uuidv4();
    await db.run(`
      INSERT INTO reviews (
        id, user_id, product_id, order_id, rating, content, images
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [reviewId, userId, productId, orderId, rating, content, JSON.stringify(images)]);

    // 更新商品评分和评价数量
    await updateProductRating(db, productId);

    // 评价成功加积分（如每次+5分）
    try {
      await addUserPoints(userId, 5, 'review', '评价获得积分');
    } catch (e) { /* 忽略积分异常 */ }

    res.status(201).json({
      message: '评价提交成功',
      reviewId
    });
  } catch (error) {
    console.error('创建评价错误:', error);
    res.status(500).json({
      error: '创建评价失败'
    });
  }
});

// 更新商品评分
async function updateProductRating(db, productId) {
  const ratingStats = await db.get(`
    SELECT 
      AVG(rating) as avg_rating,
      COUNT(*) as review_count
    FROM reviews
    WHERE product_id = ?
  `, [productId]);

  await db.run(`
    UPDATE products 
    SET rating = ?, review_count = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [ratingStats.avg_rating || 0, ratingStats.review_count || 0, productId]);
}

// 获取商品评价列表
router.get('/product/:productId', [
  param('productId').isString().withMessage('商品ID必须是字符串'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('评分过滤必须在1-5之间'),
  query('sort').optional().isIn(['latest', 'rating_desc', 'rating_asc']).withMessage('排序方式无效')
], async (req, res) => {
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
    const { page = 1, limit = 10, rating, sort = 'latest' } = req.query;
    const db = getDatabase();
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereConditions = ['r.product_id = ?'];
    let queryParams = [productId];

    if (rating) {
      whereConditions.push('r.rating = ?');
      queryParams.push(rating);
    }

    // 构建排序
    let orderBy = 'r.created_at DESC';
    switch (sort) {
      case 'rating_desc':
        orderBy = 'r.rating DESC, r.created_at DESC';
        break;
      case 'rating_asc':
        orderBy = 'r.rating ASC, r.created_at DESC';
        break;
      case 'latest':
        orderBy = 'r.created_at DESC';
        break;
    }

    // 查询评价总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reviews r
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await db.get(countQuery, queryParams);
    const total = countResult.total;

    // 查询评价列表
    const reviewsQuery = `
      SELECT 
        r.id,
        r.rating,
        r.content,
        r.images,
        r.created_at,
        u.id as user_id,
        u.username,
        u.nickname,
        u.avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const reviews = await db.all(reviewsQuery, [...queryParams, limit, offset]);

    // 处理评价数据
    const processedReviews = reviews.map(review => ({
      id: review.id,
      rating: parseInt(review.rating),
      content: review.content,
      images: JSON.parse(review.images || '[]'),
      createdAt: review.created_at,
      user: {
        id: review.user_id,
        username: review.username,
        nickname: review.nickname,
        avatar: review.avatar
      }
    }));

    res.json({
      reviews: processedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取商品评价错误:', error);
    res.status(500).json({
      error: '获取商品评价失败'
    });
  }
});

// 获取用户评价列表
router.get('/user', [
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

    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    const db = getDatabase();
    const offset = (page - 1) * limit;

    // 查询用户评价总数
    const countResult = await db.get(`
      SELECT COUNT(*) as total
      FROM reviews
      WHERE user_id = ?
    `, [userId]);
    const total = countResult.total;

    // 查询用户评价列表
    const reviews = await db.all(`
      SELECT 
        r.id,
        r.rating,
        r.content,
        r.images,
        r.created_at,
        p.id as product_id,
        p.name as product_name,
        p.images as product_images
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, limit, offset]);

    // 处理评价数据
    const processedReviews = reviews.map(review => ({
      id: review.id,
      rating: parseInt(review.rating),
      content: review.content,
      images: JSON.parse(review.images || '[]'),
      createdAt: review.created_at,
      product: {
        id: review.product_id,
        name: review.product_name,
        images: JSON.parse(review.product_images || '[]')
      }
    }));

    res.json({
      reviews: processedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取用户评价错误:', error);
    res.status(500).json({
      error: '获取用户评价失败'
    });
  }
});

// 更新评价
router.put('/:reviewId', [
  param('reviewId').isString().withMessage('评价ID必须是字符串'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间'),
  body('content').optional().isLength({ min: 5, max: 500 }).withMessage('评价内容长度必须在5-500字符之间'),
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

    const { reviewId } = req.params;
    const { rating, content, images } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查评价是否存在且属于当前用户
    const review = await db.get(`
      SELECT id, product_id, rating, content, images
      FROM reviews
      WHERE id = ? AND user_id = ?
    `, [reviewId, userId]);

    if (!review) {
      return res.status(404).json({
        error: '评价不存在'
      });
    }

    // 更新评价
    const updateFields = [];
    const updateValues = [];

    if (rating !== undefined) {
      updateFields.push('rating = ?');
      updateValues.push(rating);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (images !== undefined) {
      updateFields.push('images = ?');
      updateValues.push(JSON.stringify(images));
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(reviewId);

    if (updateFields.length > 1) {
      await db.run(`
        UPDATE reviews 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      // 更新商品评分
      await updateProductRating(db, review.product_id);
    }

    res.json({
      message: '评价更新成功'
    });
  } catch (error) {
    console.error('更新评价错误:', error);
    res.status(500).json({
      error: '更新评价失败'
    });
  }
});

// 删除评价
router.delete('/:reviewId', [
  param('reviewId').isString().withMessage('评价ID必须是字符串')
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

    const { reviewId } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    // 检查评价是否存在且属于当前用户
    const review = await db.get(`
      SELECT id, product_id FROM reviews
      WHERE id = ? AND user_id = ?
    `, [reviewId, userId]);

    if (!review) {
      return res.status(404).json({
        error: '评价不存在'
      });
    }

    // 删除评价
    await db.run('DELETE FROM reviews WHERE id = ?', [reviewId]);

    // 更新商品评分
    await updateProductRating(db, review.product_id);

    res.json({
      message: '评价删除成功'
    });
  } catch (error) {
    console.error('删除评价错误:', error);
    res.status(500).json({
      error: '删除评价失败'
    });
  }
});

// 获取评价统计
router.get('/stats/:productId', [
  param('productId').isString().withMessage('商品ID必须是字符串')
], async (req, res) => {
  try {
    const { productId } = req.params;
    const db = getDatabase();

    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
        SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
        SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
      FROM reviews
      WHERE product_id = ?
    `, [productId]);

    res.json({
      stats: {
        totalReviews: parseInt(stats.total_reviews || 0),
        avgRating: parseFloat(stats.avg_rating || 0).toFixed(1),
        ratingDistribution: {
          fiveStar: parseInt(stats.five_star || 0),
          fourStar: parseInt(stats.four_star || 0),
          threeStar: parseInt(stats.three_star || 0),
          twoStar: parseInt(stats.two_star || 0),
          oneStar: parseInt(stats.one_star || 0)
        }
      }
    });
  } catch (error) {
    console.error('获取评价统计错误:', error);
    res.status(500).json({
      error: '获取评价统计失败'
    });
  }
});

// 回复评价（管理员/商家）
router.post('/:reviewId/reply', [
  param('reviewId').isString().withMessage('评价ID必须是字符串'),
  body('reply').isLength({ min: 1, max: 500 }).withMessage('回复内容长度必须在1-500字符之间')
], authenticateUser, async (req, res) => {
  try {
    // 这里可加管理员/商家权限校验
    const { reviewId } = req.params;
    const { reply } = req.body;
    const db = getDatabase();
    const review = await db.get('SELECT id FROM reviews WHERE id = ?', [reviewId]);
    if (!review) {
      return res.status(404).json({ error: '评价不存在' });
    }
    await db.run('UPDATE reviews SET reply = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [reply, reviewId]);
    res.json({ message: '回复成功' });
  } catch (error) {
    res.status(500).json({ error: '回复失败' });
  }
});

export default router; 