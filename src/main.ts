import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { setupGlobalErrorHandling } from './utils/errorHandler'
import { useUserStore } from './store/user'
import { testApiConnection } from './utils/apiTest'

// 设置全局错误处理
setupGlobalErrorHandling()

// 创建Vue应用
const app = createApp(App)
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化用户状态
const userStore = useUserStore()
userStore.autoLogin()

// 测试API连接
if (import.meta.env.DEV) {
  testApiConnection()
}

// 挂载应用
app.mount('#app')
