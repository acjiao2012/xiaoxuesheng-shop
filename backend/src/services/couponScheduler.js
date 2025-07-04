import { getDatabase } from '../database/init.js';
import { v4 as uuidv4 } from 'uuid';

class CouponScheduler {
  constructor() {
    this.intervals = new Map();
    this.isRunning = false;
  }

  // 启动定时任务
  start() {
    if (this.isRunning) {
      console.log('优惠券定时任务已在运行中');
      return;
    }

    this.isRunning = true;
    console.log('🚀 启动优惠券定时任务');

    // 每分钟检查一次优惠券发放
    this.intervals.set('distribution', setInterval(() => {
      this.checkCouponDistribution();
    }, 60000));

    // 每小时检查一次优惠券失效
    this.intervals.set('expiration', setInterval(() => {
      this.checkCouponExpiration();
    }, 3600000));

    // 立即执行一次检查
    this.checkCouponDistribution();
    this.checkCouponExpiration();
  }

  // 停止定时任务
  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    console.log('🛑 停止优惠券定时任务');

    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      console.log(`已停止定时任务: ${name}`);
    }
    this.intervals.clear();
  }

  // 检查优惠券发放
  async checkCouponDistribution() {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      // 查找需要自动发放的优惠券
      db.all(`
        SELECT 
          c.id,
          c.name,
          c.type,
          c.value,
          c.min_amount,
          c.auto_distribute,
          c.distribute_start_time,
          c.distribute_end_time,
          c.distribute_condition,
          c.distribute_limit,
          c.usage_limit
        FROM coupons c
        WHERE c.status = 'active'
          AND c.auto_distribute = 1
          AND c.distribute_start_time <= ?
          AND c.distribute_end_time >= ?
          AND c.distribute_limit > (
            SELECT COUNT(*) FROM user_coupons uc 
            WHERE uc.coupon_id = c.id
          )
      `, [now, now], async (err, coupons) => {
        if (err) {
          console.error('查询优惠券失败:', err);
          return;
        }
        
        if (coupons && coupons.length > 0) {
          for (const coupon of coupons) {
            await this.distributeCoupon(coupon);
          }
        }
      });
    } catch (error) {
      console.error('检查优惠券发放错误:', error);
    }
  }

  // 发放优惠券
  async distributeCoupon(coupon) {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      // 解析发放条件
      const conditions = JSON.parse(coupon.distribute_condition || '{}');
      
      // 构建用户查询条件
      let userQuery = `
        SELECT u.id, u.username, u.email
        FROM users u
        WHERE u.status = 'active'
      `;
      const queryParams = [];

      // 新用户条件
      if (conditions.newUser) {
        userQuery += `
          AND u.created_at >= datetime('now', '-7 days')
          AND u.id NOT IN (
            SELECT DISTINCT user_id FROM user_coupons
          )
        `;
      }

      // 消费金额条件
      if (conditions.minSpend) {
        userQuery += `
          AND (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE user_id = u.id AND status = 'completed'
          ) >= ?
        `;
        queryParams.push(conditions.minSpend);
      }

      // 注册时间条件
      if (conditions.registrationDays) {
        userQuery += `
          AND u.created_at <= datetime('now', '-${conditions.registrationDays} days')
        `;
      }

      // 排除已领取该优惠券的用户
      userQuery += `
        AND u.id NOT IN (
          SELECT user_id FROM user_coupons WHERE coupon_id = ?
        )
      `;
      queryParams.push(coupon.id);

      // 限制发放数量
      userQuery += ` LIMIT ${coupon.distribute_limit}`;

      const eligibleUsers = await db.all(userQuery, queryParams);

      // 批量发放优惠券
      for (const user of eligibleUsers) {
        const userCouponId = uuidv4();
        await db.run(`
          INSERT INTO user_coupons (id, user_id, coupon_id, status)
          VALUES (?, ?, ?, 'unused')
        `, [userCouponId, user.id, coupon.id]);

        console.log(`✅ 自动发放优惠券: ${coupon.name} -> ${user.username}`);
      }

      if (eligibleUsers.length > 0) {
        console.log(`📢 批量发放优惠券完成: ${coupon.name} x ${eligibleUsers.length}`);
      }
    } catch (error) {
      console.error('发放优惠券错误:', error);
    }
  }

  // 检查优惠券失效
  async checkCouponExpiration() {
    try {
      const db = getDatabase();
      const now = new Date().toISOString();

      // 查找已过期的优惠券
      const expiredCoupons = await db.all(`
        SELECT 
          uc.id,
          uc.user_id,
          uc.coupon_id,
          c.name as coupon_name,
          c.expire_time
        FROM user_coupons uc
        JOIN coupons c ON uc.coupon_id = c.id
        WHERE uc.status = 'unused'
          AND c.expire_time < ?
      `, [now]);

      // 批量更新过期优惠券状态
      if (expiredCoupons.length > 0) {
        const expiredIds = expiredCoupons.map(c => c.id);
        const placeholders = expiredIds.map(() => '?').join(',');
        
        await db.run(`
          UPDATE user_coupons 
          SET status = 'expired'
          WHERE id IN (${placeholders})
        `, expiredIds);

        console.log(`⏰ 优惠券过期处理完成: ${expiredCoupons.length} 张`);
        
        // 记录过期详情
        for (const coupon of expiredCoupons) {
          console.log(`   - ${coupon.coupon_name} (用户ID: ${coupon.user_id})`);
        }
      }
    } catch (error) {
      console.error('检查优惠券失效错误:', error);
    }
  }

  // 手动触发优惠券发放（用于测试）
  async manualDistribute(couponId) {
    try {
      const db = getDatabase();
      
      const coupon = await db.get(`
        SELECT * FROM coupons WHERE id = ?
      `, [couponId]);

      if (!coupon) {
        throw new Error('优惠券不存在');
      }

      await this.distributeCoupon(coupon);
      return { success: true, message: '手动发放完成' };
    } catch (error) {
      console.error('手动发放优惠券错误:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取定时任务状态
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasks: Array.from(this.intervals.keys()),
      taskCount: this.intervals.size
    };
  }
}

// 创建单例实例
const couponScheduler = new CouponScheduler();

export default couponScheduler; 