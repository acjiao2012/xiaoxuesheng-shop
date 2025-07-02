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
  __VUE_APP__: any
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
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  total: number
  items: CartItem[]
  createdAt: string
  updatedAt: string
  logistics?: Logistics
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
  company: string
  trackingNumber: string
  status: string
  traces: Array<{
    time: string
    status: string
  }>
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
  area?: string
  detail: string
  isDefault: boolean
}

// 推荐商品类型
declare interface RecommendProduct extends Product {
  reason: string
} 