<template>
  <div style="padding: 20px;">
    <h2>简单支付测试</h2>
    
    <div style="margin: 20px 0;">
      <p>订单金额: ￥{{ amount }}</p>
      <p>用户余额: ￥{{ balance }}</p>
      <p>支付方式: {{ paymentMethod }}</p>
    </div>

    <div style="margin: 20px 0;">
      <el-button type="primary" @click="handleClick">点击测试</el-button>
      <el-button @click="handleClick2">普通按钮测试</el-button>
      <button @click="handleClick3">原生按钮测试</button>
    </div>

    <div style="margin: 20px 0;">
      <p>点击次数: {{ clickCount }}</p>
      <p>最后点击时间: {{ lastClickTime }}</p>
    </div>

    <div style="margin: 20px 0;">
      <el-radio-group v-model="paymentMethod">
        <el-radio value="alipay">支付宝</el-radio>
        <el-radio value="wechat">微信</el-radio>
        <el-radio value="balance">余额</el-radio>
      </el-radio-group>
    </div>

    <div style="margin: 20px 0;">
      <el-button 
        type="primary" 
        :disabled="!canPay"
        @click="handlePayment"
        :loading="loading"
      >
        {{ buttonText }}
      </el-button>
    </div>

    <div v-if="messages.length > 0" style="margin: 20px 0;">
      <h3>消息记录:</h3>
      <div v-for="(msg, index) in messages" :key="index" style="margin: 5px 0; padding: 5px; background: #f5f5f5;">
        {{ msg }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const amount = ref(158.00)
const balance = ref(200.00)
const paymentMethod = ref('alipay')
const loading = ref(false)
const clickCount = ref(0)
const lastClickTime = ref('')
const messages = ref<string[]>([])

function addMessage(msg: string) {
  messages.value.push(`${new Date().toLocaleTimeString()}: ${msg}`)
}

const canPay = computed(() => {
  const result = paymentMethod.value === 'balance' ? balance.value >= amount.value : true
  addMessage(`canPay计算: ${result}`)
  return result
})

const buttonText = computed(() => {
  if (loading.value) return '处理中...'
  if (paymentMethod.value === 'balance') {
    return balance.value >= amount.value ? '确认支付' : '余额不足'
  }
  return '立即支付'
})

function handleClick() {
  clickCount.value++
  lastClickTime.value = new Date().toLocaleTimeString()
  addMessage('Element Plus按钮被点击')
  ElMessage.success('按钮点击成功')
}

function handleClick2() {
  clickCount.value++
  lastClickTime.value = new Date().toLocaleTimeString()
  addMessage('普通Element Plus按钮被点击')
  ElMessage.info('普通按钮点击成功')
}

function handleClick3() {
  clickCount.value++
  lastClickTime.value = new Date().toLocaleTimeString()
  addMessage('原生按钮被点击')
  ElMessage.warning('原生按钮点击成功')
}

function handlePayment() {
  addMessage('支付按钮被点击')
  addMessage(`canPay: ${canPay.value}`)
  addMessage(`paymentMethod: ${paymentMethod.value}`)
  
  if (!canPay.value) {
    addMessage('支付被禁用')
    ElMessage.warning('无法支付')
    return
  }

  loading.value = true
  addMessage('开始支付处理')
  
  setTimeout(() => {
    addMessage('支付完成')
    loading.value = false
    ElMessage.success('支付成功')
  }, 2000)
}
</script> 