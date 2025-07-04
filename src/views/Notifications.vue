<template>
  <div class="notifications-page">
    <h2>消息通知</h2>
    <el-list>
      <el-list-item v-for="item in notifications" :key="item.id" @click="markRead(item.id)" :class="{ unread: !item.read }">
        <el-list-item-meta :title="item.title" :description="item.content" />
        <span class="msg-date">{{ item.createdAt }}</span>
        <el-tag v-if="!item.read" type="danger" size="small">未读</el-tag>
      </el-list-item>
    </el-list>
    <div v-if="!notifications.length" class="empty-tip">暂无消息</div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getNotifications, markNotificationRead } from '../api/user'
import { ElMessage } from 'element-plus'
const notifications = ref<AppNotification[]>([])
async function loadNotifications() {
  try {
    notifications.value = await getNotifications()
  } catch {
    ElMessage.error('获取消息失败')
  }
}
onMounted(loadNotifications)
async function markRead(id: string) {
  try {
    await markNotificationRead(id)
    notifications.value = notifications.value.map(n => n.id === id ? { ...n, read: true } : n)
  } catch {
    ElMessage.error('操作失败')
  }
}
</script>
<style scoped>
.notifications-page { max-width: 700px; margin: 0 auto; padding: 32px 0; }
.msg-date { color: #aaa; font-size: 12px; margin-left: 12px; }
.empty-tip { color: #888; text-align: center; margin-top: 32px; }
.unread { background: #fffbe6; }
</style> 