<template>
  <div class="user-center">
    <div class="user-header">
      <img :src="userInfo?.avatar || defaultAvatar" class="avatar" @click="showEdit = true" />
      <div class="user-info">
        <div class="user-name">{{ userInfo?.name || '未登录' }}</div>
        <div class="user-email">{{ userInfo?.email }}</div>
      </div>
      <el-button v-if="isLogin" size="small" @click="logout">退出登录</el-button>
      <el-button v-else size="small" @click="goLogin">登录/注册</el-button>
    </div>
    <el-divider />
    <div class="user-actions">
      <el-row :gutter="24">
        <el-col :span="6"><el-card @click="goOrders"><div>我的订单</div></el-card></el-col>
        <el-col :span="6"><el-card @click="goCoupons"><div>优惠券</div></el-card></el-col>
        <el-col :span="6"><el-card @click="goAddress"><div>收货地址</div></el-card></el-col>
        <el-col :span="6"><el-card @click="goNotifications"><div>消息通知</div></el-card></el-col>
      </el-row>
    </div>
    <el-divider />
    <div class="recommend-section">
      <h3>为你推荐</h3>
      <el-row :gutter="16">
        <el-col :span="6" v-for="item in recommendProducts" :key="item.id">
          <el-card @click="goProduct(item.id)">
            <img :src="item.img" class="rec-img" />
            <div class="rec-title">{{ item.title }}</div>
            <div class="rec-reason">{{ item.reason }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <el-dialog v-model="showEdit" title="编辑个人信息" width="400px">
      <el-form :model="editForm">
        <el-form-item label="昵称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="editForm.email" /></el-form-item>
        <el-form-item label="头像">
          <el-radio-group v-model="editForm.avatar">
            <el-radio-button v-for="img in avatarList" :key="img" :label="img">
              <img :src="img" style="width:40px;height:40px;border-radius:50%" />
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { computed, ref, watchEffect, onMounted } from 'vue'
import { imageUtils } from '../utils/imageUtils'
const userStore = useUserStore()
const router = useRouter()
const isLogin = computed(() => userStore.isLogin)
const userInfo = computed(() => userStore.userInfo)
const recommendProducts = computed(() => userStore.recommendProducts)
const defaultAvatar = '/public/images/avatars/icons8-头像-50.png'
const showEdit = ref(false)
const editForm = ref({ name: '', email: '', avatar: defaultAvatar })
const avatarList = [
  '/public/images/avatars/icons8-头像-50.png',
  '/public/images/avatars/icons8-头像-50-2.png',
  '/public/images/avatars/icons8-头像-50-3.png',
  '/public/images/avatars/icons8-头像-50-4.png',
  '/public/images/avatars/icons8-女孩-50.png',
  '/public/images/avatars/icons8-女孩-50-2.png',
  '/public/images/avatars/icons8-男孩-50.png',
  '/public/images/avatars/icons8-男孩-50-2.png',
]
function logout() { userStore.logout(); router.push('/login') }
function goLogin() { router.push('/login') }
function goOrders() { router.push('/orders') }
function goCoupons() { router.push('/coupons') }
function goAddress() { router.push('/address') }
function goNotifications() { router.push('/notifications') }
function goProduct(id:number) { router.push(`/product/${id}`) }
function saveEdit() {
  if (!userInfo.value) return
  userStore.updateUserInfo({
    id: userInfo.value.id,
    type: userInfo.value.type,
    name: editForm.value.name,
    email: editForm.value.email,
    avatar: editForm.value.avatar
  })
  showEdit.value = false
}
// 打开编辑时自动填充表单
watchEffect(() => {
  if (showEdit.value && userInfo.value) {
    editForm.value.name = userInfo.value.name
    editForm.value.email = userInfo.value.email
    editForm.value.avatar = userInfo.value.avatar || defaultAvatar
  }
})
onMounted(() => {
  // 模拟最近浏览和热销商品
  const allProducts = [
    { id: 1, title: 'Q版小熊猫手办', price: 59, img: imageUtils.getProductImage(1) },
    { id: 2, title: '魔法少女小樱', price: 89, img: imageUtils.getProductImage(2) },
    { id: 3, title: '动漫主角限定', price: 99, img: imageUtils.getProductImage(3) },
    { id: 4, title: '超萌兔子手办', price: 69, img: imageUtils.getProductImage(4) },
    { id: 5, title: '限量礼盒装', price: 129, img: imageUtils.getProductImage(5) },
    { id: 6, title: '可爱猫咪手办', price: 79, img: imageUtils.getProductImage(6) },
    { id: 7, title: '收藏级手办', price: 159, img: imageUtils.getProductImage(7) },
    { id: 8, title: '精美手办模型', price: 139, img: imageUtils.getProductImage(8) },
    { id: 9, title: '可爱玩具手办', price: 89, img: imageUtils.getProductImage(9) },
  ]
  // 假设最近浏览为前3个
  const history = allProducts.slice(0, 3)
  userStore.generateRecommend(allProducts, history)
  userStore.loadNotifications()
})
</script>
<style scoped>
.user-center { max-width: 900px; margin: 0 auto; padding: 32px 0; }
.user-header { display: flex; align-items: center; gap: 24px; }
.avatar { width: 80px; height: 80px; border-radius: 50%; border: 2px solid #eee; }
.user-info { flex: 1; }
.user-name { font-size: 22px; font-weight: bold; }
.user-email { color: #888; margin-top: 4px; }
.user-actions { margin: 32px 0; }
.recommend-section { margin-top: 32px; }
.rec-img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; }
.rec-title { font-weight: bold; margin-top: 8px; }
.rec-reason { color: #999; font-size: 13px; }
</style> 