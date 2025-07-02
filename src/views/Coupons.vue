<template>
  <div class="coupons-page">
    <h2>我的优惠券</h2>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="可用" name="unused">
        <div v-if="unusedCoupons.length">
          <el-card v-for="item in unusedCoupons" :key="item.id" class="coupon-card">
            <div class="coupon-title">{{ item.title }}</div>
            <div class="coupon-info">满{{ item.minAmount }}减{{ item.discount }}元</div>
            <div class="coupon-date">有效期：{{ item.validFrom }} ~ {{ item.validTo }}</div>
          </el-card>
        </div>
        <div v-else>暂无可用优惠券</div>
      </el-tab-pane>
      <el-tab-pane label="已用" name="used">
        <div v-if="usedCoupons.length">
          <el-card v-for="item in usedCoupons" :key="item.id" class="coupon-card used">
            <div class="coupon-title">{{ item.title }}</div>
            <div class="coupon-info">满{{ item.minAmount }}减{{ item.discount }}元</div>
            <div class="coupon-date">有效期：{{ item.validFrom }} ~ {{ item.validTo }}</div>
          </el-card>
        </div>
        <div v-else>暂无已用优惠券</div>
      </el-tab-pane>
      <el-tab-pane label="已过期" name="expired">
        <div v-if="expiredCoupons.length">
          <el-card v-for="item in expiredCoupons" :key="item.id" class="coupon-card expired">
            <div class="coupon-title">{{ item.title }}</div>
            <div class="coupon-info">满{{ item.minAmount }}减{{ item.discount }}元</div>
            <div class="coupon-date">有效期：{{ item.validFrom }} ~ {{ item.validTo }}</div>
          </el-card>
        </div>
        <div v-else>暂无已过期优惠券</div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../store/user'
const userStore = useUserStore()
const activeTab = ref('unused')
const unusedCoupons = computed(() => userStore.coupons.filter(c => c.status === 'unused'))
const usedCoupons = computed(() => userStore.coupons.filter(c => c.status === 'used'))
const expiredCoupons = computed(() => userStore.coupons.filter(c => c.status === 'expired'))
</script>
<style scoped>
.coupons-page { max-width: 700px; margin: 0 auto; padding: 32px 0; }
.coupon-card { margin-bottom: 18px; border-left: 6px solid #67c23a; }
.coupon-card.used { border-color: #aaa; opacity: 0.7; }
.coupon-card.expired { border-color: #f56c6c; opacity: 0.7; }
.coupon-title { font-size: 18px; font-weight: bold; }
.coupon-info { color: #409eff; margin: 8px 0; }
.coupon-date { color: #888; font-size: 13px; }
</style> 