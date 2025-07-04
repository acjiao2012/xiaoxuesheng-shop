import express from 'express';
import { query, param, validationResult } from 'express-validator';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// 获取商品列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('category').optional().isString().withMessage('分类ID必须是字符串'),
  query('search').optional().isString().withMessage('搜索关键词必须是字符串'),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'sales_desc', 'rating_desc', 'created_desc']).withMessage('排序方式无效'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('最低价格必须是非负数'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('最高价格必须是非负数')
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

    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'created_desc',
      minPrice,
      maxPrice
    } = req.query;

    const db = getDatabase();
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereConditions = ['p.status = "active"'];
    let queryParams = [];

    if (category) {
      whereConditions.push('p.category_id = ?');
      queryParams.push(category);
    }

    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice !== undefined) {
      whereConditions.push('p.price >= ?');
      queryParams.push(minPrice);
    }

    if (maxPrice !== undefined) {
      whereConditions.push('p.price <= ?');
      queryParams.push(maxPrice);
    }

    // 构建排序
    let orderBy = 'p.created_at DESC';
    switch (sort) {
      case 'price_asc':
        orderBy = 'p.price ASC';
        break;
      case 'price_desc':
        orderBy = 'p.price DESC';
        break;
      case 'sales_desc':
        orderBy = 'p.sales DESC';
        break;
      case 'rating_desc':
        orderBy = 'p.rating DESC';
        break;
      case 'created_desc':
        orderBy = 'p.created_at DESC';
        break;
    }

    // 查询商品总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await db.get(countQuery, queryParams);
    const total = countResult.total;

    // 查询商品列表
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.category_id,
        p.images,
        p.stock,
        p.sales,
        p.rating,
        p.review_count,
        p.status,
        p.created_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const products = await db.all(productsQuery, [...queryParams, limit, offset]);

    // 处理商品数据
    const processedProducts = products.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      stock: parseInt(product.stock),
      sales: parseInt(product.sales),
      rating: parseFloat(product.rating),
      review_count: parseInt(product.review_count)
    }));

    res.json({
      products: processedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({
      error: '获取商品列表失败'
    });
  }
});

// 获取商品详情
router.get('/:id', [
  param('id').isString().withMessage('商品ID必须是字符串')
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

    const { id } = req.params;
    const db = getDatabase();

    // 查询商品详情
    const product = await db.get(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.category_id,
        p.images,
        p.stock,
        p.sales,
        p.rating,
        p.review_count,
        p.status,
        p.created_at,
        c.name as category_name,
        c.description as category_description
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = "active"
    `, [id]);

    if (!product) {
      return res.status(404).json({
        error: '商品不存在'
      });
    }

    // 处理商品数据
    const processedProduct = {
      ...product,
      images: JSON.parse(product.images || '[]'),
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      stock: parseInt(product.stock),
      sales: parseInt(product.sales),
      rating: parseFloat(product.rating),
      review_count: parseInt(product.review_count)
    };

    res.json({
      product: processedProduct
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({
      error: '获取商品详情失败'
    });
  }
});

// 获取商品分类
router.get('/categories/list', async (req, res) => {
  try {
    const db = getDatabase();

    const categories = await db.all(`
      SELECT 
        id,
        name,
        description,
        image,
        sort_order,
        status,
        created_at
      FROM categories
      WHERE status = "active"
      ORDER BY sort_order ASC, created_at ASC
    `);

    res.json({
      categories: categories.map(category => ({
        ...category,
        sort_order: parseInt(category.sort_order)
      }))
    });
  } catch (error) {
    console.error('获取商品分类错误:', error);
    res.status(500).json({
      error: '获取商品分类失败'
    });
  }
});

// 获取分类详情
router.get('/categories/:id', [
  param('id').isString().withMessage('分类ID必须是字符串')
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

    const { id } = req.params;
    const db = getDatabase();

    const category = await db.get(`
      SELECT 
        id,
        name,
        description,
        image,
        sort_order,
        status,
        created_at
      FROM categories
      WHERE id = ? AND status = "active"
    `, [id]);

    if (!category) {
      return res.status(404).json({
        error: '分类不存在'
      });
    }

    res.json({
      category: {
        ...category,
        sort_order: parseInt(category.sort_order)
      }
    });
  } catch (error) {
    console.error('获取分类详情错误:', error);
    res.status(500).json({
      error: '获取分类详情失败'
    });
  }
});

// 获取热门商品
router.get('/featured/list', async (req, res) => {
  try {
    const db = getDatabase();

    const featuredProducts = await db.all(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.category_id,
        p.images,
        p.stock,
        p.sales,
        p.rating,
        p.review_count,
        p.status,
        p.created_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = "active"
      ORDER BY p.sales DESC, p.rating DESC
      LIMIT 8
    `);

    const processedProducts = featuredProducts.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      stock: parseInt(product.stock),
      sales: parseInt(product.sales),
      rating: parseFloat(product.rating),
      review_count: parseInt(product.review_count)
    }));

    res.json({
      products: processedProducts
    });
  } catch (error) {
    console.error('获取热门商品错误:', error);
    res.status(500).json({
      error: '获取热门商品失败'
    });
  }
});

// 获取推荐商品
router.get('/recommendations/:productId', [
  param('productId').isString().withMessage('商品ID必须是字符串')
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
    const db = getDatabase();

    // 获取当前商品的分类
    const currentProduct = await db.get(`
      SELECT category_id FROM products WHERE id = ? AND status = "active"
    `, [productId]);

    if (!currentProduct) {
      return res.status(404).json({
        error: '商品不存在'
      });
    }

    // 获取同分类的其他商品作为推荐
    const recommendations = await db.all(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.category_id,
        p.images,
        p.stock,
        p.sales,
        p.rating,
        p.review_count,
        p.status,
        p.created_at,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = "active" 
        AND p.category_id = ? 
        AND p.id != ?
      ORDER BY p.rating DESC, p.sales DESC
      LIMIT 6
    `, [currentProduct.category_id, productId]);

    const processedProducts = recommendations.map(product => ({
      ...product,
      images: JSON.parse(product.images || '[]'),
      price: parseFloat(product.price),
      original_price: product.original_price ? parseFloat(product.original_price) : null,
      stock: parseInt(product.stock),
      sales: parseInt(product.sales),
      rating: parseFloat(product.rating),
      review_count: parseInt(product.review_count)
    }));

    res.json({
      products: processedProducts
    });
  } catch (error) {
    console.error('获取推荐商品错误:', error);
    res.status(500).json({
      error: '获取推荐商品失败'
    });
  }
});

export default router; 