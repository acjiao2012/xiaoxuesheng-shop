<template>
  <div class="payment-container">
    <div class="payment-content">
      <!-- 支付信息 -->
      <div class="payment-info">
        <h2 class="payment-title">订单支付</h2>
        <div class="order-summary">
          <div class="order-no">订单号：{{ orderInfo.orderNo }}</div>
          <div class="payment-amount">支付金额：<span class="amount">￥{{ orderInfo.amount }}</span></div>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="payment-methods">
        <h3>选择支付方式</h3>
        <el-radio-group v-model="selectedPaymentMethod" @change="handlePaymentMethodChange">
          <div class="payment-option" :class="{ active: selectedPaymentMethod === 'alipay' }">
            <el-radio value="alipay">
              <div class="payment-method-info">
                <div class="payment-icon alipay-icon">支</div>
                <div class="payment-details">
                  <div class="payment-name">支付宝</div>
                  <div class="payment-desc">推荐使用支付宝支付</div>
                </div>
              </div>
            </el-radio>
          </div>

          <div class="payment-option" :class="{ active: selectedPaymentMethod === 'wechat' }">
            <el-radio value="wechat">
              <div class="payment-method-info">
                <div class="payment-icon wechat-icon">微</div>
                <div class="payment-details">
                  <div class="payment-name">微信支付</div>
                  <div class="payment-desc">使用微信扫码支付</div>
                </div>
              </div>
            </el-radio>
          </div>

          <div class="payment-option" :class="{ active: selectedPaymentMethod === 'balance' }">
            <el-radio value="balance">
              <div class="payment-method-info">
                <div class="payment-icon balance-icon">余</div>
                <div class="payment-details">
                  <div class="payment-name">余额支付</div>
                  <div class="payment-desc">当前余额：￥{{ userBalance }}</div>
                </div>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>

      <!-- 支付二维码（微信支付） -->
      <div v-if="selectedPaymentMethod === 'wechat' && paymentData.qrCode" class="qr-code-section">
        <h3>请使用微信扫码支付</h3>
        <div class="qr-code-container">
          <img :src="paymentData.qrCode" alt="微信支付二维码" class="qr-code" />
          <div class="qr-tip">请使用微信扫描二维码完成支付</div>
        </div>
        <el-button type="primary" @click="checkPaymentStatus">检查支付状态</el-button>
      </div>

      <!-- 支付宝支付链接 -->
      <div v-if="selectedPaymentMethod === 'alipay' && paymentData.paymentUrl" class="alipay-section">
        <h3>支付宝支付</h3>
        <div class="alipay-info">
          <p>点击下方按钮跳转到支付宝完成支付</p>
          <el-button type="primary" size="large" @click="goToAlipay">去支付宝支付</el-button>
        </div>
      </div>

      <!-- 余额支付确认 -->
      <div v-if="selectedPaymentMethod === 'balance'" class="balance-section">
        <h3>余额支付确认</h3>
        <div class="balance-info">
          <p>当前余额：￥{{ userBalance }}</p>
          <p>支付金额：￥{{ orderInfo.amount }}</p>
          <p v-if="userBalance < orderInfo.amount" class="balance-insufficient">
            余额不足，请选择其他支付方式
          </p>
        </div>
      </div>

      <!-- 支付按钮 -->
      <div class="payment-actions">
        <el-button 
          type="primary" 
          size="large" 
          :disabled="!canPay"
          @click="handlePayment"
          :loading="paymentLoading"
          style="position: relative; z-index: 100;"
        >
          {{ paymentButtonText }}
        </el-button>
        <el-button @click="goBack" style="position: relative; z-index: 100;">返回订单</el-button>
      </div>

      <!-- 支付结果 -->
      <el-dialog v-model="showPaymentResult" title="支付结果" width="400px" :show-close="false">
        <div class="payment-result">
          <div v-if="paymentResult.success" class="success-result">
            <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
            <h3>支付成功！</h3>
            <p>您的订单已支付成功，我们将尽快为您发货</p>
          </div>
          <div v-else class="error-result">
            <el-icon class="error-icon"><CircleCloseFilled /></el-icon>
            <h3>支付失败</h3>
            <p>{{ paymentResult.message || '支付过程中出现错误，请重试' }}</p>
          </div>
        </div>
        <template #footer>
          <el-button v-if="paymentResult.success" type="primary" @click="goToOrderDetail">
            查看订单详情
          </el-button>
          <el-button @click="closePaymentResult">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '../store/order'
import { CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const selectedPaymentMethod = ref('alipay')
const paymentData = ref<PaymentData>({
  paymentNo: '',
  amount: 0
})
const userBalance = ref(0)
const paymentLoading = ref(false)
const showPaymentResult = ref(false)
const paymentResult = ref({ success: false, message: '' })

// 订单信息
const orderInfo = ref({
  orderId: route.params.orderId as string,
  orderNo: '',
  amount: 0
})

// 计算属性
const canPay = computed(() => {
  const canPayResult = selectedPaymentMethod.value === 'balance' 
    ? userBalance.value >= orderInfo.value.amount 
    : true
  console.log('canPay计算:', {
    method: selectedPaymentMethod.value,
    balance: userBalance.value,
    amount: orderInfo.value.amount,
    result: canPayResult
  })
  return canPayResult
})

const paymentButtonText = computed(() => {
  if (paymentLoading.value) return '处理中...'
  if (selectedPaymentMethod.value === 'balance') {
    return userBalance.value >= orderInfo.value.amount ? '确认支付' : '余额不足'
  }
  return '立即支付'
})

// 生命周期
onMounted(() => {
  console.log('Payment组件已挂载')
  loadOrderInfo()
  loadUserBalance()
})

// 方法
async function loadOrderInfo() {
  try {
    console.log('开始加载订单信息')
    const orderId = orderInfo.value.orderId
    
    // 从订单store中获取订单信息
    const orderStore = useOrderStore()
    const order = orderStore.orders.find(o => o.id === orderId)
    
    if (order) {
      orderInfo.value = {
        orderId: order.id,
        orderNo: order.id,
        amount: order.total
      }
      console.log('订单信息加载完成:', orderInfo.value)
    } else {
      console.error('未找到订单:', orderId)
      ElMessage.error('订单不存在')
      router.push('/orders')
    }
  } catch (error) {
    console.error('加载订单信息失败:', error)
    ElMessage.error('加载订单信息失败')
  }
}

async function loadUserBalance() {
  try {
    console.log('开始加载用户余额')
    // 这里应该调用API获取用户余额
    // const response = await api.getUserBalance()
    // userBalance.value = response.data.balance
    
    // 模拟数据
    userBalance.value = 200.00
    console.log('用户余额加载完成:', userBalance.value)
  } catch (error) {
    console.error('加载用户余额失败:', error)
    ElMessage.error('加载用户余额失败')
  }
}

function handlePaymentMethodChange() {
  paymentData.value = {
    paymentNo: '',
    amount: 0
  }
}

async function handlePayment() {
  console.log('支付按钮被点击')
  console.log('canPay:', canPay.value)
  console.log('selectedPaymentMethod:', selectedPaymentMethod.value)
  console.log('userBalance:', userBalance.value)
  console.log('orderInfo:', orderInfo.value)
  
  if (!canPay.value) {
    console.log('支付被禁用，原因：余额不足或其他条件不满足')
    ElMessage.warning('无法支付，请检查支付条件')
    return
  }

  paymentLoading.value = true
  ElMessage.info('正在创建支付订单...')
  
  try {
    // 创建支付订单
    const response = await createPayment()
    console.log('支付订单创建结果:', response)
    
    if (response.success) {
      paymentData.value = response.paymentData
      
      if (selectedPaymentMethod.value === 'balance') {
        // 余额支付直接完成
        ElMessage.success('余额支付成功！')
        showPaymentSuccess()
      } else if (selectedPaymentMethod.value === 'alipay') {
        // 支付宝支付跳转
        ElMessage.success('正在跳转到支付宝...')
        goToAlipay()
      } else if (selectedPaymentMethod.value === 'wechat') {
        // 微信支付显示二维码
        ElMessage.success('请使用微信扫描二维码完成支付')
      }
    } else {
      ElMessage.error(response.message || '创建支付订单失败')
    }
  } catch (error) {
    console.error('支付错误:', error)
    ElMessage.error('支付失败，请重试')
  } finally {
    paymentLoading.value = false
  }
}

async function createPayment() {
  // 模拟API调用
  return new Promise<{
    success: boolean
    message?: string
    paymentData: PaymentData
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: '支付订单创建成功',
        paymentData: {
          paymentUrl: 'https://openapi.alipaydev.com/gateway.do?mock=true',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          paymentNo: `PAY${Date.now()}`,
          amount: orderInfo.value.amount
        }
      })
    }, 1000)
  })
}

function goToAlipay() {
  if (paymentData.value.paymentUrl) {
    window.open(paymentData.value.paymentUrl, '_blank')
  }
}

function checkPaymentStatus() {
  // 检查支付状态
  ElMessage.info('正在检查支付状态...')
}

function showPaymentSuccess() {
  paymentResult.value = {
    success: true,
    message: '支付成功'
  }
  showPaymentResult.value = true
}

function goToOrderDetail() {
  router.push(`/order/${orderInfo.value.orderId}`)
}

function closePaymentResult() {
  showPaymentResult.value = false
  if (paymentResult.value.success) {
    router.push('/orders')
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.payment-container {
  background: #f7faff;
  min-height: 100vh;
  padding: 20px;
}

.payment-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.payment-title {
  text-align: center;
  color: #333;
  margin-bottom: 24px;
}

.order-summary {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.order-no {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.payment-amount {
  font-size: 16px;
  color: #333;
}

.amount {
  font-size: 24px;
  font-weight: bold;
  color: #e74c3c;
}

.payment-methods h3 {
  margin-bottom: 20px;
  color: #333;
}

.payment-option {
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.payment-option.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.payment-method-info {
  display: flex;
  align-items: center;
  padding: 16px;
}

.payment-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 16px;
}

.alipay-icon {
  background: #1677ff;
}

.wechat-icon {
  background: #07c160;
}

.balance-icon {
  background: #f39c12;
}

.payment-details {
  flex: 1;
}

.payment-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.payment-desc {
  font-size: 14px;
  color: #666;
}

.qr-code-section,
.alipay-section,
.balance-section {
  text-align: center;
  margin: 32px 0;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
}

.qr-code-container {
  margin: 20px 0;
}

.qr-code {
  width: 200px;
  height: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.qr-tip {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}

.balance-info p {
  margin: 8px 0;
  font-size: 16px;
}

.balance-insufficient {
  color: #e74c3c;
  font-weight: bold;
}

.payment-actions {
  text-align: center;
  margin-top: 32px;
  position: relative;
  z-index: 10;
}

.payment-actions .el-button {
  margin: 0 8px;
  position: relative;
  z-index: 11;
}

.payment-result {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 48px;
  color: #f56c6c;
  margin-bottom: 16px;
}

.success-result h3,
.error-result h3 {
  margin-bottom: 12px;
}

.success-result p,
.error-result p {
  color: #666;
  line-height: 1.6;
}
</style> 