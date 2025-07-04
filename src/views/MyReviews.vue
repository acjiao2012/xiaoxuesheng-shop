<template>
  <div class="my-reviews-page">
    <h2>我的评价</h2>
    <el-table :data="reviews" style="width: 100%; margin-top: 18px;">
      <el-table-column prop="product.name" label="商品" />
      <el-table-column prop="rating" label="评分">
        <template #default="scope">
          <el-rate v-model="scope.row.rating" disabled />
        </template>
      </el-table-column>
      <el-table-column prop="content" label="评价内容" />
      <el-table-column label="商家回复">
        <template #default="scope">
          <el-alert v-if="scope.row.reply" type="info" :closable="false" show-icon>
            <template #title>
              <b>商家回复：</b>{{ scope.row.reply }}
            </template>
          </el-alert>
          <span v-else style="color:#aaa">暂无回复</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="editReview(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteReviewRow(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pagination.page"
      v-model:page-size="pagination.limit"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="loadReviews"
      @current-change="loadReviews"
      style="margin-top: 18px;"
    />
    <el-dialog v-model="showEdit" title="编辑评价" width="400px">
      <el-form :model="editForm">
        <el-form-item label="评分"><el-rate v-model="editForm.rating" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="editForm.content" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserReviews, updateReview, deleteReview } from '../api/reviews'
import { ElMessage } from 'element-plus'
const reviews = ref<Review[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })
const showEdit = ref(false)
const editForm = ref({ id: '', rating: 5, content: '' })
async function loadReviews() {
  try {
    const res = await getUserReviews({ page: pagination.value.page, limit: pagination.value.limit })
    reviews.value = res.reviews
    pagination.value = res.pagination
  } catch {
    ElMessage.error('获取评价失败')
  }
}
onMounted(loadReviews)
function editReview(row: Review) {
  editForm.value = { id: row.id, rating: row.rating, content: row.content }
  showEdit.value = true
}
async function saveEdit() {
  try {
    await updateReview(editForm.value.id, { rating: editForm.value.rating, content: editForm.value.content })
    ElMessage.success('已更新')
    showEdit.value = false
    loadReviews()
  } catch {
    ElMessage.error('更新失败')
  }
}
async function deleteReviewRow(id: string) {
  try {
    await deleteReview(id)
    ElMessage.success('已删除')
    loadReviews()
  } catch {
    ElMessage.error('删除失败')
  }
}
</script>
<style scoped>
.my-reviews-page { max-width: 900px; margin: 0 auto; padding: 32px 0; }
</style>
