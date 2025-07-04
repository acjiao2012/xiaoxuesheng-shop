<template>
  <div class="payment-test-container">
    <div class="payment-test-content">
      <h2>支付功能测试</h2>
      
      <div class="test-info">
        <p><strong>订单ID:</strong> {{ orderId }}</p>
        <p><strong>订单金额:</strong> ￥{{ amount }}</p>
        <p><strong>用户余额:</strong> ￥{{ balance }}</p>
      </div>

      <div class="test-actions">
        <el-button type="primary" @click="testPayment" :loading="loading">
          测试支付功能
        </el-button>
        <el-button @click="testDataLoad">测试数据加载</el-button>
        <el-button @click="testCanPay">测试支付条件</el-button>
      </div>

      <div class="test-results" v-if="results.length > 0">
        <h3>测试结果</h3>
        <div v-for="(result, index) in results" :key="index" class="result-item">
          <span class="result-time">{{ result.time }}</span>
          <span class="result-message" :class="result.type">{{ result.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const orderId = ref('test-order-123')
const amount = ref(158.00)
const balance = ref(200.00)
const loading = ref(false)
const results = ref<Array<{time: string, type: 'info' | 'success' | 'error', message: string}>>([])

function addResult(type: 'info' | 'success' | 'error', message: string) {
  results.value.push({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
}

function testPayment() {
  loading.value = true
  addResult('info', '开始测试支付功能...')
  
  setTimeout(() => {
    addResult('success', '支付订单创建成功')
    addResult('info', '模拟支付处理中...')
    
    setTimeout(() => {
      addResult('success', '支付完成！')
      loading.value = false
      ElMessage.success('支付测试成功')
    }, 2000)
  }, 1000)
}

function testDataLoad() {
  addResult('info', '测试数据加载...')
  addResult('success', `订单信息: ${orderId.value}`)
  addResult('success', `订单金额: ￥${amount.value}`)
  addResult('success', `用户余额: ￥${balance.value}`)
}

function testCanPay() {
  addResult('info', '测试支付条件...')
  
  const canPay = balance.value >= amount.value
  if (canPay) {
    addResult('success', '支付条件满足，可以支付')
  } else {
    addResult('error', '余额不足，无法支付')
  }
}
</script>

<style scoped>
.payment-test-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.payment-test-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.test-info {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  margin: 16px 0;
}

.test-actions {
  margin: 16px 0;
}

.test-actions .el-button {
  margin-right: 12px;
}

.test-results {
  margin-top: 24px;
  border-top: 1px solid #eee;
  padding-top: 16px;
}

.result-item {
  display: flex;
  margin-bottom: 8px;
  font-family: monospace;
}

.result-time {
  color: #666;
  margin-right: 12px;
  min-width: 80px;
}

.result-message {
  flex: 1;
}

.result-message.info {
  color: #409eff;
}

.result-message.success {
  color: #67c23a;
}

.result-message.error {
  color: #f56c6c;
}
</style> 