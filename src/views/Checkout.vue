<template>
  <div class="main-container">
    <!-- 结算内容区 -->
    <div class="checkout-content">
      <!-- 左侧表单区 -->
      <div class="checkout-form-area">
        <!-- 收货信息 -->
        <div class="form-section">
          <h3 class="section-title">收货信息</h3>
          <el-form :model="shippingForm" label-position="top">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="收货人姓名">
                  <el-input v-model="shippingForm.name" placeholder="请输入收货人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话">
                  <el-input v-model="shippingForm.phone" placeholder="请输入联系电话" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="收货地址">
              <el-input v-model="shippingForm.address" placeholder="请输入详细收货地址" />
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="省份">
                  <el-select v-model="shippingForm.province" placeholder="请选择省份" style="width: 100%">
                    <el-option label="北京市" value="北京" />
                    <el-option label="上海市" value="上海" />
                    <el-option label="广东省" value="广东" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市">
                  <el-select v-model="shippingForm.city" placeholder="请选择城市" style="width: 100%">
                    <el-option label="北京市" value="北京" />
                    <el-option label="上海市" value="上海" />
                    <el-option label="广州市" value="广州" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="邮编">
                  <el-input v-model="shippingForm.zipcode" placeholder="请输入邮编" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 支付方式 -->
        <div class="form-section">
          <h3 class="section-title">支付方式</h3>
          <el-radio-group v-model="paymentMethod">
            <div class="payment-options">
              <el-radio value="parent" class="payment-option">
                <div class="payment-info">
                  <div class="payment-name">家长支付</div>
                  <div class="payment-desc">通过家长账号安全支付</div>
                </div>
              </el-radio>
              <el-radio value="wechat" class="payment-option">
                <div class="payment-info">
                  <div class="payment-name">微信支付</div>
                  <div class="payment-desc">使用微信扫码支付</div>
                </div>
              </el-radio>
              <el-radio value="alipay" class="payment-option">
                <div class="payment-info">
                  <div class="payment-name">支付宝</div>
                  <div class="payment-desc">使用支付宝支付</div>
                </div>
              </el-radio>
            </div>
          </el-radio-group>
          <div v-if="paymentMethod === 'parent'" style="color:#409eff;font-size:14px;margin-top:8px;">
            家长支付更安全，需家长账号授权
          </div>
        </div>

        <!-- 订单备注 -->
        <div class="form-section">
          <h3 class="section-title">订单备注</h3>
          <el-input v-model="orderNote" type="textarea" :rows="3" placeholder="请输入订单备注（选填）" />
        </div>
      </div>

      <!-- 右侧订单汇总 -->
      <div class="checkout-summary-card">
        <div class="summary-title">订单汇总</div>
        
        <!-- 商品列表 -->
        <div class="order-items">
          <div v-for="item in orderItems" :key="item.id" class="order-item">
            <img :src="item.img" class="order-item-img" alt="商品图片" />
            <div class="order-item-info">
              <div class="order-item-name">{{ item.title }}</div>
              <div class="order-item-attr">颜色：{{ item.color }}，尺寸：{{ item.size }}</div>
              <div class="order-item-qty">数量：{{ item.count }}</div>
            </div>
            <div class="order-item-price">￥{{ (item.price * item.count).toFixed(2) }}</div>
          </div>
        </div>

        <!-- 费用明细 -->
        <div class="fee-details">
          <div class="fee-row">
            <span>商品小计</span>
            <span>￥{{ subtotal }}</span>
          </div>
          <div class="fee-row">
            <span>运费</span>
            <span style="color:#67c23a;font-weight:bold">￥0（全场包邮）</span>
          </div>
          <div class="fee-row discount" v-if="discount > 0">
            <span>优惠折扣</span>
            <span>-￥{{ discount }}</span>
          </div>
          <div class="fee-row total">
            <span>总计</span>
            <span class="total-amount">￥{{ totalAmount }}</span>
          </div>
        </div>

        <!-- 优惠券 -->
        <el-input v-model="couponCode" placeholder="输入优惠券代码" class="coupon-input">
          <template #append>
            <el-button type="primary" size="small">应用</el-button>
          </template>
        </el-input>

        <!-- 提交订单 -->
        <el-button 
          type="primary" 
          size="large" 
          class="submit-btn" 
          @click="submitOrder"
          :loading="submitting"
          :disabled="submitting"
        >
          {{ submitting ? '提交中...' : '提交订单' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '../store/order'
import { useUserStore } from '../store/user'
import { imageUtils } from '../utils/imageUtils'

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

const shippingForm = ref({
  name: '',
  phone: '',
  address: '',
  province: '',
  city: '',
  zipcode: ''
})

const paymentMethod = ref('parent')
const orderNote = ref('')
const couponCode = ref('')
const submitting = ref(false)

// 从购物车获取商品数据
const orderItems = ref<CartItem[]>([])

// 初始化时从localStorage获取购物车数据
onMounted(() => {
  const cartData = localStorage.getItem('cartItems')
  if (cartData) {
    try {
      const cartItems = JSON.parse(cartData)
      if (Array.isArray(cartItems) && cartItems.length > 0) {
        orderItems.value = cartItems
      } else {
        // 如果没有购物车数据，使用默认数据
        orderItems.value = [
          { id: 1, productId: 1, title: 'Q版小熊猫手办', price: 59, img: imageUtils.getProductImage(1), count: 1, color: '绿色', size: '小' },
          { id: 2, productId: 2, title: '魔法少女小樱', price: 89, img: imageUtils.getProductImage(2), count: 2, color: '粉色', size: '中' },
        ]
      }
    } catch (error) {
      console.error('解析购物车数据失败:', error)
      // 使用默认数据
      orderItems.value = [
        { id: 1, productId: 1, title: 'Q版小熊猫手办', price: 59, img: imageUtils.getProductImage(1), count: 1, color: '绿色', size: '小' },
        { id: 2, productId: 2, title: '魔法少女小樱', price: 89, img: imageUtils.getProductImage(2), count: 2, color: '粉色', size: '中' },
      ]
    }
  } else {
    // 使用默认数据
    orderItems.value = [
      { id: 1, productId: 1, title: 'Q版小熊猫手办', price: 59, img: imageUtils.getProductImage(1), count: 1, color: '绿色', size: '小' },
      { id: 2, productId: 2, title: '魔法少女小樱', price: 89, img: imageUtils.getProductImage(2), count: 2, color: '粉色', size: '中' },
    ]
  }
})

const subtotal = computed(() => orderItems.value.reduce((sum, item) => sum + item.price * item.count, 0).toFixed(2))
const shipping = ref(10)
const discount = ref(0)
const totalAmount = computed(() => (parseFloat(subtotal.value) + shipping.value - discount.value).toFixed(2))

// 表单验证
function validateForm() {
  if (!shippingForm.value.name.trim()) {
    ElMessage.error('请输入收货人姓名')
    return false
  }
  if (!shippingForm.value.phone.trim()) {
    ElMessage.error('请输入联系电话')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(shippingForm.value.phone)) {
    ElMessage.error('请输入正确的手机号码')
    return false
  }
  if (!shippingForm.value.province.trim()) {
    ElMessage.error('请选择省份')
    return false
  }
  if (!shippingForm.value.city.trim()) {
    ElMessage.error('请选择城市')
    return false
  }
  if (!shippingForm.value.address.trim()) {
    ElMessage.error('请输入详细地址')
    return false
  }
  return true
}

// 生成订单号
function generateOrderId() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `ORDER${timestamp}${random}`
}

// 创建订单对象
function createOrder() {
  const orderId = generateOrderId()
  const now = new Date().toISOString()
  
  const order: Order = {
    id: orderId,
    status: 'pending',
    total: parseFloat(totalAmount.value),
    items: orderItems.value.map(item => ({
      ...item,
      productId: item.id,
      reviewed: false
    })),
    createdAt: now,
    updatedAt: now,
    paymentMethod: paymentMethod.value as 'alipay' | 'wechat' | 'balance',
    reviewed: false,
    address: {
      id: Date.now().toString(),
      name: shippingForm.value.name,
      phone: shippingForm.value.phone,
      province: shippingForm.value.province,
      city: shippingForm.value.city,
      detail: shippingForm.value.address,
      fullAddress: `${shippingForm.value.province}${shippingForm.value.city}${shippingForm.value.address}`,
      isDefault: false
    }
  }
  
  return order
}

async function submitOrder() {
  // 检查用户登录状态
  if (!userStore.isLogin) {
    ElMessageBox.confirm('请先登录后再下单', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/login')
    })
    return
  }

  // 表单验证
  if (!validateForm()) {
    return
  }

  // 检查余额（如果选择余额支付）
  if (paymentMethod.value === 'balance') {
    const userBalance = userStore.userInfo?.balance || 0
    if (userBalance < parseFloat(totalAmount.value)) {
      ElMessage.error('余额不足，请选择其他支付方式')
      return
    }
  }

  submitting.value = true

  try {
    // 创建订单
    const order = createOrder()
    
    // 保存订单到store
    orderStore.addOrder(order)
    
    // 清空购物车（这里可以添加清空购物车的逻辑）
    // cartStore.clearCart()
    
    // 显示成功消息
    ElMessage.success('订单创建成功！')
    
    // 跳转到支付页面
    router.push(`/payment/${order.id}`)
    
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('提交订单失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.main-container {
  background: #f7faff;
  max-width: 1200px;
  margin: 0 auto 32px auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px #eee;
  padding: 0 0 32px 0;
}
.checkout-content {
  display: flex;
  gap: 32px;
  margin: 40px auto 0 auto;
  max-width: 1100px;
  min-height: 600px;
}
.checkout-form-area {
  flex: 2;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px #eee;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.form-section {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 24px;
}
.form-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}
.section-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  margin-bottom: 20px;
}
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.payment-option {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 0;
  width: 100%;
}
.payment-option:hover {
  border-color: #409eff;
}
.payment-info {
  margin-left: 8px;
}
.payment-name {
  font-size: 16px;
  font-weight: bold;
  color: #222;
}
.payment-desc {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}
.checkout-summary-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px #eee;
  padding: 32px 24px;
  min-width: 320px;
  max-width: 340px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.summary-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  margin-bottom: 8px;
}
.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
}
.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}
.order-item:last-child {
  border-bottom: none;
}
.order-item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}
.order-item-info {
  flex: 1;
  min-width: 0;
}
.order-item-name {
  font-size: 14px;
  font-weight: bold;
  color: #222;
  margin-bottom: 4px;
}
.order-item-attr, .order-item-qty {
  font-size: 12px;
  color: #888;
  margin-bottom: 2px;
}
.order-item-price {
  font-size: 16px;
  font-weight: bold;
  color: #ff9800;
}
.fee-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}
.fee-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.fee-row.discount {
  color: #52c41a;
}
.fee-row.total {
  font-size: 16px;
  font-weight: bold;
  color: #222;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  margin-top: 8px;
}
.total-amount {
  color: #ff9800;
  font-size: 18px;
}
.coupon-input {
  margin-top: 8px;
}
.submit-btn {
  width: 100%;
  font-size: 18px;
  font-weight: bold;
  margin-top: 16px;
}
</style> 