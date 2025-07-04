import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;

export async function initDatabase() {
  return new Promise((resolve, reject) => {
    // 创建数据库连接
    const dbPath = join(__dirname, '../../data/shop.db');
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('数据库连接失败:', err);
        reject(err);
        return;
      }
      console.log('数据库连接成功');
      
      // 创建表结构
      createTables()
        .then(() => insertSeedData())
        .then(() => {
          console.log('数据库初始化完成');
          resolve();
        })
        .catch(reject);
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    const tables = [
      // 用户表
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        nickname TEXT,
        avatar TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // 商品分类表
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT,
        sort_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // 商品表
      `CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        category_id TEXT,
        images TEXT,
        stock INTEGER DEFAULT 0,
        sales INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )`,
      
      // 购物车表
      `CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,
      
      // 订单表
      `CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        order_no TEXT UNIQUE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_fee DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'unpaid',
        shipping_status TEXT DEFAULT 'unshipped',
        shipping_address TEXT,
        shipping_phone TEXT,
        shipping_name TEXT,
        remark TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      // 订单详情表
      `CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        product_image TEXT,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`,
      
      // 收货地址表
      `CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        province TEXT NOT NULL,
        city TEXT NOT NULL,
        district TEXT NOT NULL,
        detail_address TEXT NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      // 优惠券表
      `CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        value DECIMAL(10,2) NOT NULL,
        min_amount DECIMAL(10,2) DEFAULT 0,
        start_date DATETIME,
        end_date DATETIME,
        expire_time DATETIME,
        total_count INTEGER DEFAULT -1,
        used_count INTEGER DEFAULT 0,
        auto_distribute BOOLEAN DEFAULT 0,
        distribute_start_time DATETIME,
        distribute_end_time DATETIME,
        distribute_condition TEXT,
        distribute_limit INTEGER DEFAULT 100,
        usage_limit INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // 用户优惠券表
      `CREATE TABLE IF NOT EXISTS user_coupons (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        coupon_id TEXT NOT NULL,
        status TEXT DEFAULT 'unused',
        used_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (coupon_id) REFERENCES coupons (id)
      )`,
      
      // 支付记录表
      `CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        payment_no TEXT UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        paid_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      // 退款记录表
      `CREATE TABLE IF NOT EXISTS refunds (
        id TEXT PRIMARY KEY,
        payment_id TEXT NOT NULL,
        order_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        refund_no TEXT UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        refunded_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (payment_id) REFERENCES payments (id),
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`,
      
      // 物流信息表
      `CREATE TABLE IF NOT EXISTS logistics (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        company TEXT NOT NULL,
        company_code TEXT,
        tracking_number TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )`,
      
      // 物流轨迹表
      `CREATE TABLE IF NOT EXISTS logistics_traces (
        id TEXT PRIMARY KEY,
        logistics_id TEXT NOT NULL,
        time DATETIME NOT NULL,
        location TEXT,
        status TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (logistics_id) REFERENCES logistics (id)
      )`,
      
      // 商品评价表
      `CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        order_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        content TEXT,
        images TEXT,
        tags TEXT,
        anonymous BOOLEAN DEFAULT 0,
        reply TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        FOREIGN KEY (order_id) REFERENCES orders (id)
      )`,
      
      // 收藏表
      `CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (product_id) REFERENCES products (id),
        UNIQUE(user_id, product_id)
      )`,
      
      // 售后表
      `CREATE TABLE IF NOT EXISTS after_sales (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        reason TEXT NOT NULL,
        description TEXT,
        images TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`
    ];
    
    let completed = 0;
    const total = tables.length;
    
    tables.forEach((sql, index) => {
      db.exec(sql, (err) => {
        if (err) {
          console.error(`创建表 ${index + 1} 失败:`, err);
          reject(err);
          return;
        }
        completed++;
        if (completed === total) {
          console.log('所有表创建完成');
          resolve();
        }
      });
    });
  });
}

function insertSeedData() {
  return new Promise((resolve, reject) => {
    // 插入测试用户
    const hashedPassword = bcrypt.hashSync('123456', 10);
    const userId = uuidv4();
    
    db.run(`
      INSERT OR IGNORE INTO users (id, username, email, password, nickname, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [userId, 'testuser', 'test@example.com', hashedPassword, '测试用户', 'user'], (err) => {
      if (err) {
        console.error('插入测试用户失败:', err);
        reject(err);
        return;
      }
      console.log('测试用户创建成功');
      resolve();
    });
  });
}

export function getDatabase() {
  return db;
} 