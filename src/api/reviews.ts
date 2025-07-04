import { apiPost, apiGet, apiPut, apiDelete } from './client'

// 评价相关API服务

// 提交商品评价
export async function submitReview(data: {
  productId: string
  orderId: string
  rating: number
  content: string
  images?: string[]
  tags?: string[]
  anonymous?: boolean
}) {
  return apiPost<{
    message: string
    reviewId: string
  }>('/reviews', data)
}

// 获取商品评价列表
export async function getProductReviews(params: {
  productId: string
  page?: number
  limit?: number
  rating?: number
  sort?: 'latest' | 'rating_desc' | 'rating_asc'
}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })

  return apiGet<{
    reviews: Review[]
    pagination: Pagination
  }>(`/reviews/product/${params.productId}?${searchParams}`)
}

// 获取用户评价列表
export async function getUserReviews(params: {
  page?: number
  limit?: number
  status?: 'pending' | 'completed'
}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })

  return apiGet<{
    reviews: Review[]
    pagination: Pagination
  }>(`/reviews/user?${searchParams}`)
}

// 删除评价
export async function deleteReview(reviewId: string) {
  return apiDelete<{
    message: string
  }>(`/reviews/${reviewId}`)
}

// 更新评价
export async function updateReview(reviewId: string, data: {
  rating?: number
  content?: string
  images?: string[]
  tags?: string[]
}) {
  return apiPut<{
    message: string
    reviewId: string
  }>(`/reviews/${reviewId}`, data)
}

// 获取评价统计
export async function getReviewStats(productId: string) {
  return apiGet<ReviewStats>(`/reviews/stats/${productId}`)
}

// 获取评价标签
export async function getReviewTags() {
  return apiGet<{
    tags: string[]
  }>('/reviews/tags')
} 