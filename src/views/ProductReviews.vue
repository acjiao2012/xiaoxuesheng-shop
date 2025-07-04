<template>
  <div class="reviews-container">
    <div class="reviews-content">
      <!-- 商品信息 -->
      <div class="product-header">
        <img :src="productInfo.image" :alt="productInfo.name" class="product-image" />
        <div class="product-info">
          <h2 class="product-name">{{ productInfo.name }}</h2>
          <div class="product-rating">
            <el-rate
              v-model="productInfo.rating"
              disabled
              show-score
              text-color="#ff9900"
              score-template="{value}"
            />
            <span class="review-count">{{ productInfo.reviewCount }}条评价</span>
          </div>
        </div>
      </div>

      <!-- 评价统计 -->
      <div class="review-stats">
        <div class="stats-overview">
          <div class="overall-rating">
            <div class="rating-score">{{ productInfo.rating.toFixed(1) }}</div>
            <div class="rating-label">综合评分</div>
          </div>
          <div class="rating-distribution">
            <div v-for="(count, rating) in ratingDistribution" :key="rating" class="rating-bar">
              <span class="rating-label">{{ rating }}星</span>
              <el-progress 
                :percentage="(count / productInfo.reviewCount) * 100" 
                :show-text="false"
                :stroke-width="8"
              />
              <span class="rating-count">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和排序 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <el-radio-group v-model="selectedRating" @change="handleRatingFilter">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="5">5星</el-radio-button>
            <el-radio-button label="4">4星</el-radio-button>
            <el-radio-button label="3">3星</el-radio-button>
            <el-radio-button label="2">2星</el-radio-button>
            <el-radio-button label="1">1星</el-radio-button>
          </el-radio-group>
        </div>
        <div class="sort-section">
          <el-select v-model="sortBy" @change="handleSortChange" placeholder="排序方式">
            <el-option label="最新" value="latest" />
            <el-option label="评分最高" value="rating_desc" />
            <el-option label="评分最低" value="rating_asc" />
          </el-select>
        </div>
      </div>

      <!-- 评价列表 -->
      <div class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <img :src="review.userAvatar" :alt="review.userName" class="user-avatar" />
              <div class="user-details">
                <div class="user-name">{{ review.anonymous ? '匿名用户' : review.userName }}</div>
                <div class="review-time">{{ formatTime(review.createdAt) }}</div>
              </div>
            </div>
            <div class="review-rating">
              <el-rate v-model="review.rating" disabled />
            </div>
          </div>
          
          <div class="review-content">
            <p class="review-text">{{ review.content }}</p>
            
            <!-- 评价图片 -->
            <div v-if="review.images && review.images.length > 0" class="review-images">
              <el-image
                v-for="(image, index) in review.images"
                :key="index"
                :src="image"
                :preview-src-list="review.images"
                fit="cover"
                class="review-image"
              />
            </div>
            
            <!-- 评价标签 -->
            <div v-if="review.tags && review.tags.length > 0" class="review-tags">
              <el-tag
                v-for="tag in review.tags"
                :key="tag"
                size="small"
                class="review-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div v-if="review.reply" class="review-reply">
              <el-alert type="info" :closable="false" show-icon>
                <template #title>
                  <b>商家回复：</b>{{ review.reply }}
                </template>
              </el-alert>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-section">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 暂无评价 -->
      <div v-if="reviews.length === 0" class="empty-reviews">
        <el-empty description="暂无评价" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()

// 响应式数据
const productInfo = ref({
  id: route.params.productId as string,
  name: '',
  image: '',
  rating: 0,
  reviewCount: 0
})

const reviews = ref<Review[]>([])
const selectedRating = ref('')
const sortBy = ref('latest')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计算属性
const ratingDistribution = computed(() => {
  // 模拟评分分布数据
  return {
    5: 45,
    4: 30,
    3: 15,
    2: 7,
    1: 3
  }
})

// 生命周期
onMounted(() => {
  loadProductInfo()
  loadReviews()
})

