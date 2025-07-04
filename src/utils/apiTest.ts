import { apiGet } from '../api/client'
import { ElMessage } from 'element-plus'

// API连接测试
export async function testApiConnection() {
  try {
    // 测试基础连接
    const response = await fetch(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/health')
    if (response.ok) {
      console.log('✅ API连接正常')
      return true
    } else {
      console.error('❌ API连接失败:', response.status)
      return false
    }
  } catch (error) {
    console.error('❌ API连接错误:', error)
    ElMessage.error('无法连接到后端服务，请检查服务是否启动')
    return false
  }
}

// 测试支付API
export async function testPaymentApi() {
  try {
    await apiGet('/payment/test')
    console.log('✅ 支付API连接正常')
    return true
  } catch (error) {
    console.error('❌ 支付API连接失败:', error)
    return false
  }
}

// 测试物流API
export async function testLogisticsApi() {
  try {
    await apiGet('/logistics/companies')
    console.log('✅ 物流API连接正常')
    return true
  } catch (error) {
    console.error('❌ 物流API连接失败:', error)
    return false
  }
}

// 测试评价API
export async function testReviewsApi() {
  try {
    await apiGet('/reviews/tags')
    console.log('✅ 评价API连接正常')
    return true
  } catch (error) {
    console.error('❌ 评价API连接失败:', error)
    return false
  }
}

// 完整API测试
export async function runFullApiTest() {
  console.log('🔍 开始API连接测试...')
  
  const results = {
    base: await testApiConnection(),
    payment: await testPaymentApi(),
    logistics: await testLogisticsApi(),
    reviews: await testReviewsApi()
  }
  
  const allPassed = Object.values(results).every(result => result)
  
  if (allPassed) {
    console.log('🎉 所有API连接测试通过')
    ElMessage.success('API连接测试通过')
  } else {
    console.log('⚠️ 部分API连接测试失败')
    ElMessage.warning('部分API连接测试失败，请检查后端服务')
  }
  
  return results
} 