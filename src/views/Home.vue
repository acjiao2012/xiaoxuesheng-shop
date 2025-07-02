<template>
  <div class="home-page">
    <!-- Banner区 -->
    <div class="banner-section">
      <div class="main-banner">
        <img :src="imageUtils.getBannerImage('main')" alt="主Banner" @error="handleImageError" />
        <div class="banner-text">
          <h2 class="banner-title">新学期手办大促</h2>
          <p class="banner-desc">全场手办低至<span class="highlight">7折</span>，快来选购吧！</p>
          <el-button type="success" class="promotion-btn" @click="handlePromotionClick">立即抢购</el-button>
        </div>
      </div>
      <div class="side-banners">
        <div class="side-banner">
          <img :src="imageUtils.getBannerImage('side-sale')" alt="促销1" @error="handleImageError" />
          <div class="side-banner-text">限时特惠</div>
        </div>
        <div class="side-banner">
          <img :src="imageUtils.getBannerImage('side-new')" alt="促销2" @error="handleImageError" />
          <div class="side-banner-text">新品推荐</div>
        </div>
      </div>
    </div>

    <!-- 服务优势区 -->
    <div class="service-section">
      <div class="service-item" v-for="(service, index) in services" :key="index">
        <div class="service-icon">
          <el-icon :size="32"><component :is="service.icon" /></el-icon>
        </div>
        <span class="service-text">{{ service.text }}</span>
      </div>
    </div>

    <!-- 分类浏览区 -->
    <div class="category-section">
      <h3 class="section-title">🎯 分类浏览</h3>
      <div class="category-grid">
        <div class="category-item" v-for="cat in categories" :key="cat.name" @click="handleCategoryClick(cat)">
          <div class="category-icon">
            <el-icon :size="40"><component :is="cat.icon" /></el-icon>
          </div>
          <span class="category-name">{{ cat.name }}</span>
        </div>
      </div>
    </div>

    <!-- 商品推荐区 -->
    <div class="product-section">
      <h3 class="section-title">🌟 热门推荐</h3>
      <el-tabs v-model="activeTab" class="product-tabs">
        <el-tab-pane label="新品上架" name="new">
          <div class="product-grid">
            <div class="product-card" v-for="item in products" :key="item.id" @click="handleProductClick(item)">
              <div class="product-image">
                <img :src="item.img" alt="手办图片" @error="handleImageError" />
                <div class="product-overlay">
                  <el-button type="primary" size="small" @click.stop="addToCart(item)">加入购物车</el-button>
                </div>
              </div>
              <div class="product-info">
                <div class="product-title">{{ item.title }}</div>
                <div class="product-price">￥{{ item.price }}</div>
                <div class="product-detail-tip">点击卡片查看详情</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="热销榜" name="hot">
          <div class="product-grid">
            <div class="product-card" v-for="item in products" :key="item.id" @click="handleProductClick(item)">
              <div class="product-image">
                <img :src="item.img" alt="手办图片" @error="handleImageError" />
                <div class="product-overlay">
                  <el-button type="primary" size="small" @click.stop="addToCart(item)">加入购物车</el-button>
                </div>
              </div>
              <div class="product-info">
                <div class="product-title">{{ item.title }}</div>
                <div class="product-price">￥{{ item.price }}</div>
                <div class="product-detail-tip">点击卡片查看详情</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ElIcon } from 'element-plus'
import { 
  Star, 
  User, 
  ShoppingCart, 
  Goods, 
  Box, 
  WalletFilled, 
  Coin,
  Van,
  Service,
  Lock
} from '@element-plus/icons-vue'
import { imageUtils, imageLoader, DEFAULT_IMAGES } from '../utils/imageUtils'

const router = useRouter()
const activeTab = ref('new')

const services = [
  { icon: Van, text: '全场包邮' },
  { icon: Service, text: '7x12小时客服' },
  { icon: Lock, text: '家长安全支付' },
  { icon: Coin, text: '30天无忧退换' },
]

const categories = [
  { name: '动漫角色', icon: Star },
  { name: 'Q版手办', icon: User },
  { name: '热门爆款', icon: ShoppingCart },
  { name: '限量礼盒', icon: Box },
  { name: '经典收藏', icon: Goods },
]

const products = [
  { 
    id: 1, 
    title: 'Q版小熊猫手办', 
    price: 59, 
    img: imageUtils.getProductImage(1)
  },
  { 
    id: 2, 
    title: '魔法少女小樱', 
    price: 89, 
    img: imageUtils.getProductImage(2)
  },
  { 
    id: 3, 
    title: '动漫主角限定', 
    price: 99, 
    img: imageUtils.getProductImage(3)
  },
  { 
    id: 4, 
    title: '超萌兔子手办', 
    price: 69, 
    img: imageUtils.getProductImage(4)
  },
  { 
    id: 5, 
    title: '限量礼盒装', 
    price: 129, 
    img: imageUtils.getProductImage(5)
  },
  { 
    id: 6, 
    title: '可爱猫咪手办', 
    price: 79, 
    img: imageUtils.getProductImage(6)
  },
  { 
    id: 7, 
    title: '收藏级手办', 
    price: 159, 
    img: imageUtils.getProductImage(7)
  },
  { 
    id: 8, 
    title: '精美手办模型', 
    price: 139, 
    img: imageUtils.getProductImage(8)
  },
  { 
    id: 9, 
    title: '可爱玩具手办', 
    price: 89, 
    img: imageUtils.getProductImage(9)
  },
]

// 预加载图片
onMounted(async () => {
  try {
    await imageLoader.preloadProductImages()
    await imageLoader.preloadBannerImages()
    console.log('图片预加载完成')
  } catch (error) {
    console.warn('图片预加载失败:', error)
  }
})

