<template>
  <div class="points-shop">
    <h2 class="shop-title-main">🎁 积分商城</h2>
    <div class="user-points-info">
      <el-icon color="#f56c6c" style="vertical-align: middle;"><Coin /></el-icon>
      当前积分：<span class="points">{{ userPoints }}</span>
      <el-button size="small" @click="goBack" style="margin-left:16px;">返回</el-button>
    </div>
    <el-divider />
    <div class="shop-section">
      <h3>可兑换商品</h3>
      <el-row :gutter="24">
        <el-col :span="6" v-for="item in shopItems" :key="item.id">
          <el-card class="shop-card" shadow="hover">
            <img :src="item.img" class="shop-img" />
            <div class="shop-title">{{ item.title }}</div>
            <div class="shop-desc">{{ item.desc }}</div>
            <div class="shop-cost">所需积分：<span class="cost">{{ item.cost }}</span></div>
            <el-button type="primary" size="small" :disabled="userPoints < item.cost" @click="exchange(item)">
              兑换
            </el-button>
          </el-card>
        </el-col>
        <el-empty v-if="shopItems.length === 0" description="暂无可兑换商品" />
      </el-row>
    </div>
    <el-divider />
    <div class="growth-section">
      <h3>成长体系玩法</h3>
      <el-alert type="info" show-icon :closable="false" style="margin-bottom: 12px;">
        <template #title>
          <b>积分获取：</b>每日签到、下单、评价等行为可获得积分。<br />
          <b>积分用途：</b>可用于兑换商品、优惠券等。<br />
          <b>等级成长：</b>每100积分自动升级，等级越高可解锁更多特权。
        </template>
      </el-alert>
      <ul class="growth-list">
        <li>后续将开放更多成长任务与专属奖励，敬请期待！</li>
      </ul>
    </div>
    <el-dialog v-model="showSuccess" title="兑换成功" width="320px" :show-close="false" center>
      <div style="text-align:center;">
        <el-icon color="#67c23a" style="font-size:48px;"><CircleCheckFilled /></el-icon>
        <div style="margin:16px 0 8px;">兑换成功，已消耗{{ lastExchanged?.cost }}积分！</div>
        <el-button type="primary" @click="showSuccess = false">我知道了</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserPoints, exchangePoints } from '../api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Coin, CircleCheckFilled } from '@element-plus/icons-vue'

const router = useRouter()
const userPoints = ref(0)
const showSuccess = ref(false)
const lastExchanged = ref<{ id: number; title: string; cost: number } | null>(null)
const shopItems = ref([
  { id: 1, title: '10元优惠券', img: '/public/images/icons/icons8-bill-cipher-100.png', cost: 100, desc: '下单立减10元，限部分商品使用' },
  { id: 2, title: '20元优惠券', img: '/public/images/icons/icons8-brutus-100.png', cost: 180, desc: '下单立减20元，限部分商品使用' },
  { id: 3, title: '限量周边公仔', img: '/public/images/products/product-7-collectible.jpg', cost: 300, desc: '官方正版，限量发售，先到先得' },
  { id: 4, title: '精美贴纸包', img: '/public/images/products/product-6-cat.jpg', cost: 80, desc: '多款可爱贴纸，装饰你的生活' },
])

onMounted(async () => {
  try {
    const res = await getUserPoints()
    if (res && res.points !== undefined) userPoints.value = res.points
  } catch {}
})

async function exchange(item: { id: number; title: string; cost: number }) {
  if (userPoints.value < item.cost) {
    ElMessage.warning('积分不足，无法兑换！')
    return
  }
  try {
    const res: { code: number; msg: string } = await exchangePoints(item.id, item.id <= 2 ? 'coupon' : 'product')
    if (res && res.code === 0) {
      lastExchanged.value = item
      showSuccess.value = true
      // 刷新积分
      const points = await getUserPoints()
      if (points && points.points !== undefined) userPoints.value = points.points
    } else {
      ElMessage.error(res.msg || '兑换失败')
    }
  } catch {
    ElMessage.error('兑换失败')
  }
}
function goBack() {
  router.back()
}
</script>
<style scoped>
.points-shop { max-width: 900px; margin: 0 auto; padding: 32px 0; }
.shop-title-main { text-align: center; font-size: 2rem; font-weight: bold; margin-bottom: 18px; letter-spacing: 2px; }
.user-points-info { font-size: 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
.points { color: #f56c6c; font-weight: bold; font-size: 22px; margin-left: 4px; }
.shop-section { margin-bottom: 32px; }
.shop-card { transition: box-shadow 0.3s, transform 0.3s; cursor: pointer; }
.shop-card:hover { box-shadow: 0 4px 24px #e6e6e6; transform: translateY(-4px) scale(1.03); }
.shop-img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; }
.shop-title { font-weight: bold; margin-top: 8px; font-size: 17px; }
.shop-desc { color: #888; font-size: 13px; margin: 4px 0 8px; min-height: 32px; }
.shop-cost { color: #888; margin: 8px 0; }
.cost { color: #409eff; font-weight: bold; }
.growth-section { margin-top: 32px; }
.growth-list { margin: 0; padding-left: 18px; color: #666; font-size: 15px; }
</style> 