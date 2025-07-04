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
        <el-col :span="6"><el-card @click="goMyReviews"><div>我的评价</div></el-card></el-col>
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
    <div class="user-points-section" style="margin-bottom: 24px; flex-direction: column; align-items: flex-start;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div>等级：Lv{{ pointsInfo.level }}（下一级：Lv{{ pointsInfo.nextLevel }}）</div>
        <div>积分：{{ pointsInfo.points }}</div>
        <el-progress :percentage="Math.round(pointsInfo.progress * 100)" :text-inside="true" status="success" style="width: 180px;" />
        <el-button size="small" @click="showPointsLog = true">积分明细</el-button>
        <el-button size="small" type="success" @click="handleSignIn" :disabled="signedToday" plain>{{ signedToday ? '今日已签到' : '每日签到' }}</el-button>
        <el-button size="small" type="warning" @click="goPointsShop" plain>积分商城</el-button>
      </div>
      <div class="points-rules">升级规则：每100积分升一级，最高10级。下单+10分，评价+5分，签到+2分。</div>
    </div>
    <el-dialog v-model="showEdit" title="编辑个人信息" width="400px">
      <el-form :model="editForm">
        <el-form-item label="昵称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="editForm.email" /></el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">保密</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker v-model="editForm.birthday" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :headers="uploadHeaders"
          >
            <img v-if="editForm.avatar" :src="editForm.avatar" class="avatar" />
            <el-icon v-else><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="showPointsLog" title="积分明细" width="500px">
      <el-table :data="pointsLog" style="width:100%">
        <el-table-column prop="change" label="变动" width="80" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="description" label="说明" />
        <el-table-column prop="created_at" label="时间" width="160" />
      </el-table>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '../store/user'
import { useRouter } from 'vue-router'
import { computed, ref, watchEffect, onMounted, watch } from 'vue'
import { imageUtils } from '../utils/imageUtils'
import { getUserProfile, updateUserProfile, getUserPoints, getUserPointsLog, signIn } from '../api/user'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
const userStore = useUserStore()
const router = useRouter()
const isLogin = computed(() => userStore.isLogin)
const userInfo = computed(() => userStore.userInfo)
const recommendProducts = computed(() => userStore.recommendProducts)
const defaultAvatar = '/public/images/avatars/icons8-头像-50.png'
const showEdit = ref(false)
const editForm = ref({ name: '', email: '', avatar: defaultAvatar, gender: 0, birthday: '' })
const uploadUrl = 'http://localhost:3000/api/user/upload-avatar'
const uploadHeaders = { Authorization: `Bearer ${localStorage.getItem('token') || ''}` }
const pointsInfo = ref({ points: 0, level: 1, nextLevel: 2, nextLevelPoints: 200, progress: 0 })
const showPointsLog = ref(false)
const pointsLog = ref<Array<{ change: number; type: string; description: string; created_at: string }>>([])
const signedToday = ref(false)
function logout() { userStore.logout(); router.push('/login') }
function goLogin() { router.push('/login') }
function goOrders() { router.push('/orders') }
function goCoupons() { router.push('/coupons') }
function goAddress() { router.push('/address') }
function goNotifications() { router.push('/notifications') }
function goProduct(id:number) { router.push(`/product/${id}`) }
function handleAvatarSuccess(response: any) {
  if (response.code === 0 && response.url) {
    editForm.value.avatar = response.url
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error('头像上传失败')
  }
}
function beforeAvatarUpload(file: File) {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJPG) ElMessage.error('只能上传 JPG/PNG 图片!')
  if (!isLt2M) ElMessage.error('图片大小不能超过 2MB!')
  return isJPG && isLt2M
}
async function saveEdit() {
  if (!userInfo.value) return
  try {
    await updateUserProfile({
      name: editForm.value.name,
      email: editForm.value.email,
      avatar: editForm.value.avatar,
      gender: editForm.value.gender,
      birthday: editForm.value.birthday
    })
    userStore.updateUserInfo({
      ...userInfo.value,
      name: editForm.value.name,
      email: editForm.value.email,
      avatar: editForm.value.avatar,
      gender: editForm.value.gender,
      birthday: editForm.value.birthday
    })
    ElMessage.success('资料已更新')
    showEdit.value = false
  } catch (e) {
    ElMessage.error('更新失败')
  }
}
// 打开编辑时自动填充表单
watchEffect(() => {
  if (showEdit.value && userInfo.value) {
    editForm.value.name = userInfo.value.name
    editForm.value.email = userInfo.value.email
    editForm.value.avatar = userInfo.value.avatar || defaultAvatar
    editForm.value.gender = userInfo.value.gender ?? 0
    editForm.value.birthday = userInfo.value.birthday ?? ''
  }
})
onMounted(async () => {
  // 拉取用户资料
  if (isLogin.value) {
    try {
      const data = await getUserProfile()
      if (data) {
        userStore.updateUserInfo(data)
      }
    } catch (e) {
      // 忽略
    }
  }
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
  try {
    const res = await getUserPoints()
    if (res && res.points !== undefined) pointsInfo.value = res
  } catch {}
  // 检查今日是否已签到
  try {
    const res: { code: number; msg: string; already: boolean } = await signIn()
    if (res && res.code === 0 && res.already) signedToday.value = true
  } catch {}
})
watch(showPointsLog, async (val) => {
  if (val) {
    try {
      const res = await getUserPointsLog()
      if (res && Array.isArray(res.data)) {
        pointsLog.value = res.data
      }
    } catch {}
  }
})
function goPointsShop() {
  router.push('/points-shop')
}
async function handleSignIn() {
  try {
    const res: { code: number; msg: string; already: boolean } = await signIn()
    if (res && res.code === 0) {
      if (!res.already) {
        ElMessage.success('签到成功，获得2积分！')
        signedToday.value = true
        // 刷新积分
        const points = await getUserPoints()
        if (points && points.points !== undefined) pointsInfo.value = points
      } else {
        ElMessage.info('今日已签到')
        signedToday.value = true
      }
    }
  } catch {
    ElMessage.error('签到失败')
  }
}
function goMyReviews() { router.push('/my-reviews') }
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
.avatar-uploader .avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
}
.user-points-section { display: flex; align-items: center; gap: 16px; }
.points-rules { color: #888; font-size: 13px; margin-top: 4px; }
</style> 