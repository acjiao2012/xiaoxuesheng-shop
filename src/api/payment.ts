import { apiPost, apiGet } from './client'

// 支付相关API服务

// 创建支付订单
export async function createPayment(data: {
  orderId: string
  paymentMethod: 'alipay' | 'wechat' | 'balance'
  amount: number
}) {
  return apiPost<{
    message: string
    paymentId: string
    paymentNo: string
    paymentData: PaymentData
  }>('/payment/create', data)
}

// 查询支付状态
export async function queryPaymentStatus(paymentId: string) {
  return apiGet<{
    paymentId: string
    status: 'pending' | 'success' | 'failed'
    paymentData?: PaymentData
  }>(`/payment/status/${paymentId}`)
}

// 获取用户余额
export async function getUserBalance() {
  return apiGet<{
    balance: number
    currency: string
  }>('/users/balance')
}

// 申请退款
export async function requestRefund(data: {
  orderId: string
  reason: string
  amount: number
}) {
  return apiPost<{
    message: string
    refundId: string
    status: 'pending' | 'success' | 'failed'
  }>('/payment/refund', data)
}

// 获取支付历史
export async function getPaymentHistory(params: {
  page?: number
  limit?: number
  status?: 'pending' | 'success' | 'failed'
}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })
  
  return apiGet<{
    payments: Payment[]
    pagination: Pagination
  }>(`/payment/history?${searchParams}`)
} 