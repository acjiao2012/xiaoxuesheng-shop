<template>
  <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
    <h2>支付按钮调试</h2>
    
    <div style="margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px;">
      <h3>当前状态</h3>
      <p>订单金额: ￥{{ amount }}</p>
      <p>用户余额: ￥{{ balance }}</p>
      <p>支付方式: {{ paymentMethod }}</p>
      <p>canPay: {{ canPay }}</p>
      <p>loading: {{ loading }}</p>
      <p>buttonText: {{ buttonText }}</p>
    </div>

    <div style="margin: 20px 0;">
      <h3>测试按钮</h3>
      
      <!-- 测试1: 最简单的按钮 -->
      <div style="margin: 10px 0;">
        <button @click="test1">原生按钮测试</button>
      </div>
      
      <!-- 测试2: Element Plus按钮 -->
      <div style="margin: 10px 0;">
        <el-button @click="test2">Element Plus按钮测试</el-button>
      </div>
      
      <!-- 测试3: 带loading的按钮 -->
      <div style="margin: 10px 0;">
        <el-button :loading="loading" @click="test3">带Loading的按钮</el-button>
      </div>
      
      <!-- 测试4: 支付按钮 -->
      <div style="margin: 10px 0;">
        <el-button 
          type="primary" 
          :disabled="!canPay"
          @click="handlePayment"
          :loading="loading"
        >
          {{ buttonText }}
        </el-button>
      </div>
    </div>

    <div style="margin: 20px 0;">
      <h3>支付方式选择</h3>
      <el-radio-group v-model="paymentMethod">
        <el-radio value="alipay">支付宝</el-radio>
        <el-radio value="wechat">微信</el-radio>
        <el-radio value="balance">余额</el-radio>
      </el-radio-group>
    </div>

    <div style="margin: 20px 0;">
      <h3>日志</h3>
      <div style="max-height: 300px; overflow-y: auto; background: #000; color: #0f0; padding: 10px; font-family: monospace; font-size: 12px;">
        <div v-for="(log, index) in logs" :key="index" style="margin: 2px 0;">
          {{ log }}
        </div>
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
const logs = ref<string[]>([])

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
  console.log(`[${timestamp}] ${message}`)
}

const canPay = computed(() => {
  const result = paymentMethod.value === 'balance' ? balance.value >= amount.value : true
  addLog(`canPay计算: ${result} (方式: ${paymentMethod.value}, 余额: ${balance.value}, 金额: ${amount.value})`)
  return result
})

const buttonText = computed(() => {
  if (loading.value) return '处理中...'
  if (paymentMethod.value === 'balance') {
    return balance.value >= amount.value ? '确认支付' : '余额不足'
  }
  return '立即支付'
})

function test1() {
  addLog('原生按钮被点击')
  ElMessage.success('原生按钮点击成功')
}

function test2() {
  addLog('Element Plus按钮被点击')
  ElMessage.info('Element Plus按钮点击成功')
}

function test3() {
  addLog('带Loading的按钮被点击')
  loading.value = true
  setTimeout(() => {
    loading.value = false
    addLog('Loading完成')
    ElMessage.warning('Loading按钮测试完成')
  }, 2000)
}

function handlePayment() {
  addLog('支付按钮被点击')
  addLog(`canPay: ${canPay.value}`)
  addLog(`paymentMethod: ${paymentMethod.value}`)
  addLog(`loading: ${loading.value}`)
  
  if (!canPay.value) {
    addLog('支付被禁用')
    ElMessage.warning('无法支付')
    return
  }

  loading.value = true
  addLog('开始支付处理')
  ElMessage.info('正在创建支付订单...')
  
  setTimeout(() => {
    addLog('支付订单创建成功')
    
    if (paymentMethod.value === 'balance') {
      addLog('余额支付完成')
      ElMessage.success('余额支付成功！')
    } else if (paymentMethod.value === 'alipay') {
      addLog('跳转到支付宝')
      ElMessage.success('正在跳转到支付宝...')
      window.open('https://openapi.alipaydev.com/gateway.do?mock=true', '_blank')
    } else if (paymentMethod.value === 'wechat') {
      addLog('显示微信二维码')
      ElMessage.success('请使用微信扫描二维码完成支付')
    }
    
    loading.value = false
    addLog('支付处理完成')
  }, 2000)
}

// 初始化日志
addLog('页面加载完成')
addLog(`初始状态: 金额=${amount.value}, 余额=${balance.value}, 方式=${paymentMethod.value}`)
</script> 