// Vue 文件类型声明
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 图片文件类型声明
declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

// 全局类型定义
interface Window {
  __VUE_APP__: unknown
}

// API 响应类型
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 用户类型
interface User {
  id: number
  name: string
  email: string
  type: 'student' | 'parent'
  avatar?: string
  balance?: number
  gender?: number // 0保密 1男 2女
  birthday?: string // YYYY-MM-DD
}

// 商品类型
interface Product {
  id: number
  title: string
  price: number
  img: string
  description?: string
  category?: string
  stock?: number
  rating?: number
  reviewCount?: number
}

// 购物车项类型
interface CartItem {
  id: number
  productId: number
  title: string
  price: number
  img: string
  count: number
  color?: string
  size?: string
}

// 订单类型
interface Order {
  id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
  logistics?: Logistics
  paymentMethod?: 'alipay' | 'wechat' | 'balance'
  reviewed?: boolean
  address?: Address
}

// 订单项类型
interface OrderItem extends CartItem {
  reviewed?: boolean
  image?: string
}

// 分页类型
interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 分页响应类型
interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

// 优惠券类型
declare interface Coupon {
  id: string
  code: string
  title: string
  discount: number
  minAmount: number
  validFrom: string
  validTo: string
  status: 'unused' | 'used' | 'expired'
}

// 物流信息类型
declare interface Logistics {
  id: string
  company: string
  companyCode: string
  trackingNumber: string
  status: 'pending' | 'shipped' | 'delivered' | 'returned'
  createdAt: string
  trackingInfo: LogisticsTrace[]
}

// 物流轨迹类型
declare interface LogisticsTrace {
  time: string
  location: string
  status: string
  description: string
}

// 支付信息类型
declare interface Payment {
  id: string
  orderId: string
  paymentNo: string
  amount: number
  paymentMethod: 'alipay' | 'wechat' | 'balance'
  status: 'pending' | 'success' | 'failed'
  createdAt: string
  paidAt?: string
}

// 支付数据类型
declare interface PaymentData {
  paymentUrl?: string
  qrCode?: string
  paymentNo: string
  amount: number
  success?: boolean
  message?: string
}

// 评价类型
declare interface Review {
  id: string
  userId: string
  productId: string
  orderId: string
  rating: number
  content: string
  images: string[]
  tags: string[]
  anonymous: boolean
  createdAt: string
  userName?: string
  userAvatar?: string
  reply?: string
}

// 评价统计类型
declare interface ReviewStats {
  avgRating: number
  totalCount: number
  ratingDistribution: {
    [key: number]: number
  }
}

// 消息通知类型
declare interface AppNotification {
  id: string
  type: 'order' | 'logistics' | 'promotion' | 'system'
  title: string
  content: string
  read: boolean
  createdAt: string
}

// 地址类型
declare interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string // 区县
  detail_address: string // 详细地址
  is_default: boolean
  created_at: string
}

// 推荐商品类型
declare interface RecommendProduct extends Product {
  reason: string
} 