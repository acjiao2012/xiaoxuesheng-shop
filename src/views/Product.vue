<template>
  <div class="product-detail-page">
    <div class="product-container">
      <!-- 商品图片展示区 -->
      <div class="product-gallery">
        <div class="main-image">
          <img 
            :src="productImage" 
            :alt="product.title" 
            @error="handleImageError"
            class="product-main-img"
          />
        </div>
        <div class="image-thumbnails">
          <div 
            v-for="(img, index) in productImages" 
            :key="index"
            class="thumbnail"
            :class="{ active: selectedImage === index }"
            @click="selectedImage = index"
          >
            <img :src="img" :alt="`${product.title} - 图片${index + 1}`" @error="handleImageError" />
          </div>
        </div>
      </div>

      <!-- 商品信息区 -->
      <div class="product-info">
        <h1 class="product-title">{{ product.title }}</h1>
        <div class="product-price">￥{{ product.price }}</div>
        <div class="product-description">
          <p>{{ product.description }}</p>
        </div>
        
        <div class="product-actions">
          <div class="quantity-selector">
            <span class="quantity-label">数量：</span>
            <el-input-number 
              v-model="quantity" 
              :min="1" 
              :max="99" 
              size="large"
              class="quantity-input"
            />
          </div>
          
          <div class="action-buttons">
            <el-button 
              type="primary" 
              size="large" 
              @click="addToCart"
              class="add-to-cart-btn"
            >
              <el-icon><ShoppingCart /></el-icon>
              加入购物车
            </el-button>
            <el-button 
              type="success" 
              size="large" 
              @click="buyNow"
              class="buy-now-btn"
            >
              立即购买
            </el-button>
          </div>
        </div>

        <div class="product-features">
          <div class="feature-item">
            <el-icon><Van /></el-icon>
            <span>全场包邮</span>
          </div>
          <div class="feature-item">
            <el-icon><Service /></el-icon>
            <span>7x12小时客服</span>
          </div>
          <div class="feature-item">
            <el-icon><Lock /></el-icon>
            <span>家长安全支付</span>
          </div>
          <div class="feature-item">
            <el-icon><Coin /></el-icon>
            <span>30天无忧退换</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品详情区 -->
    <div class="product-details">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane label="商品详情" name="detail">
          <div class="detail-content">
            <h3>商品介绍</h3>
            <p>{{ product.detailDescription }}</p>
            
            <h3>规格参数</h3>
            <div class="specs-list">
              <div class="spec-item" v-for="(spec, key) in product.specifications" :key="key">
                <span class="spec-label">{{ key }}：</span>
                <span class="spec-value">{{ spec }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="用户评价" name="reviews">
          <div class="reviews-content">
            <div class="review-item" v-for="review in product.reviews" :key="review.id">
              <div class="review-header">
                <span class="reviewer-name">{{ review.name }}</span>
                <el-rate v-model="review.rating" disabled />
                <span class="review-date">{{ review.date }}</span>
              </div>
              <div class="review-content">{{ review.content }}</div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ElIcon } from 'element-plus'
import { 
  ShoppingCart, 
  Van, 
  Service, 
  Lock, 
  Coin 
} from '@element-plus/icons-vue'
import { imageUtils, DEFAULT_IMAGES } from '../utils/imageUtils'

const route = useRoute()
const router = useRouter()

const productId = computed(() => parseInt(route.params.id as string))
const selectedImage = ref(0)
const quantity = ref(1)
const activeTab = ref('detail')

