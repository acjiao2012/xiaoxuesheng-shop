<template>
  <div class="logistics-container">
    <div class="logistics-content">
      <!-- 订单信息 -->
      <div class="order-info">
        <h2 class="page-title">物流跟踪</h2>
        <div class="order-summary">
          <div class="order-no">订单号：{{ orderInfo.orderNo }}</div>
          <div class="order-status">订单状态：{{ orderInfo.status }}</div>
        </div>
      </div>

      <!-- 物流信息 -->
      <div class="logistics-info">
        <div class="logistics-header">
          <div class="company-info">
            <div class="company-name">{{ logisticsInfo.company }}</div>
            <div class="tracking-number">运单号：{{ logisticsInfo.trackingNumber }}</div>
          </div>
          <div class="logistics-status">
            <el-tag :type="getStatusType(logisticsInfo.status)">
              {{ getStatusText(logisticsInfo.status) }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 物流轨迹 -->
      <div class="tracking-timeline">
        <h3>物流轨迹</h3>
        <el-timeline>
          <el-timeline-item
            v-for="(track, index) in trackingInfo"
            :key="index"
            :timestamp="formatTime(track.time)"
            :type="getTimelineItemType(index)"
            :color="getTimelineItemColor(index)"
          >
            <div class="timeline-content">
              <div class="track-location">{{ track.location }}</div>
              <div class="track-status">{{ track.status }}</div>
              <div class="track-description">{{ track.description }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 操作按钮 -->
      <div class="logistics-actions">
        <el-button type="primary" @click="refreshTracking">刷新物流信息</el-button>
        <el-button @click="goBack">返回订单</el-button>
      </div>

      <!-- 物流详情 -->
      <div class="logistics-details">
        <el-collapse>
          <el-collapse-item title="物流详情" name="details">
            <div class="detail-item">
              <span class="detail-label">物流公司：</span>
              <span class="detail-value">{{ logisticsInfo.company }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">运单号：</span>
              <span class="detail-value">{{ logisticsInfo.trackingNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">发货时间：</span>
              <span class="detail-value">{{ formatTime(logisticsInfo.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预计送达：</span>
              <span class="detail-value">{{ estimatedDelivery }}</span>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const orderInfo = ref({
  orderId: route.params.orderId as string,
  orderNo: '',
  status: ''
})

const logisticsInfo = ref({
  company: '',
  trackingNumber: '',
  status: '',
  createdAt: ''
})

const trackingInfo = ref<LogisticsTrace[]>([])

// 计算属性
const estimatedDelivery = computed(() => {
  if (!logisticsInfo.value.createdAt) return '暂无'
  const shipDate = new Date(logisticsInfo.value.createdAt)
  const estimatedDate = new Date(shipDate.getTime() + 3 * 24 * 60 * 60 * 1000) // 3天后
  return formatTime(estimatedDate.toISOString())
})

// 生命周期
onMounted(() => {
  loadLogisticsInfo()
})

// 方法
async function loadLogisticsInfo() {
  try {
    // 这里应该调用API获取物流信息
    // const response = await api.getLogistics(orderInfo.value.orderId)
    // logisticsInfo.value = response.data.logistics
    // trackingInfo.value = response.data.trackingInfo
    
    // 模拟数据
    orderInfo.value = {
      orderId: orderInfo.value.orderId,
      orderNo: `ORDER${Date.now()}`,
      status: '已发货'
    }
    
    logisticsInfo.value = {
      company: '顺丰速运',
      trackingNumber: 'SF1234567890',
      status: 'shipped',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    trackingInfo.value = [
      {
        time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        location: '深圳市',
        status: '已揽收',
        description: '快件已被揽收，正在发往分拣中心'
      },
      {
        time: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        location: '深圳市',
        status: '运输中',
        description: '快件已到达分拣中心，正在发往目的地'
      },
      {
        time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: '广州市',
        status: '运输中',
        description: '快件已到达广州分拣中心，正在派送'
      },
      {
        time: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
        location: '广州市',
        status: '派送中',
        description: '快件正在派送中，请保持电话畅通'
      }
    ]
  } catch (error) {
    ElMessage.error('加载物流信息失败')
  }
}

function getStatusType(status: string) {
  const statusMap: Record<string, string> = {
    'pending': 'info',
    'shipped': 'primary',
    'delivered': 'success',
    'returned': 'warning'
  }
  return statusMap[status] || 'info'
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    'pending': '待发货',
    'shipped': '已发货',
    'delivered': '已送达',
    'returned': '已退回'
  }
  return statusMap[status] || '未知状态'
}

function getTimelineItemType(index: number) {
  return index === 0 ? 'primary' : 'info'
}

function getTimelineItemColor(index: number) {
  return index === 0 ? '#409eff' : '#909399'
}

function formatTime(timeString: string) {
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function refreshTracking() {
  ElMessage.info('正在刷新物流信息...')
  await loadLogisticsInfo()
  ElMessage.success('物流信息已更新')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.logistics-container {
  background: #f7faff;
  min-height: 100vh;
  padding: 20px;
}

.logistics-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
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

.order-no,
.order-status {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.logistics-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.logistics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.tracking-number {
  font-size: 14px;
  color: #666;
}

.logistics-status {
  text-align: right;
}

.tracking-timeline {
  margin-bottom: 32px;
}

.tracking-timeline h3 {
  margin-bottom: 20px;
  color: #333;
}

.timeline-content {
  padding: 8px 0;
}

.track-location {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.track-status {
  font-size: 14px;
  color: #409eff;
  margin-bottom: 4px;
}

.track-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.logistics-actions {
  text-align: center;
  margin-bottom: 32px;
}

.logistics-actions .el-button {
  margin: 0 8px;
}

.logistics-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
}

.detail-label {
  width: 100px;
  font-weight: bold;
  color: #333;
}

.detail-value {
  flex: 1;
  color: #666;
}
</style> 