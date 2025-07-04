<template>
  <div class="review-container">
    <div class="review-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2 class="page-title">商品评价</h2>
        <p class="page-subtitle">请对您购买的商品进行评价</p>
      </div>

      <!-- 商品信息 -->
      <div class="product-info">
        <img :src="productInfo.image" :alt="productInfo.name" class="product-image" />
        <div class="product-details">
          <h3 class="product-name">{{ productInfo.name }}</h3>
          <div class="product-meta">
            <span class="order-no">订单号：{{ orderInfo.orderNo }}</span>
            <span class="purchase-date">购买时间：{{ formatDate(orderInfo.purchaseDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 评价表单 -->
      <div class="review-form">
        <el-form :model="reviewForm" :rules="reviewRules" ref="reviewFormRef" label-width="80px">
          <!-- 评分 -->
          <el-form-item label="评分" prop="rating">
            <div class="rating-section">
              <el-rate
                v-model="reviewForm.rating"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                show-text
                :texts="['很差', '较差', '一般', '不错', '很好']"
              />
            </div>
          </el-form-item>

          <!-- 评价内容 -->
          <el-form-item label="评价内容" prop="content">
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="6"
              placeholder="请详细描述您对商品的感受和使用体验..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <!-- 图片上传 -->
          <el-form-item label="上传图片">
            <div class="upload-section">
              <el-upload
                v-model:file-list="uploadedFiles"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                :on-change="handleFileChange"
                :on-remove="handleFileRemove"
                :limit="5"
              >
                <el-icon><Plus /></el-icon>
                <template #tip>
                  <div class="upload-tip">
                    支持jpg、png格式，最多上传5张图片
                  </div>
                </template>
              </el-upload>
            </div>
          </el-form-item>

          <!-- 标签选择 -->
          <el-form-item label="标签">
            <div class="tags-section">
              <el-tag
                v-for="tag in availableTags"
                :key="tag"
                :class="{ active: reviewForm.tags.includes(tag) }"
                @click="toggleTag(tag)"
                class="clickable-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>

          <!-- 匿名评价 -->
          <el-form-item>
            <el-checkbox v-model="reviewForm.anonymous">
              匿名评价
            </el-checkbox>
          </el-form-item>
        </el-form>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <el-button type="primary" size="large" @click="submitReview" :loading="submitting">
          提交评价
        </el-button>
        <el-button @click="goBack">取消</el-button>
      </div>
    </div>

    <!-- 评价成功弹窗 -->
    <el-dialog v-model="showSuccessDialog" title="评价成功" width="400px" :show-close="false">
      <div class="success-content">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <h3>评价提交成功！</h3>
        <p>感谢您的评价，我们会继续努力提供更好的服务</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="goToOrders">查看我的订单</el-button>
        <el-button @click="closeSuccessDialog">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, CircleCheckFilled } from '@element-plus/icons-vue'
import type { FormInstance, UploadFile } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const reviewFormRef = ref<FormInstance>()
const submitting = ref(false)
const showSuccessDialog = ref(false)
const uploadedFiles = ref<UploadFile[]>([])

// 商品信息
const productInfo = ref({
  id: route.params.productId as string,
  name: '',
  image: ''
})

// 订单信息
const orderInfo = ref({
  orderId: route.params.orderId as string,
  orderNo: '',
  purchaseDate: ''
})

// 评价表单
const reviewForm = reactive({
  rating: 5,
  content: '',
  tags: [] as string[],
  anonymous: false
})

// 可用标签
const availableTags = [
  '质量很好', '包装精美', '发货快', '服务态度好', 
  '性价比高', '款式漂亮', '做工精细', '值得推荐'
]

// 表单验证规则
const reviewRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请填写评价内容', trigger: 'blur' },
    { min: 5, max: 500, message: '评价内容长度在5到500个字符', trigger: 'blur' }
  ]
}

// 生命周期
onMounted(() => {
  loadProductAndOrderInfo()
})

// 方法
async function loadProductAndOrderInfo() {
  try {
    // 这里应该调用API获取商品和订单信息
    // const response = await api.getProductAndOrder(productInfo.value.id, orderInfo.value.orderId)
    // productInfo.value = response.data.product
    // orderInfo.value = response.data.order
    
    // 模拟数据
    productInfo.value = {
      id: productInfo.value.id,
      name: 'Q版小熊猫手办',
      image: '/images/products/product-1-panda.jpg'
    }
    
    orderInfo.value = {
      orderId: orderInfo.value.orderId,
      orderNo: `ORDER${Date.now()}`,
      purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (error) {
    ElMessage.error('加载商品信息失败')
  }
}

function handleFileChange(file: UploadFile) {
  // 这里可以处理文件上传逻辑
  console.log('文件选择:', file)
}

function handleFileRemove(file: UploadFile) {
  // 处理文件移除逻辑
  console.log('文件移除:', file)
}

function toggleTag(tag: string) {
  const index = reviewForm.tags.indexOf(tag)
  if (index > -1) {
    reviewForm.tags.splice(index, 1)
  } else {
    if (reviewForm.tags.length < 3) {
      reviewForm.tags.push(tag)
    } else {
      ElMessage.warning('最多只能选择3个标签')
    }
  }
}

async function submitReview() {
  if (!reviewFormRef.value) return

  try {
    await reviewFormRef.value.validate()
    
    submitting.value = true
    
    // 这里应该调用API提交评价
    // const response = await api.submitReview({
    //   productId: productInfo.value.id,
    //   orderId: orderInfo.value.orderId,
    //   ...reviewForm,
    //   images: uploadedFiles.value.map(file => file.url)
    // })
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    showSuccessDialog.value = true
  } catch (error) {
    if (error !== false) {
      ElMessage.error('提交评价失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

function goToOrders() {
  router.push('/orders')
}

function closeSuccessDialog() {
  showSuccessDialog.value = false
  router.push('/orders')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.review-container {
  background: #f7faff;
  min-height: 100vh;
  padding: 20px;
}

.review-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  color: #333;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #666;
  font-size: 14px;
}

.product-info {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 16px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.review-form {
  margin-bottom: 32px;
}

.rating-section {
  padding: 8px 0;
}

.upload-section {
  padding: 8px 0;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
}

.clickable-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.clickable-tag:hover {
  transform: scale(1.05);
}

.clickable-tag.active {
  background: #409eff;
  color: white;
}

.submit-section {
  text-align: center;
}

.submit-section .el-button {
  margin: 0 8px;
}

.success-content {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 16px;
}

.success-content h3 {
  margin-bottom: 12px;
  color: #333;
}

.success-content p {
  color: #666;
  line-height: 1.6;
}
</style> 