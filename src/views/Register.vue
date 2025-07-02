<template>
  <div class="main-container">
    <h2 class="main-title">注册账号</h2>
    <div class="main-card register-card">
      <!-- 注册类型选择 -->
      <div class="register-type">
        <el-radio-group v-model="registerType">
          <el-radio value="student" class="type-option">
            <div class="type-info">
              <div class="type-name">学生注册</div>
              <div class="type-desc">我是小学生，想要购买手办</div>
            </div>
          </el-radio>
          <el-radio value="parent" class="type-option">
            <div class="type-info">
              <div class="type-name">家长注册</div>
              <div class="type-desc">我是家长，为孩子管理购物</div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 学生注册表单 -->
      <el-form v-if="registerType === 'student'" :model="studentForm" label-position="top" class="register-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="学生姓名" required>
              <el-input v-model="studentForm.name" placeholder="请输入学生姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" required>
              <el-input-number v-model="studentForm.age" :min="6" :max="12" placeholder="年龄" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="邮箱" required>
          <el-input v-model="studentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="studentForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input v-model="studentForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </el-form-item>
        <el-form-item label="家长手机号" required>
          <el-input v-model="studentForm.parentPhone" placeholder="请输入家长手机号" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="registerStudent">注册学生账号</el-button>
        </el-form-item>
      </el-form>

      <!-- 家长注册表单 -->
      <el-form v-if="registerType === 'parent'" :model="parentForm" label-position="top" class="register-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="家长姓名" required>
              <el-input v-model="parentForm.name" placeholder="请输入家长姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" required>
              <el-input v-model="parentForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="邮箱" required>
          <el-input v-model="parentForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="parentForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" required>
          <el-input v-model="parentForm.confirmPassword" type="password" placeholder="请再次输入密码" />
        </el-form-item>
        <el-form-item label="孩子姓名">
          <el-input v-model="parentForm.childName" placeholder="请输入孩子姓名（选填）" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="registerParent">注册家长账号</el-button>
        </el-form-item>
      </el-form>

      <div class="login-link">
        已有账号？<el-link type="primary" @click="$router.push('/login')">去登录</el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const registerType = ref('student')

const studentForm = ref({
  name: '',
  age: 8,
  email: '',
  password: '',
  confirmPassword: '',
  parentPhone: ''
})

const parentForm = ref({
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  childName: ''
})

function registerStudent() {
  if (!studentForm.value.email || !studentForm.value.password) return
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  users.push({
    id: Date.now(),
    name: studentForm.value.name,
    email: studentForm.value.email,
    password: studentForm.value.password,
    type: 'student',
    avatar: '',
    parentPhone: studentForm.value.parentPhone
  })
  localStorage.setItem('users', JSON.stringify(users))
  router.push('/login')
}

function registerParent() {
  if (!parentForm.value.email || !parentForm.value.password) return
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  users.push({
    id: Date.now(),
    name: parentForm.value.name,
    email: parentForm.value.email,
    password: parentForm.value.password,
    type: 'parent',
    avatar: '',
    phone: parentForm.value.phone,
    childName: parentForm.value.childName
  })
  localStorage.setItem('users', JSON.stringify(users))
  router.push('/login')
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
  max-width: 600px;
  margin: 0 auto;
}
.register-type {
  margin-bottom: 32px;
}
.type-option {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  width: 100%;
  display: block;
}
.type-option:hover {
  border-color: #409eff;
}
.type-info {
  margin-left: 8px;
}
.type-name {
  font-size: 16px;
  font-weight: bold;
  color: #222;
}
.type-desc {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}
.register-form {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}
.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
}
</style> 