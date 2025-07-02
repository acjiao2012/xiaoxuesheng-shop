<template>
  <div id="app">
    <Header />
    <main class="main-content">
      <router-view v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    <Footer />
    <!-- 客服入口 -->
    <el-button class="customer-service-btn" type="primary" circle @click="showService = true">
      <el-icon><Service /></el-icon>
    </el-button>
    <el-dialog v-model="showService" title="7x12小时在线客服" width="350px" append-to-body>
      <div style="min-height:120px;">
        <div v-for="msg in messages" :key="msg.id" :style="{textAlign: msg.from==='user'?'right':'left',margin:'8px 0'}">
          <span :style="{background:msg.from==='user'?'#e0f7fa':'#f3f4f6',padding:'6px 12px',borderRadius:'16px',display:'inline-block'}">{{ msg.text }}</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <el-input v-model="inputMsg" placeholder="请输入问题..." @keyup.enter="sendMsg" />
        <el-button type="primary" @click="sendMsg">发送</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { Service } from '@element-plus/icons-vue'

// 错误边界处理
onErrorCaptured((err, instance, info) => {
  console.error('App Error Captured:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
  return false // 阻止错误继续传播
})

// 客服相关
const showService = ref(false)
const inputMsg = ref('')
const messages = ref([
  { id: 1, from: 'service', text: '您好，这里是7x12小时在线客服，有什么可以帮您？' }
])
function sendMsg() {
  if (!inputMsg.value.trim()) return
  messages.value.push({ id: Date.now(), from: 'user', text: inputMsg.value })
  setTimeout(() => {
    messages.value.push({ id: Date.now() + 1, from: 'service', text: '客服已收到您的消息，会尽快回复！' })
  }, 800)
  inputMsg.value = ''
}
</script>

<style>
body {
  background: #f7faff;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.customer-service-btn {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 9999;
  box-shadow: 0 2px 8px #bbb;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 