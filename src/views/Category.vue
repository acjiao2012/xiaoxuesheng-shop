<template>
  <div class="category-page">
    <h2 class="main-title">分类商品瀑布流展示</h2>
    <div class="category-filter">
      <el-select v-model="selectedCategory" placeholder="选择分类" clearable style="width: 200px">
        <el-option v-for="cat in categories" :key="cat.value" :label="cat.label" :value="cat.value" />
      </el-select>
    </div>
    <div class="masonry">
      <div class="masonry-item" v-for="item in filteredProducts" :key="item.id">
        <div class="product-card" @click="goProduct(item.id)">
          <img :src="item.img" :alt="item.title" class="product-img" />
          <div class="product-info">
            <div class="product-title">{{ item.title }}</div>
            <div class="product-category">{{ item.category }}</div>
            <div class="product-price">￥{{ item.price }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { imageUtils } from '../utils/imageUtils'

const route = useRoute()
const router = useRouter()

const categories = [
  { label: '动漫角色', value: '动漫角色' },
  { label: 'Q版手办', value: 'Q版手办' },
  { label: '热门爆款', value: '热门爆款' },
  { label: '限量礼盒', value: '限量礼盒' },
  { label: '经典收藏', value: '经典收藏' },
]

const selectedCategory = ref('')

// 生成80条假数据
const allProducts = Array.from({ length: 80 }, (_, i) => {
  const catIndex = i % categories.length
  const category = categories[catIndex].value
  const imgList = [
    imageUtils.getProductImage(1),
    imageUtils.getProductImage(2),
    imageUtils.getProductImage(3),
    imageUtils.getProductImage(4),
    imageUtils.getProductImage(5),
    imageUtils.getProductImage(6),
    imageUtils.getProductImage(7),
    imageUtils.getProductImage(8),
    imageUtils.getProductImage(9),
  ]
  return {
    id: i + 1,
    title: `${category}商品${i + 1}`,
    category,
    price: (Math.floor(Math.random() * 100) + 39),
    img: imgList[i % imgList.length],
  }
})

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return allProducts
  return allProducts.filter(item => item.category === selectedCategory.value)
})

// 进入页面时根据路由参数自动筛选
onMounted(() => {
  const type = route.params.type as string
  if (type) {
    selectedCategory.value = decodeURIComponent(type)
  }
})
// 切换筛选器时同步路由
watch(selectedCategory, (val) => {
  if (val) {
    router.replace(`/category/${encodeURIComponent(val)}`)
  } else {
    router.replace('/category')
  }
})

function goProduct(id: number) {
  router.push(`/product/${id}`)
}
</script>

<style scoped>
.category-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
  background: #f7faff;
  min-height: 100vh;
}
.main-title {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 24px;
  text-align: left;
}
.category-filter {
  margin-bottom: 24px;
}
.masonry {
  column-count: 4;
  column-gap: 24px;
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 24px;
}
.product-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px #eee;
  overflow: hidden;
  transition: box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  box-shadow: 0 4px 16px #dbeafe;
}
.product-img {
  width: 100%;
  display: block;
  object-fit: cover;
  aspect-ratio: 1/1;
}
.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.product-title {
  font-size: 18px;
  font-weight: bold;
  color: #222;
  margin-bottom: 4px;
}
.product-category {
  font-size: 14px;
  color: #888;
}
.product-price {
  font-size: 16px;
  color: #ff9800;
  font-weight: bold;
}
@media (max-width: 1200px) {
  .masonry { column-count: 3; }
}
@media (max-width: 900px) {
  .masonry { column-count: 2; }
}
@media (max-width: 600px) {
  .masonry { column-count: 1; }
}
</style> 