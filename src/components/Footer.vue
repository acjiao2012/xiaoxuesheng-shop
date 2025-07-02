<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3 class="footer-title">🎁 小学生手办商城</h3>
        <p class="footer-desc">专为6-12岁小学生设计的可爱手办购物平台，让每个孩子都能找到心仪的玩具！</p>
        <div class="social-links">
          <a href="#" class="social-link" title="微信">
            <el-icon><ChatDotRound /></el-icon>
          </a>
          <a href="#" class="social-link" title="QQ">
            <el-icon><Message /></el-icon>
          </a>
          <a href="#" class="social-link" title="微博">
            <el-icon><Share /></el-icon>
          </a>
        </div>
      </div>
      
      <div class="footer-section">
        <h4 class="section-title">🛍️ 购物指南</h4>
        <ul class="footer-links">
          <li><a href="#" class="footer-link">如何购买</a></li>
          <li><a href="#" class="footer-link">支付方式</a></li>
          <li><a href="#" class="footer-link">配送说明</a></li>
          <li><a href="#" class="footer-link">退换货政策</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4 class="section-title">👨‍👩‍👧‍👦 家长服务</h4>
        <ul class="footer-links">
          <li><a href="#" class="footer-link">家长管理</a></li>
          <li><a href="#" class="footer-link">消费监控</a></li>
          <li><a href="#" class="footer-link">安全设置</a></li>
          <li><a href="#" class="footer-link">客服咨询</a></li>
        </ul>
      </div>
      
      <div class="footer-section">
        <h4 class="section-title">📞 联系我们</h4>
        <div class="contact-info">
          <p class="contact-item">
            <el-icon><Phone /></el-icon>
            <span>400-123-4567</span>
          </p>
          <p class="contact-item">
            <el-icon><Message /></el-icon>
            <span>service@xiaoxuesheng.com</span>
          </p>
          <p class="contact-item">
            <el-icon><Location /></el-icon>
            <span>北京市朝阳区xxx大厦</span>
          </p>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p class="copyright">
          © 2024 小学生手办商城. 保留所有权利. 
          <span class="rainbow-text">让每个孩子都拥有快乐的童年！</span>
        </p>
        <div class="footer-badges">
          <span class="badge">安全认证</span>
          <span class="badge">正品保证</span>
          <span class="badge">7天退换</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { 
  ChatDotRound, 
  Message, 
  Share, 
  Phone, 
  Location 
} from '@element-plus/icons-vue'
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 50%, var(--info-bg) 100%);
  border-top: 2px solid var(--border-light);
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-2xl) var(--spacing-xl);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--spacing-2xl);
}

.footer-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark), var(--info-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-desc {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.social-link:hover {
  transform: translateY(-3px) scale(1.1);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--secondary-color), var(--secondary-dark));
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: var(--spacing-sm);
}

.footer-link {
  color: var(--text-secondary);
  transition: all 0.3s ease;
  display: inline-block;
  padding: var(--spacing-xs) 0;
}

.footer-link:hover {
  color: var(--primary-dark);
  transform: translateX(5px);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 14px;
}

.contact-item .el-icon {
  color: var(--primary-color);
  font-size: 16px;
}

.footer-bottom {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-lg) 0;
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: var(--text-secondary);
  font-size: 14px;
}

.rainbow-text {
  background: linear-gradient(135deg, 
    #ff9a9e 0%, 
    #fecfef 20%, 
    #a8edea 40%, 
    #fed6e3 60%, 
    #fcb69f 80%, 
    #ff9a9e 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
}

.footer-badges {
  display: flex;
  gap: var(--spacing-md);
}

.badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  background: linear-gradient(135deg, var(--success-color), var(--success-dark));
  color: white;
  box-shadow: var(--shadow-sm);
}

.badge:nth-child(2) {
  background: linear-gradient(135deg, var(--warning-color), var(--warning-dark));
}

.badge:nth-child(3) {
  background: linear-gradient(135deg, var(--info-color), var(--info-dark));
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .footer-bottom-content {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
    padding: 0 var(--spacing-lg);
  }
  
  .footer-badges {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .footer-title {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 16px;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom-content {
    padding: 0 var(--spacing-md);
  }
  
  .copyright {
    font-size: 12px;
  }
  
  .badge {
    font-size: 11px;
    padding: var(--spacing-xs) var(--spacing-xs);
  }
}
</style> 