// 商品数据
const product = computed(() => {
  const products = [
    {
      id: 1,
      title: 'Q版小熊猫手办',
      price: 59,
      description: '超可爱的Q版小熊猫手办，做工精细，造型萌趣，是收藏和送礼的绝佳选择！',
      detailDescription: '这款Q版小熊猫手办采用高品质材料制作，细节刻画精致，色彩鲜艳持久。小熊猫的可爱表情和憨态可掬的造型让人爱不释手。适合摆放在书桌、床头或展示柜中，为生活增添一份童趣。',
      specifications: {
        '材质': 'PVC/ABS',
        '尺寸': '高约8cm',
        '重量': '约150g',
        '包装': '精美礼盒装',
        '适用年龄': '3岁以上'
      },
      reviews: [
        {
          id: 1,
          name: '小明妈妈',
          rating: 5,
          date: '2024-01-15',
          content: '孩子很喜欢这个小熊猫，做工很精致，包装也很漂亮！'
        },
        {
          id: 2,
          name: '手办爱好者',
          rating: 4,
          date: '2024-01-10',
          content: '质量不错，造型可爱，值得收藏。'
        }
      ]
    },
    {
      id: 2,
      title: '魔法少女小樱',
      price: 89,
      description: '经典动漫角色魔法少女小樱手办，还原度高，是动漫迷的必备收藏品！',
      detailDescription: '这款魔法少女小樱手办完美还原了动漫中的经典造型，服装细节丰富，魔法杖制作精美。采用高品质材料，色彩鲜艳，适合动漫收藏爱好者。',
      specifications: {
        '材质': 'PVC/ABS',
        '尺寸': '高约12cm',
        '重量': '约200g',
        '包装': '精美礼盒装',
        '适用年龄': '6岁以上'
      },
      reviews: [
        {
          id: 3,
          name: '小樱粉丝',
          rating: 5,
          date: '2024-01-12',
          content: '太棒了！小樱的造型还原度很高，魔法杖的细节也很精致！'
        }
      ]
    },
    {
      id: 3,
      title: '动漫主角限定',
      price: 99,
      description: '限定版动漫主角手办，稀有度高，是收藏家的珍贵藏品！',
      detailDescription: '这款限定版动漫主角手办采用特殊工艺制作，细节处理更加精细，是收藏家不可错过的珍品。',
      specifications: {
        '材质': '高级PVC',
        '尺寸': '高约15cm',
        '重量': '约300g',
        '包装': '豪华礼盒装',
        '适用年龄': '8岁以上'
      },
      reviews: []
    },
    {
      id: 4,
      title: '超萌兔子手办',
      price: 69,
      description: '超萌可爱的兔子手办，造型甜美，是少女心的完美体现！',
      detailDescription: '这款超萌兔子手办采用甜美可爱的设计风格，兔子的大眼睛和粉嫩的配色让人心动不已。',
      specifications: {
        '材质': 'PVC/ABS',
        '尺寸': '高约10cm',
        '重量': '约180g',
        '包装': '精美礼盒装',
        '适用年龄': '3岁以上'
      },
      reviews: []
    },
    {
      id: 5,
      title: '限量礼盒装',
      price: 129,
      description: '限量版礼盒装手办，内含多个精美配件，是送礼的绝佳选择！',
      detailDescription: '这款限量版礼盒装手办不仅包含精美的手办主体，还配有多个可更换的配件和底座，玩法丰富。',
      specifications: {
        '材质': '高级PVC',
        '尺寸': '高约12cm',
        '重量': '约350g',
        '包装': '豪华礼盒装',
        '适用年龄': '6岁以上'
      },
      reviews: []
    },
    {
      id: 6,
      title: '可爱猫咪手办',
      price: 79,
      description: '可爱猫咪手办，造型逼真，是猫咪爱好者的最爱！',
      detailDescription: '这款可爱猫咪手办完美还原了猫咪的可爱特征，毛发的质感处理非常精细。',
      specifications: {
        '材质': 'PVC/ABS',
        '尺寸': '高约9cm',
        '重量': '约160g',
        '包装': '精美礼盒装',
        '适用年龄': '3岁以上'
      },
      reviews: []
    },
    {
      id: 7,
      title: '收藏级手办',
      price: 159,
      description: '收藏级精品手办，工艺精湛，是高端收藏的不二之选！',
      detailDescription: '这款收藏级手办采用最高品质的材料和工艺制作，每一个细节都经过精心雕琢。',
      specifications: {
        '材质': '高级树脂',
        '尺寸': '高约18cm',
        '重量': '约500g',
        '包装': '豪华收藏盒',
        '适用年龄': '12岁以上'
      },
      reviews: []
    },
    {
      id: 8,
      title: '精美手办模型',
      price: 139,
      description: '精美手办模型，造型独特，是模型爱好者的收藏佳品！',
      detailDescription: '这款精美手办模型设计独特，造型精美，是模型收藏爱好者的理想选择。',
      specifications: {
        '材质': 'PVC/ABS',
        '尺寸': '高约14cm',
        '重量': '约280g',
        '包装': '精美礼盒装',
        '适用年龄': '8岁以上'
      },
      reviews: []
    },
    {
      id: 9,
      title: '可爱玩具手办',
      price: 89,
      description: '可爱玩具手办，适合儿童玩耍，安全无毒！',
      detailDescription: '这款可爱玩具手办专为儿童设计，采用安全无毒的材料，造型可爱，适合儿童玩耍。',
      specifications: {
        '材质': '安全塑料',
        '尺寸': '高约11cm',
        '重量': '约120g',
        '包装': '精美礼盒装',
        '适用年龄': '3岁以上'
      },
      reviews: []
    }
  ]
  
  return products.find(p => p.id === productId.value) || products[0]
})

