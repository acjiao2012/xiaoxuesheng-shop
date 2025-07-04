<template>
  <div class="order-detail-page">
    <h2>订单详情</h2>
    
    <!-- 订单基本信息 -->
    <el-card class="order-info-card">
      <div class="order-header">
        <div class="order-status">
          订单状态：<el-tag :type="statusTag(order.status)">{{ getStatusText(order.status) }}</el-tag>
        </div>
        <div class="order-actions">
          <!-- 支付按钮 -->
          <el-button 
            v-if="order.status === 'pending'" 
            type="primary" 
            @click="goToPayment"
          >
            立即支付
          </el-button>
          
          <!-- 查看物流按钮 -->
          <el-button 
            v-if="['paid', 'shipped', 'delivered'].includes(order.status)" 
            type="info" 
            @click="goToLogistics"
          >
            查看物流
          </el-button>
          
          <!-- 评价按钮 -->
          <el-button 
            v-if="order.status === 'delivered' && !order.reviewed" 
            type="success" 
            @click="goToReview"
          >
            评价商品
          </el-button>
          
          <!-- 取消订单按钮 -->
          <el-button 
            v-if="order.status === 'pending'" 
            type="danger" 
            @click="cancelOrder"
          >
            取消订单
          </el-button>
        </div>
      </div>
      
      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ order.id }}</span>
        </div>
        <div class="info-item">
          <span class="label">下单时间：</span>
          <span class="value">{{ formatTime(order.createdAt) }}</span>
        </div>
        <div class="info-item">
          <span class="label">总金额：</span>
          <span class="value amount">￥{{ order.total }}</span>
        </div>
        <div class="info-item" v-if="order.paymentMethod">
          <span class="label">支付方式：</span>
          <span class="value">{{ getPaymentMethodText(order.paymentMethod) }}</span>
        </div>
      </div>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="order-items-card">
      <h3>商品列表</h3>
      <div class="items-list">
        <div v-for="item in order.items" :key="item.id" class="item-card">
          <img :src="item.image" :alt="item.title" class="item-image" />
          <div class="item-info">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-meta">
              <span class="item-price">￥{{ item.price }}</span>
              <span class="item-count">x{{ item.count }}</span>
            </div>
            <div class="item-total">小计：￥{{ (item.price * item.count).toFixed(2) }}</div>
          </div>
          <div class="item-actions">
            <el-button 
              v-if="order.status === 'delivered' && !item.reviewed" 
              size="small" 
              @click="goToReview(String(item.id))"
            >
              评价
            </el-button>
            <el-button 
              v-if="order.status === 'delivered' && item.reviewed" 
              size="small" 
              type="info" 
              @click="viewReview(String(item.id))"
            >
              查看评价
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 物流信息 -->
    <el-card class="logistics-card" v-if="order.logistics">
      <h3>物流信息</h3>
      <div class="logistics-info">
        <div class="logistics-header">
          <div class="company-info">
            <div class="company-name">{{ order.logistics.company }}</div>
            <div class="tracking-number">运单号：{{ order.logistics.trackingNumber }}</div>
          </div>
          <el-button type="primary" size="small" @click="goToLogistics">查看详情</el-button>
        </div>
        
        <el-steps direction="vertical" :active="order.logistics.trackingInfo.length-1" class="logistics-steps">
          <el-step 
            v-for="(trace, idx) in order.logistics.trackingInfo" 
            :key="idx" 
            :title="trace.status" 
            :description="trace.time" 
          />
        </el-steps>
      </div>
    </el-card>

    <!-- 收货地址 -->
    <el-card class="address-card">
      <h3>收货信息</h3>
      <div class="address-info">
        <div class="receiver-name">{{ order.address?.name }}</div>
        <div class="receiver-phone">{{ order.address?.phone }}</div>
        <div class="receiver-address">{{ order.address?.fullAddress }}</div>
      </div>
    </el-card>

    <div class="page-actions">
      <el-button @click="goBack">返回订单列表</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, watchEffect, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import { useOrderStore } from '../store/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()
const orderId = route.params.id as string

// 确保订单数据已加载
onMounted(() => {
  orderStore.loadOrders()
})

// 从订单store中获取订单
const order = computed(() => {
  const orderStore = useOrderStore()
  const foundOrder = orderStore.orders.find(o => o.id === orderId)
  
  if (foundOrder) {
    return foundOrder
  }
  
  // 如果没找到订单，返回默认数据（用于演示）
  return {
    id: orderId, 
    status: 'pending', 
    total: 158.00, 
    items: [
      {
        id: '1',
        productId: 1,
        title: 'Q版小熊猫手办',
        price: 59.00,
        count: 1,
        img: '/images/products/product-1-panda.jpg',
        image: '/images/products/product-1-panda.jpg',
        reviewed: false
      },
      {
        id: '2',
        productId: 2,
        title: '魔法少女小樱',
        price: 89.00,
        count: 1,
        img: '/images/products/product-2-sakura.jpg',
        image: '/images/products/product-2-sakura.jpg',
        reviewed: false
      }
    ], 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(), 
    logistics: null,
    paymentMethod: 'alipay',
    reviewed: false,
    address: {
      id: '1',
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '广州市',
      detail: '天河区珠江新城xxx街道xxx号',
      fullAddress: '广东省广州市天河区珠江新城xxx街道xxx号',
      isDefault: false
    }
  }
})

