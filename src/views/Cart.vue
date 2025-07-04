<template>
  <div class="main-container">
    <!-- 购物车内容区 -->
    <div class="cart-content">
      <!-- 商品列表 -->
      <div class="cart-list-area">
        <div class="cart-header-row">
          <span class="cart-header-name">商品信息</span>
          <span class="cart-header-qty">数量</span>
          <span class="cart-header-price">单价</span>
          <span class="cart-header-subtotal">小计</span>
        </div>
        <div v-for="item in cartItems" :key="item.id" class="cart-row">
          <img :src="item.img" class="cart-img" alt="商品图片" @click="showPreview(item.img)" style="cursor:pointer" />
          <div class="cart-info">
            <div class="cart-name link" @click="goProduct(item.id)">{{ item.title }}</div>
            <div class="cart-attr">颜色：{{ item.color }}<span v-if="item.size">，尺寸：{{ item.size }}</span></div>
          </div>
          <el-input-number v-model="item.count" :min="1" size="small" class="cart-qty" @change="updateTotal" />
          <div class="cart-price">￥{{ item.price }}</div>
          <div class="cart-subtotal">￥{{ (item.price * item.count).toFixed(2) }}</div>
          <el-button type="danger" size="small" @click="removeItem(item.id)">删除</el-button>
        </div>
        <div v-if="!cartItems.length" class="empty-tip">
          购物车空空如也，快去选购手办吧！
          <el-button type="primary" style="margin-top: 24px;" @click="goHome">返回首页</el-button>
        </div>
        <div class="cart-action-row" v-if="cartItems.length">
          <el-button class="update-btn" type="default" plain @click="updateTotal">更新购物车</el-button>
          <el-button class="clear-btn" type="danger" plain @click="clearCart">清空购物车</el-button>
        </div>
      </div>
      <!-- 结算卡片 -->
      <div class="cart-summary-card">
        <div class="summary-title">购物车汇总</div>
        <div class="summary-row">
          <span>小计</span>
          <span>￥{{ subtotal }}</span>
        </div>
        <div class="summary-row">
          <span>运费</span>
          <span style="color:#67c23a;font-weight:bold">￥0（全场包邮）</span>
        </div>
        <el-input v-model="coupon" placeholder="输入优惠码" class="summary-input">
          <template #append>
            <el-button type="primary" size="small" @click="applyCoupon">应用</el-button>
          </template>
        </el-input>
        <el-input v-model="address" placeholder="收货地址" class="summary-input" />
        <div class="summary-row" v-if="discount > 0">
          <span>优惠</span>
          <span style="color: #67c23a;">-￥{{ discount }}</span>
        </div>
        <div class="summary-row total-row">
          <span>总计</span>
          <span class="summary-total">￥{{ totalPrice }}</span>
        </div>
        <el-button type="primary" size="large" class="checkout-btn" :disabled="!cartItems.length" @click="goCheckout">去结算</el-button>
      </div>
    </div>
    <!-- 图片预览Dialog -->
    <el-dialog v-model="previewVisible" width="400px" :show-close="true" append-to-body>
      <img :src="previewImg" alt="预览" style="width:100%" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { imageUtils } from '../utils/imageUtils'

const router = useRouter()

const defaultCart = [
  { id: 1, productId: 1, title: 'Q版小熊猫手办', price: 59, img: imageUtils.getProductImage(1), count: 1, color: '绿色', size: '小' },
  { id: 2, productId: 2, title: '魔法少女小樱', price: 89, img: imageUtils.getProductImage(2), count: 2, color: '粉色', size: '中' },
]

const cartItems = ref(JSON.parse(localStorage.getItem('cartItems') || 'null') || defaultCart)

watch(cartItems, (val) => {
  localStorage.setItem('cartItems', JSON.stringify(val))
}, { deep: true })

const coupon = ref('')
const address = ref('')
const discount = ref(0)