// 方法
async function loadProductInfo() {
  try {
    // 这里应该调用API获取商品信息
    // const response = await api.getProduct(productInfo.value.id)
    // productInfo.value = response.data
    
    // 模拟数据
    productInfo.value = {
      id: productInfo.value.id,
      name: 'Q版小熊猫手办',
      image: '/images/products/product-1-panda.jpg',
      rating: 4.6,
      reviewCount: 100
    }
  } catch (error) {
    ElMessage.error('加载商品信息失败')
  }
}

async function loadReviews() {
  try {
    // 这里应该调用API获取评价列表
    // const response = await api.getProductReviews({
    //   productId: productInfo.value.id,
    //   page: currentPage.value,
    //   limit: pageSize.value,
    //   rating: selectedRating.value,
    //   sort: sortBy.value
    // })
    // reviews.value = response.data.reviews
    // total.value = response.data.total
    
    // 模拟数据
    reviews.value = [
      {
        id: '1',
        userId: '1',
        productId: productInfo.value.id,
        orderId: '1',
        userName: '小明',
        userAvatar: '/images/avatars/icons8-男孩-50.png',
        rating: 5,
        content: '这个手办质量非常好，做工精细，包装也很精美，孩子很喜欢！',
        images: ['/images/products/product-1-panda.jpg'],
        tags: ['质量很好', '包装精美'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        anonymous: false,
        reply: '感谢您的支持，我们会继续努力！'
      },
      {
        id: '2',
        userId: '2',
        productId: productInfo.value.id,
        orderId: '2',
        userName: '小红',
        userAvatar: '/images/avatars/icons8-女孩-50.png',
        rating: 4,
        content: '整体不错，就是价格稍微贵了一点，但是质量确实很好。',
        images: [],
        tags: ['性价比高'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        anonymous: false,
        reply: '感谢您的理解，我们会考虑您的建议。'
      },
      {
        id: '3',
        userId: '3',
        productId: productInfo.value.id,
        orderId: '3',
        userName: '匿名用户',
        userAvatar: '/images/avatars/avatar-placeholder.jpg',
        rating: 5,
        content: '发货很快，服务态度也很好，手办很可爱，值得推荐！',
        images: [],
        tags: ['发货快', '服务态度好', '值得推荐'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        anonymous: true,
        reply: '感谢您的推荐，我们会继续保持好的服务。'
      }
    ]
    total.value = 100
  } catch (error) {
    ElMessage.error('加载评价失败')
  }
}

function handleRatingFilter() {
  currentPage.value = 1
  loadReviews()
}

function handleSortChange() {
  currentPage.value = 1
  loadReviews()
}

function handleSizeChange() {
  currentPage.value = 1
  loadReviews()
}

function handleCurrentChange() {
  loadReviews()
}

function formatTime(timeString: string) {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}
</script>

<style scoped>
.reviews-container {
  background: #f7faff;
  min-height: 100vh;
  padding: 20px;
}

.reviews-content {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-count {
  color: #666;
  font-size: 14px;
}

.review-stats {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.stats-overview {
  display: flex;
  gap: 40px;
}

.overall-rating {
  text-align: center;
  min-width: 120px;
}

.rating-score {
  font-size: 36px;
  font-weight: bold;
  color: #ff9900;
  margin-bottom: 8px;
}

.rating-label {
  color: #666;
  font-size: 14px;
}

.rating-distribution {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-bar .rating-label {
  width: 40px;
  text-align: right;
}

.rating-bar .el-progress {
  flex: 1;
  margin: 0 12px;
}

.rating-bar .rating-count {
  width: 30px;
  text-align: left;
  color: #666;
  font-size: 14px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.reviews-list {
  margin-bottom: 32px;
}

.review-item {
  padding: 24px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
}

.user-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.review-time {
  font-size: 12px;
  color: #999;
}

.review-rating {
  flex-shrink: 0;
}

.review-content {
  margin-left: 52px;
}

.review-text {
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.review-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  cursor: pointer;
}

.review-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.review-tag {
  margin: 0;
}

.review-reply {
  margin-top: 12px;
}

.pagination-section {
  text-align: center;
  margin-top: 32px;
}

.empty-reviews {
  text-align: center;
  padding: 60px 0;
}
</style> 