// 商品图片
const productImage = computed(() => {
  return imageUtils.getProductImage(productId.value)
})

const productImages = computed(() => {
  return [productImage.value, productImage.value, productImage.value] // 可以添加更多图片
})

// 错误处理
function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = DEFAULT_IMAGES.PRODUCT
  console.warn('Product image failed to load:', img.src)
}

// 添加到购物车
function addToCart() {
  try {
    const cart = JSON.parse(localStorage.getItem('cartItems') || '[]')
    const idx = cart.findIndex((item: any) => item.id === product.value.id)
    if (idx > -1) {
      cart[idx].count = (cart[idx].count || 1) + quantity.value
    } else {
      cart.push({ ...product.value, count: quantity.value, color: '默认', size: '' })
    }
    localStorage.setItem('cartItems', JSON.stringify(cart))
    ElMessage.success(`已将 ${product.value.title} (${quantity.value}件) 加入购物车`)
  } catch (error) {
    console.error('Add to cart error:', error)
    ElMessage.error('操作失败，请重试')
  }
}

// 立即购买
function buyNow() {
  try {
    ElMessage.success(`正在跳转到结算页面...`)
    // 这里可以跳转到结算页面
  } catch (error) {
    console.error('Buy now error:', error)
    ElMessage.error('操作失败，请重试')
  }
}

onMounted(() => {
  console.log('Product detail page loaded, product ID:', productId.value)
})
</script>

<style scoped>
.product-detail-page {
  min-height: 100vh;
  padding: var(--spacing-xl) 0;
  background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 50%, var(--info-bg) 100%);
}

.product-container {
  display: flex;
  gap: var(--spacing-2xl);
  max-width: 1200px;
  margin: 0 auto var(--spacing-2xl) auto;
  padding: 0 var(--spacing-xl);
}

.product-gallery {
  flex: 1;
  max-width: 500px;
}

.main-image {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: white;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-lg);
}

.product-main-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.image-thumbnails {
  display: flex;
  gap: var(--spacing-md);
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.thumbnail.active {
  border-color: var(--primary-color);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  padding: var(--spacing-xl);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.product-title {
  font-size: 28px;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}

.product-price {
  font-size: 32px;
  font-weight: bold;
  color: var(--warning-dark);
  margin-bottom: var(--spacing-xl);
}

.product-description {
  margin-bottom: var(--spacing-xl);
  color: var(--text-secondary);
  line-height: 1.6;
}

.product-actions {
  margin-bottom: var(--spacing-xl);
}

.quantity-selector {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.quantity-label {
  margin-right: var(--spacing-md);
  color: var(--text-secondary);
}

.quantity-input {
  width: 120px;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-lg);
}

.add-to-cart-btn,
.buy-now-btn {
  flex: 1;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.product-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 14px;
}

.product-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

.detail-tabs {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.detail-content {
  padding: var(--spacing-xl);
}

.detail-content h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  font-size: 18px;
}

.detail-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.specs-list {
  display: grid;
  gap: var(--spacing-sm);
}

.spec-item {
  display: flex;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.spec-label {
  font-weight: 600;
  color: var(--text-primary);
  min-width: 100px;
}

.spec-value {
  color: var(--text-secondary);
}

.reviews-content {
  padding: var(--spacing-xl);
}

.review-item {
  padding: var(--spacing-lg) 0;
  border-bottom: 1px solid var(--border-color);
}

.review-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.reviewer-name {
  font-weight: 600;
  color: var(--text-primary);
}

.review-date {
  color: var(--text-tertiary);
  font-size: 14px;
}

.review-content {
  color: var(--text-secondary);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
  }
  
  .product-gallery {
    max-width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .product-features {
    grid-template-columns: 1fr;
  }
}
</style> 