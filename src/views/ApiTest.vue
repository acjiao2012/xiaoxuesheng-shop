<template>
  <div class="api-test-container">
    <div class="api-test-content">
      <h2 class="api-test-title">API接口测试</h2>
      
      <!-- 基础连接测试 -->
      <div class="test-section">
        <h3>基础连接测试</h3>
        <el-button type="primary" @click="testBasicConnection" :loading="basicLoading">
          测试基础连接
        </el-button>
        <div v-if="basicResult" class="test-result" :class="basicResult.success ? 'success' : 'error'">
          <el-icon><component :is="basicResult.success ? 'CircleCheckFilled' : 'CircleCloseFilled'" /></el-icon>
          <span>{{ basicResult.message }}</span>
        </div>
      </div>

      <!-- 支付API测试 -->
      <div class="test-section">
        <h3>支付API测试</h3>
        <el-button type="primary" @click="testPaymentAPI" :loading="paymentLoading">
          测试支付API
        </el-button>
        <div v-if="paymentResult" class="test-result" :class="paymentResult.success ? 'success' : 'error'">
          <el-icon><component :is="paymentResult.success ? 'CircleCheckFilled' : 'CircleCloseFilled'" /></el-icon>
          <span>{{ paymentResult.message }}</span>
        </div>
      </div>

      <!-- 物流API测试 -->
      <div class="test-section">
        <h3>物流API测试</h3>
        <el-button type="primary" @click="testLogisticsAPI" :loading="logisticsLoading">
          测试物流API
        </el-button>
        <div v-if="logisticsResult" class="test-result" :class="logisticsResult.success ? 'success' : 'error'">
          <el-icon><component :is="logisticsResult.success ? 'CircleCheckFilled' : 'CircleCloseFilled'" /></el-icon>
          <span>{{ logisticsResult.message }}</span>
        </div>
      </div>

      <!-- 评价API测试 -->
      <div class="test-section">
        <h3>评价API测试</h3>
        <el-button type="primary" @click="testReviewsAPI" :loading="reviewsLoading">
          测试评价API
        </el-button>
        <div v-if="reviewsResult" class="test-result" :class="reviewsResult.success ? 'success' : 'error'">
          <el-icon><component :is="reviewsResult.success ? 'CircleCheckFilled' : 'CircleCloseFilled'" /></el-icon>
          <span>{{ reviewsResult.message }}</span>
        </div>
      </div>

      <!-- 一键测试所有API -->
      <div class="test-section">
        <h3>一键测试所有API</h3>
        <el-button type="success" @click="testAllAPIs" :loading="allLoading">
          测试所有API
        </el-button>
        <div v-if="allResult" class="test-result" :class="allResult.success ? 'success' : 'error'">
          <el-icon><component :is="allResult.success ? 'CircleCheckFilled' : 'CircleCloseFilled'" /></el-icon>
          <span>{{ allResult.message }}</span>
        </div>
      </div>

      <!-- 测试结果详情 -->
      <div v-if="testDetails.length > 0" class="test-details">
        <h3>测试详情</h3>
        <el-table :data="testDetails" style="width: 100%">
          <el-table-column prop="api" label="API接口" width="200" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
                {{ scope.row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="结果信息" />
          <el-table-column prop="time" label="响应时间" width="120">
            <template #default="scope">
              {{ scope.row.time }}ms
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
// import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { testApiConnection, testPaymentApi, testLogisticsApi, testReviewsApi } from '../utils/apiTest'

// 响应式数据
const basicLoading = ref(false)
const paymentLoading = ref(false)
const logisticsLoading = ref(false)
const reviewsLoading = ref(false)
const allLoading = ref(false)

const basicResult = ref<{ success: boolean; message: string } | null>(null)
const paymentResult = ref<{ success: boolean; message: string } | null>(null)
const logisticsResult = ref<{ success: boolean; message: string } | null>(null)
const reviewsResult = ref<{ success: boolean; message: string } | null>(null)
const allResult = ref<{ success: boolean; message: string } | null>(null)

const testDetails = ref<Array<{
  api: string
  status: 'success' | 'error'
  message: string
  time: number
}>>([])

// 测试基础连接
async function testBasicConnection() {
  basicLoading.value = true
  basicResult.value = null
  
  try {
    const startTime = Date.now()
    const success = await testApiConnection()
    const endTime = Date.now()
    
    basicResult.value = {
      success,
      message: success ? '基础连接成功' : '基础连接失败'
    }
    
    testDetails.value.push({
      api: '基础连接',
      status: success ? 'success' : 'error',
      message: success ? '基础连接成功' : '基础连接失败',
      time: endTime - startTime
    })
    
    if (success) {
      ElMessage.success('基础连接测试成功')
    } else {
      ElMessage.error('基础连接测试失败')
    }
  } catch (error) {
    basicResult.value = {
      success: false,
      message: '测试过程中出现错误'
    }
    ElMessage.error('基础连接测试失败')
  } finally {
    basicLoading.value = false
  }
}

// 测试支付API
async function testPaymentAPI() {
  paymentLoading.value = true
  paymentResult.value = null
  
  try {
    const startTime = Date.now()
    const success = await testPaymentApi()
    const endTime = Date.now()
    
    paymentResult.value = {
      success,
      message: success ? '支付API连接成功' : '支付API连接失败'
    }
    
    testDetails.value.push({
      api: '支付API',
      status: success ? 'success' : 'error',
      message: success ? '支付API连接成功' : '支付API连接失败',
      time: endTime - startTime
    })
    
    if (success) {
      ElMessage.success('支付API测试成功')
    } else {
      ElMessage.error('支付API测试失败')
    }
  } catch (error) {
    paymentResult.value = {
      success: false,
      message: '测试过程中出现错误'
    }
    ElMessage.error('支付API测试失败')
  } finally {
    paymentLoading.value = false
  }
}

// 测试物流API
async function testLogisticsAPI() {
  logisticsLoading.value = true
  logisticsResult.value = null
  
  try {
    const startTime = Date.now()
    const success = await testLogisticsApi()
    const endTime = Date.now()
    
    logisticsResult.value = {
      success,
      message: success ? '物流API连接成功' : '物流API连接失败'
    }
    
    testDetails.value.push({
      api: '物流API',
      status: success ? 'success' : 'error',
      message: success ? '物流API连接成功' : '物流API连接失败',
      time: endTime - startTime
    })
    
    if (success) {
      ElMessage.success('物流API测试成功')
    } else {
      ElMessage.error('物流API测试失败')
    }
  } catch (error) {
    logisticsResult.value = {
      success: false,
      message: '测试过程中出现错误'
    }
    ElMessage.error('物流API测试失败')
  } finally {
    logisticsLoading.value = false
  }
}

// 测试评价API
async function testReviewsAPI() {
  reviewsLoading.value = true
  reviewsResult.value = null
  
  try {
    const startTime = Date.now()
    const success = await testReviewsApi()
    const endTime = Date.now()
    
    reviewsResult.value = {
      success,
      message: success ? '评价API连接成功' : '评价API连接失败'
    }
    
    testDetails.value.push({
      api: '评价API',
      status: success ? 'success' : 'error',
      message: success ? '评价API连接成功' : '评价API连接失败',
      time: endTime - startTime
    })
    
    if (success) {
      ElMessage.success('评价API测试成功')
    } else {
      ElMessage.error('评价API测试失败')
    }
  } catch (error) {
    reviewsResult.value = {
      success: false,
      message: '测试过程中出现错误'
    }
    ElMessage.error('评价API测试失败')
  } finally {
    reviewsLoading.value = false
  }
}

// 测试所有API
async function testAllAPIs() {
  allLoading.value = true
  allResult.value = null
  testDetails.value = []
  
  try {
    const startTime = Date.now()
    const results = await Promise.all([
      testApiConnection(),
      testPaymentApi(),
      testLogisticsApi(),
      testReviewsApi()
    ])
    const endTime = Date.now()
    
    const successCount = results.filter((r: boolean) => r).length
    const totalCount = results.length
    
    allResult.value = {
      success: successCount === totalCount,
      message: `测试完成：${successCount}/${totalCount} 个API测试成功`
    }
    
    // 添加详细结果
    const apiNames = ['基础连接', '支付API', '物流API', '评价API']
    results.forEach((result: boolean, index: number) => {
      testDetails.value.push({
        api: apiNames[index],
        status: result ? 'success' : 'error',
        message: result ? `${apiNames[index]}连接成功` : `${apiNames[index]}连接失败`,
        time: endTime - startTime
      })
    })
    
    if (successCount === totalCount) {
      ElMessage.success('所有API测试成功')
    } else {
      ElMessage.warning(`部分API测试失败：${successCount}/${totalCount}`)
    }
  } catch (error) {
    allResult.value = {
      success: false,
      message: '测试过程中出现错误'
    }
    ElMessage.error('API测试失败')
  } finally {
    allLoading.value = false
  }
}
</script>

<style scoped>
.api-test-container {
  background: #f7faff;
  min-height: 100vh;
  padding: 20px;
}

.api-test-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.api-test-title {
  text-align: center;
  color: #333;
  margin-bottom: 32px;
}

.test-section {
  margin-bottom: 32px;
  padding: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.test-section h3 {
  margin-bottom: 16px;
  color: #333;
}

.test-result {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 4px;
}

.test-result.success {
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3d8ff;
}

.test-result.error {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fbc4c4;
}

.test-details {
  margin-top: 32px;
  padding: 24px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: #fafafa;
}

.test-details h3 {
  margin-bottom: 16px;
  color: #333;
}
</style> 