// 错误处理函数
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = DEFAULT_IMAGES.PLACEHOLDER
  console.warn('Image failed to load:', img.src)
}

function handlePromotionClick() {
  try {
    ElMessage.success('正在跳转到促销页面...')
  } catch (error) {
    console.error('Promotion click error:', error)
    ElMessage.error('操作失败，请重试')
  }
}

function handleCategoryClick(cat: { name: string }) {
  router.push(`/category/${encodeURIComponent(cat.name)}`)
}

function handleProductClick(product: any) {
  try {
    router.push(`/product/${product.id}`)
  } catch (error) {
    console.error('Product click error:', error)
    ElMessage.error('页面跳转失败，请重试')
  }
}

function addToCart(product: any) {
  // 获取当前购物车
  const cart = JSON.parse(localStorage.getItem('cartItems') || '[]')
  // 查找是否已存在
  const idx = cart.findIndex((item: any) => item.id === product.id)
  if (idx > -1) {
    cart[idx].count = (cart[idx].count || 1) + 1
  } else {
    cart.push({ ...product, count: 1, color: '默认', size: '' })
  }
  localStorage.setItem('cartItems', JSON.stringify(cart))
  ElMessage.success(`已将 ${product.title} 加入购物车`)
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: var(--spacing-xl) 0;
  background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 50%, var(--info-bg) 100%);
}

.banner-section {
  display: flex;
  gap: var(--spacing-lg);
  margin: 0 auto var(--spacing-2xl) auto;
  max-width: 1200px;
  padding: 0 var(--spacing-xl);
}

.main-banner {
  flex: 2;
  position: relative;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-bg), var(--secondary-bg));
  min-height: 300px;
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

.main-banner:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

.main-banner img {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.banner-text {
  position: absolute;
  top: var(--spacing-xl);
  left: var(--spacing-xl);
  color: var(--text-primary);
  z-index: 2;
}

.banner-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: var(--spacing-md);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.banner-desc {
  font-size: 18px;
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
}

.highlight {
  color: var(--warning-dark);
  font-weight: bold;
  font-size: 24px;
}

.promotion-btn {
  background: linear-gradient(135deg, var(--success-color), var(--success-dark));
  border: none;
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: 16px;
  font-weight: 600;
  box-shadow: var(--shadow-md);
}

.promotion-btn:hover {
  background: linear-gradient(135deg, var(--success-dark), var(--success-color));
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.side-banners {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.side-banner {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: linear-gradient(135deg, var(--warning-bg), var(--info-bg));
  min-height: 140px;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.side-banner:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.side-banner img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.side-banner-text {
  position: absolute;
  bottom: var(--spacing-md);
  left: var(--spacing-md);
  color: var(--text-primary);
  font-weight: bold;
  background: rgba(255, 255, 255, 0.9);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  backdrop-filter: blur(10px);
}

.service-section {
  display: flex;
  justify-content: center;
  gap: var(--spacing-2xl);
  background: var(--bg-primary);
  padding: var(--spacing-2xl) 0;
  margin: 0 auto var(--spacing-2xl) auto;
  max-width: 1200px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
}

.service-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  cursor: pointer;
}

.service-item:hover {
  background: var(--primary-bg);
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.service-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  box-shadow: var(--shadow-md);
}

.service-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.category-section {
  background: var(--bg-primary);
  margin: 0 auto var(--spacing-2xl) auto;
  max-width: 1200px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2xl);
  border: 1px solid var(--border-light);
}

.section-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark), var(--info-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-xl);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-bg), var(--secondary-bg));
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
}

.category-item:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--secondary-bg), var(--info-bg));
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--info-color), var(--info-dark));
  color: white;
  box-shadow: var(--shadow-md);
}

.category-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.product-section {
  background: var(--bg-primary);
  margin: 0 auto;
  max-width: 1200px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2xl);
  border: 1px solid var(--border-light);
}

.product-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--spacing-2xl);
}

.product-tabs :deep(.el-tabs__item) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
}

.product-tabs :deep(.el-tabs__item.is-active) {
  color: var(--primary-dark);
}

.product-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.product-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--border-light);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.1);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-info {
  padding: var(--spacing-lg);
}

.product-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.4;
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: var(--warning-dark);
}

.product-detail-tip {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner-section {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: 0 var(--spacing-lg);
  }
  
  .main-banner {
    min-height: 200px;
  }
  
  .main-banner img {
    height: 200px;
  }
  
  .banner-title {
    font-size: 24px;
  }
  
  .banner-desc {
    font-size: 16px;
  }
  
  .service-section {
    flex-wrap: wrap;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .category-section,
  .product-section {
    margin: 0 var(--spacing-lg) var(--spacing-2xl) var(--spacing-lg);
    padding: var(--spacing-xl);
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: var(--spacing-lg) 0;
  }
  
  .banner-section {
    padding: 0 var(--spacing-md);
  }
  
  .main-banner {
    min-height: 150px;
  }
  
  .main-banner img {
    height: 150px;
  }
  
  .banner-title {
    font-size: 20px;
  }
  
  .banner-desc {
    font-size: 14px;
  }
  
  .service-section {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .service-item {
    padding: var(--spacing-md);
  }
  
  .service-icon {
    width: 50px;
    height: 50px;
  }
  
  .service-text {
    font-size: 14px;
  }
  
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
  
  .category-item {
    padding: var(--spacing-lg);
  }
  
  .category-icon {
    width: 60px;
    height: 60px;
  }
  
  .category-name {
    font-size: 16px;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md);
  }
  
  .category-section,
  .product-section {
    margin: 0 var(--spacing-md) var(--spacing-xl) var(--spacing-md);
    padding: var(--spacing-lg);
  }
}
</style> 