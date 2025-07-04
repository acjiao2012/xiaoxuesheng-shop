<template>
  <div class="admin-reply-page">
    <h2>评价回复管理</h2>
    <el-table :data="reviews" style="width: 100%; margin-top: 18px;">
      <el-table-column prop="product.name" label="商品" />
      <el-table-column prop="userName" label="用户" />
      <el-table-column prop="content" label="评价内容" />
      <el-table-column prop="reply" label="商家回复">
        <template #default="scope">
          <el-input v-model="scope.row.reply" placeholder="输入回复内容" size="small" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="primary" @click="submitReply(scope.row)">回复</el-button>
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
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProductReviews } from '../api/reviews'
import { apiPost } from '../api/client'
import { ElMessage } from 'element-plus'
const reviews = ref<any[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 1 })
async function loadReviews() {
  try {
    // 这里只做演示，实际应有管理员接口获取所有评价
    const res = await getProductReviews({ productId: '', page: pagination.value.page, limit: pagination.value.limit })
    reviews.value = res.reviews
    pagination.value = res.pagination
  } catch {
    ElMessage.error('获取评价失败')
  }
}
onMounted(loadReviews)
async function submitReply(row: any) {
  try {
    await apiPost(`/reviews/${row.id}/reply`, { reply: row.reply })
    ElMessage.success('回复成功')
    loadReviews()
  } catch {
    ElMessage.error('回复失败')
  }
}
</script>
<style scoped>
.admin-reply-page { max-width: 900px; margin: 0 auto; padding: 32px 0; }
</style>
