<template>
  <div class="main-container">
    <h2 class="main-title">登录</h2>
    <div class="main-card login-card">
      <el-form class="login-form" label-position="top">
        <el-form-item label="邮箱">
          <el-input v-model="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="login">登录</el-button>
        </el-form-item>
        <el-form-item>
          <div class="login-links">
            <el-link type="primary" @click="$router.push('/register')">没有账号？去注册</el-link>
            <el-link type="primary" @click="$router.push('/parent')">家长管理中心</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="third-login">
            <el-button type="success" icon="el-icon-chat-dot-round" @click="thirdLogin('wechat')">微信登录</el-button>
            <el-button type="primary" icon="el-icon-message" @click="thirdLogin('qq')">QQ登录</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('rememberMeUser')
  if (saved) {
    const u = JSON.parse(saved)
    email.value = u.email
    password.value = u.password
    rememberMe.value = true
  }
})

function login() {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find((u:any) => u.email === email.value && u.password === password.value)
  if (user) {
    userStore.login(user, 'mock-token')
    if (rememberMe.value) {
      localStorage.setItem('rememberMeUser', JSON.stringify({ email: email.value, password: password.value }))
    } else {
      localStorage.removeItem('rememberMeUser')
    }
    ElMessage.success('登录成功')
    router.push('/')
  } else {
    ElMessage.error('邮箱或密码错误')
  }
}

function thirdLogin(type: string) {
  // 模拟第三方登录
  const user = {
    id: Date.now(),
    name: type === 'wechat' ? '微信用户' : 'QQ用户',
    email: type + '@mock.com',
    type: 'student' as 'student',
    avatar: '',
  }
  userStore.login(user, 'mock-token')
  ElMessage.success(type === 'wechat' ? '微信登录成功' : 'QQ登录成功')
  router.push('/')
}
</script>

<style scoped>
.main-container {
  background: #f7faff;
  max-width: 1200px;
  margin: 32px auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px #eee;
  padding: 32px 24px;
}
.main-title {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 24px;
  text-align: left;
}
.main-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px #eee;
  padding: 32px 24px;
  max-width: 400px;
  margin: 0 auto;
}
.login-form {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}
.login-links {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.third-login { display: flex; gap: 12px; justify-content: center; margin-top: 8px; }
</style> 