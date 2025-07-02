<template>
  <header class="header">
    <!-- 顶部搜索栏与Logo区 -->
    <div class="top-bar">
      <div class="logo">
        <span class="logo-icon">🎁</span>
        <span class="logo-text">小学生手办商城</span>
      </div>
      <div class="search-container">
        <el-input 
          class="search-input" 
          placeholder="搜索你喜欢的手办..." 
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>
      <div class="user-actions">
        <el-button type="text" class="action-btn" @click="$router.push('/cart')">
          <el-icon><ShoppingCart /></el-icon>
          <span>购物车</span>
        </el-button>
        <template v-if="isLogin">
          <el-button type="text" class="action-btn user-center-btn" @click="goUserCenter">
            <img :src="userInfo?.avatar || defaultAvatar" class="header-avatar" />
            <span>{{ userInfo?.name || '我的' }}</span>
          </el-button>
        </template>
        <template v-else>
          <el-button type="text" class="action-btn" @click="goLogin">
            <el-icon><User /></el-icon>
            <span>登录/注册</span>
          </el-button>
        </template>
      </div>
    </div>

    <!-- 主导航栏 -->
    <nav class="main-nav">
      <div class="nav-container">
        <el-menu 
          mode="horizontal" 
          class="nav-menu"
          :default-active="$route.path" 
          router
          background-color="transparent"
          text-color="var(--text-primary)"
          active-text-color="var(--primary-dark)"
        >
          <el-menu-item index="/" class="nav-item">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/category" class="nav-item">
            <el-icon><Grid /></el-icon>
            <span>分类</span>
          </el-menu-item>
          <el-menu-item index="/cart" class="nav-item">
            <el-icon><ShoppingCart /></el-icon>
            <span>购物车</span>
          </el-menu-item>
          <el-menu-item index="/orders" class="nav-item">
            <el-icon><Document /></el-icon>
            <span>订单</span>
          </el-menu-item>
          <el-menu-item index="/parent" class="nav-item">
            <el-icon><UserFilled /></el-icon>
            <span>家长管理</span>
          </el-menu-item>
          <el-menu-item index="/about" class="nav-item">
            <el-icon><InfoFilled /></el-icon>
            <span>关于我们</span>
          </el-menu-item>
        </el-menu>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import { 
  Search, 
  ShoppingCart, 
  User, 
  House, 
  Grid, 
  Document, 
  UserFilled, 
  InfoFilled 
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')
const isLogin = computed(() => userStore.isLogin)
const userInfo = computed(() => userStore.userInfo)
const defaultAvatar = '/public/images/avatars/icons8-头像-50.png'

function handleSearch() {
  if (searchKeyword.value.trim()) {
    ElMessage.success(`搜索：${searchKeyword.value}`)
    // 这里可以添加搜索逻辑
  } else {
    ElMessage.warning('请输入搜索关键词')
  }
}
function goUserCenter() {
  router.push('/user')
}
function goLogin() {
  router.push('/login')
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--bg-primary);
  box-shadow: var(--shadow-lg);
  border-bottom: 2px solid var(--border-light);
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, var(--primary-bg) 0%, var(--secondary-bg) 100%);
  border-bottom: 1px solid var(--border-light);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 32px;
  animation: bounce 2s infinite;
}

.logo-text {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark), var(--info-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.search-container {
  flex: 1;
  max-width: 500px;
  margin: 0 var(--spacing-xl);
}

.search-input {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.search-input :deep(.el-input__wrapper) {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  border-color: var(--primary-light);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.1);
}

.search-input :deep(.el-input-group__append) {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border: none;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

.search-input :deep(.el-input-group__append .el-button) {
  background: transparent;
  border: none;
  color: white;
  font-weight: 500;
}

.user-actions {
  display: flex;
  gap: var(--spacing-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  background: transparent;
  border: 1px solid transparent;
}

.action-btn:hover {
  background: var(--primary-bg);
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.main-nav {
  background: linear-gradient(135deg, var(--info-bg) 0%, var(--primary-bg) 50%, var(--secondary-bg) 100%);
  border-bottom: 1px solid var(--border-light);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
}

.nav-menu {
  border: none;
  background: transparent;
}

.nav-menu :deep(.el-menu-item) {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  margin: 0 var(--spacing-xs);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-menu :deep(.el-menu-item:hover) {
  background: var(--primary-bg);
  color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.nav-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  box-shadow: var(--shadow-lg);
}

.nav-menu :deep(.el-menu-item.is-active:hover) {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
  
  .logo-text {
    font-size: 20px;
  }
  
  .search-container {
    width: 100%;
    max-width: none;
    margin: 0;
  }
  
  .user-actions {
    width: 100%;
    justify-content: center;
  }
  
  .nav-container {
    padding: 0 var(--spacing-md);
  }
  
  .nav-menu :deep(.el-menu-item) {
    padding: var(--spacing-sm) var(--spacing-md);
    margin: 0 var(--spacing-xs);
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .top-bar {
    padding: var(--spacing-sm);
  }
  
  .logo-icon {
    font-size: 24px;
  }
  
  .logo-text {
    font-size: 18px;
  }
  
  .nav-menu :deep(.el-menu-item) {
    padding: var(--spacing-xs) var(--spacing-sm);
    margin: 0 2px;
    font-size: 12px;
  }
  
  .nav-menu :deep(.el-menu-item span) {
    display: none;
  }
}

.user-center-btn { display: flex; align-items: center; gap: 6px; }
.header-avatar { width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #eee; object-fit: cover; }
</style> 