const subtotal = computed(() => cartItems.value.reduce((sum: number, item: any) => sum + item.price * item.count, 0).toFixed(2))
const totalPrice = computed(() => (parseFloat(subtotal.value) - discount.value).toFixed(2))

function updateTotal() {
  cartItems.value = [...cartItems.value]
}

function removeItem(id: number) {
  cartItems.value = cartItems.value.filter((item: any) => item.id !== id)
  updateTotal()
  ElMessage.success('已删除该商品')
}
function clearCart() {
  cartItems.value = []
  updateTotal()
  localStorage.removeItem('cartItems')
  ElMessage.success('购物车已清空')
}
function applyCoupon() {
  if (coupon.value.trim().toUpperCase() === 'SAVE10' && parseFloat(subtotal.value) >= 100) {
    discount.value = 10
    ElMessage.success('优惠码应用成功，已减10元！')
  } else if (coupon.value.trim() && parseFloat(subtotal.value) < 100) {
    discount.value = 0
    ElMessage.warning('订单满100元才可用此优惠码')
  } else {
    discount.value = 0
    if (coupon.value.trim()) ElMessage.error('优惠码无效')
  }
}
function goCheckout() {
  if (!address.value) {
    ElMessage.warning('请填写收货地址')
    return
  }
  ElMessage.success('结算成功，正在跳转...')
  setTimeout(() => {
    clearCart()
    router.push('/checkout')
  }, 800)
}
function goHome() {
  router.push('/')
}
function goProduct(id: number) {
  router.push(`/product/${id}`)
}
// 图片预览
const previewVisible = ref(false)
const previewImg = ref('')
function showPreview(img: string) {
  previewImg.value = img
  previewVisible.value = true
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
.cart-content {
  display: flex;
  gap: 32px;
  margin: 40px auto 0 auto;
  max-width: 1100px;
  min-height: 500px;
}
.cart-list-area {
  flex: 2;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px #eee;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cart-header-row {
  display: flex;
  font-weight: bold;
  color: #222;
  font-size: 16px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 12px;
  margin-bottom: 16px;
}
.cart-header-name { flex: 2; }
.cart-header-qty { flex: 1; text-align: center; }
.cart-header-price { flex: 1; text-align: center; }
.cart-header-subtotal { flex: 1; text-align: center; }
.cart-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding: 18px 0;
  gap: 16px;
}
.cart-row:last-child { border-bottom: none; }
.cart-img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 12px;
  transition: box-shadow 0.2s;
}
.cart-img:hover {
  box-shadow: 0 0 0 2px #409eff;
}
.cart-info {
  flex: 2;
  min-width: 0;
}
.cart-name {
  font-size: 18px;
  font-weight: bold;
  color: #222;
  margin-bottom: 2px;
}
.cart-name.link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}
.cart-attr {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}
.cart-qty {
  flex: 1;
  text-align: center;
}
.cart-price, .cart-subtotal {
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #222;
}
.cart-subtotal {
  font-weight: bold;
  color: #ff9800;
}
.empty-tip {
  text-align: center;
  color: #bbb;
  font-size: 18px;
  margin: 48px 0;
}
.cart-action-row {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}
.update-btn {
  border: 1.5px solid #222;
  color: #222;
  background: #fff;
  font-weight: bold;
}
.clear-btn {
  border: 1.5px solid #ff4d4f;
  color: #ff4d4f;
  background: #fff;
  font-weight: bold;
}
.cart-summary-card {
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
  gap: 18px;
}
.summary-title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  margin-bottom: 12px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  margin-bottom: 8px;
}
.total-row {
  font-size: 18px;
  font-weight: bold;
  color: #222;
  margin-top: 12px;
}
.summary-total {
  color: #ff9800;
  font-size: 20px;
  font-weight: bold;
}
.summary-input {
  margin-bottom: 8px;
}
.checkout-btn {
  width: 100%;
  font-size: 18px;
  font-weight: bold;
  margin-top: 8px;
}
</style> 