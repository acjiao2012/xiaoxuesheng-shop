<template>
  <div class="orders-page">
    <h2>我的订单</h2>
    <el-table :data="orders" style="width:100%">
      <el-table-column prop="id" label="订单号" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="statusTag(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="total" label="总金额" />
      <el-table-column prop="createdAt" label="下单时间" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="goDetail(scope.row.id)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="!orders.length" class="empty-tip">暂无订单</div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useOrderStore } from '../store/order'
// import { imageUtils } from '../utils/imageUtils'

const router = useRouter()
const orderStore = useOrderStore()
const orders = ref<Order[]>([])

onMounted(() => {
  // 从store加载订单数据
  orderStore.loadOrders()
  orders.value = orderStore.orders
})

function goDetail(id:string) { router.push(`/order/${id}`) }

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
</script>

<style scoped>
.orders-page { max-width: 900px; margin: 0 auto; padding: 32px 0; }
.empty-tip { color: #888; text-align: center; margin-top: 32px; }
</style> 