function statusTag(status: string) {
  switch(status) {
    case 'pending': return 'info'
    case 'paid': return 'success'
    case 'shipped': return 'warning'
    case 'delivered': return 'success'
    case 'cancelled': return 'danger'
    default: return 'info'
  }
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'pending': '待支付',
    'paid': '已支付',
    'shipped': '已发货',
    'delivered': '已送达',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

function getPaymentMethodText(method: string) {
  const methodMap: Record<string, string> = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'balance': '余额支付'
  }
  return methodMap[method] || method
}

function formatTime(timeString: string) {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN')
}

function goToPayment() {
  router.push(`/payment/${orderId}`)
}

function goToLogistics() {
  router.push(`/logistics/${orderId}`)
}

function goToReview(productId?: string) {
  if (productId) {
    router.push(`/review/${productId}/${orderId}`)
  } else {
    // 跳转到第一个未评价的商品
    const unreviewedItem = order.value.items.find(item => !item.reviewed)
    if (unreviewedItem) {
      router.push(`/review/${unreviewedItem.id}/${orderId}`)
    }
  }
}

function viewReview(productId: string) {
  router.push(`/reviews/${productId}`)
}

async function cancelOrder() {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 直接修改订单状态
    if (order.value) {
      order.value.status = 'cancelled'
      order.value.updatedAt = new Date().toISOString()
      orderStore.updateOrder(order.value as Order)
    }
    
    ElMessage.success('订单已取消')
    router.push('/orders')
  } catch {
    // 用户取消操作
  }
}

function goBack() { 
  router.push('/orders') 
}

// 自动推送订单/物流变动消息
watchEffect(() => {
  if (!order.value) return
  // 订单状态变动推送
  if (order.value.status === 'shipped') {
    userStore.addNotification({
      id: Date.now() + '-ship',
      type: 'logistics',
      title: '订单已发货',
      content: `您的订单${order.value.id}已发货，快递公司：${order.value.logistics?.company}`,
      read: false,
      createdAt: new Date().toLocaleString()
    })
  }
  if (order.value.status === 'delivered') {
    userStore.addNotification({
      id: Date.now() + '-done',
      type: 'order',
      title: '订单已送达',
      content: `您的订单${order.value.id}已签收，感谢您的购买！`,
      read: false,
      createdAt: new Date().toLocaleString()
    })
  }
  // 物流节点变动推送
  if (order.value.logistics && order.value.logistics.trackingInfo.length) {
    const lastTrace = order.value.logistics.trackingInfo[order.value.logistics.trackingInfo.length-1]
    userStore.addNotification({
      id: Date.now() + '-trace',
      type: 'logistics',
      title: '物流更新',
      content: `您的订单${order.value.id}物流状态更新：${lastTrace.status}`,
      read: false,
      createdAt: new Date().toLocaleString()
    })
  }
})
</script>

<style scoped>
.order-detail-page { 
  max-width: 800px; 
  margin: 0 auto; 
  padding: 32px 0; 
}

.order-info-card, .order-items-card, .logistics-card, .address-card { 
  margin-bottom: 18px; 
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.order-status { 
  font-size: 16px; 
}

.order-actions {
  display: flex;
  gap: 8px;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  margin-right: 8px;
  min-width: 80px;
}

.value {
  color: #333;
}

.amount {
  font-weight: bold;
  color: #e74c3c;
  font-size: 18px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 16px;
}

.item-info {
  flex: 1;
}

.item-title {
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.item-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 4px;
}

.item-price {
  color: #e74c3c;
  font-weight: bold;
}

.item-count {
  color: #666;
}

.item-total {
  color: #333;
  font-weight: bold;
}

.item-actions {
  margin-left: 16px;
}

.logistics-info {
  margin-top: 16px;
}

.logistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.company-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.tracking-number {
  color: #666;
  font-size: 14px;
}

.logistics-steps {
  margin-top: 16px;
}

.address-info {
  line-height: 1.6;
}

.receiver-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.receiver-phone {
  color: #666;
  margin-bottom: 4px;
}

.receiver-address {
  color: #666;
}

.page-actions {
  text-align: center;
  margin-top: 24px;
}
</style> 