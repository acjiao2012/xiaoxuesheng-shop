<template>
  <div class="order-detail-page">
    <h2>订单详情</h2>
    <el-card class="order-info-card">
      <div class="order-status">订单状态：<el-tag :type="statusTag(order.status)">{{ order.status }}</el-tag></div>
      <div class="order-id">订单号：{{ order.id }}</div>
      <div class="order-time">下单时间：{{ order.createdAt }}</div>
      <div class="order-total">总金额：￥{{ order.total }}</div>
    </el-card>
    <el-card class="order-items-card" style="margin-top:18px;">
      <h3>商品列表</h3>
      <el-table :data="order.items" style="width:100%">
        <el-table-column prop="title" label="商品名称" />
        <el-table-column prop="count" label="数量" />
        <el-table-column prop="price" label="单价" />
        <el-table-column label="小计">
          <template #default="scope">￥{{ (scope.row.price * scope.row.count).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="logistics-card" style="margin-top:18px;">
      <h3>物流信息</h3>
      <div v-if="order.logistics">
        <div>快递公司：{{ order.logistics.company }}</div>
        <div>运单号：{{ order.logistics.trackingNumber }}</div>
        <el-steps direction="vertical" :active="order.logistics.traces.length-1">
          <el-step v-for="(trace, idx) in order.logistics.traces" :key="idx" :title="trace.status" :description="trace.time" />
        </el-steps>
      </div>
      <div v-else>暂无物流信息</div>
    </el-card>
    <el-button type="primary" style="margin-top:24px;" @click="goBack">返回订单列表</el-button>
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, computed, watchEffect } from 'vue'
import { useUserStore } from '../store/user'
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const orderId = route.params.id as string
// 模拟从订单列表查找
const order = computed(() => {
  const orders: Order[] = JSON.parse(localStorage.getItem('orders')||'[]')
  return orders.find(o => o.id === orderId) || {
    id: orderId, status: 'pending', total: 0, items: [], createdAt: '', updatedAt: '', logistics: null
  }
})
function statusTag(status:string) {
  switch(status) {
    case 'pending': return 'info'
    case 'paid': return 'success'
    case 'shipped': return 'warning'
    case 'completed': return 'success'
    case 'cancelled': return 'danger'
    default: return 'info'
  }
}
function goBack() { router.push('/orders') }
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
  if (order.value.status === 'completed') {
    userStore.addNotification({
      id: Date.now() + '-done',
      type: 'order',
      title: '订单已完成',
      content: `您的订单${order.value.id}已签收，感谢您的购买！`,
      read: false,
      createdAt: new Date().toLocaleString()
    })
  }
  // 物流节点变动推送
  if (order.value.logistics && order.value.logistics.traces.length) {
    const lastTrace = order.value.logistics.traces[order.value.logistics.traces.length-1]
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
.order-detail-page { max-width: 800px; margin: 0 auto; padding: 32px 0; }
.order-info-card, .order-items-card, .logistics-card { margin-bottom: 18px; }
.order-status { font-size: 16px; margin-bottom: 8px; }
.order-id, .order-time, .order-total { color: #888; margin-bottom: 4px; }
</style> 