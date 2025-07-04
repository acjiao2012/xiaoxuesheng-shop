import { apiGet, apiPost } from './client'

// 物流相关API服务

// 获取物流信息
export async function getLogisticsInfo(orderId: string) {
  return apiGet<{
    logistics: Logistics
  }>(`/logistics/tracking/${orderId}`)
}

// 获取物流公司列表
export async function getLogisticsCompanies() {
  return apiGet<{
    companies: Array<{
      code: string
      name: string
    }>
  }>('/logistics/companies')
}

// 发货
export async function shipOrder(data: {
  orderId: string
  logisticsCompany: string
  trackingNumber: string
}) {
  return apiPost<{
    message: string
    logisticsId: string
    trackingNumber: string
    logisticsCompany: string
  }>('/logistics/ship', data)
}

// 更新物流状态
export async function updateLogisticsStatus(data: {
  orderId: string
  status: string
  location: string
  description: string
}) {
  return apiPost<{
    message: string
    logisticsId: string
    updatedAt: string
  }>('/logistics/update-status', data)
}

// 批量发货
export async function batchShipOrders(data: {
  orders: Array<{
    orderId: string
    logisticsCompany: string
    trackingNumber: string
  }>
}) {
  return apiPost<{
    message: string
    successCount: number
    failedCount: number
    results: Array<{
      orderId: string
      success: boolean
      message: string
    }>
  }>('/logistics/batch-ship', data)
} 