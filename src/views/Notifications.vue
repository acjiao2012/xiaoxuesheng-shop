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
import { computed } from 'vue'
import { useUserStore } from '../store/user'
const userStore = useUserStore()
const notifications = computed(() => userStore.notifications)
function markRead(id:string) { userStore.markNotificationRead(id) }
</script>
<style scoped>
.notifications-page { max-width: 700px; margin: 0 auto; padding: 32px 0; }
.msg-date { color: #aaa; font-size: 12px; margin-left: 12px; }
.empty-tip { color: #888; text-align: center; margin-top: 32px; }
.unread { background: #fffbe6; }
</style> 