import { apiGet, apiPut, apiPost, apiDelete } from './client'

export function getUserProfile() {
  return apiGet<User>('/user/profile')
}

export function updateUserProfile(data: Partial<User>) {
  // 支持 name, email, avatar, gender, birthday
  return apiPut('/user/profile', data)
}

// 获取收货地址列表
export function getAddressList() {
  return apiGet<{ addresses: Address[] }>('/user/addresses')
}

// 新增收货地址
export function addAddress(data: Omit<Address, 'id' | 'created_at'>) {
  return apiPost<{ message: string; addressId: string }>('/user/addresses', data)
}

// 更新收货地址
export function updateAddress(addressId: string, data: Omit<Address, 'id' | 'created_at'>) {
  return apiPut<{ message: string }>(`/user/addresses/${addressId}`, data)
}

// 删除收货地址
export function deleteAddress(addressId: string) {
  return apiDelete<{ message: string }>(`/user/addresses/${addressId}`)
}

// 设置默认地址
export function setDefaultAddress(addressId: string) {
  return apiPost<{ message: string }>(`/user/addresses/${addressId}/default`)
}

// 上传头像
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return apiPost<{ code: number; url: string }>('/user/upload-avatar', formData)
}

export function getUserPoints() {
  return apiGet<{ points: number; level: number; nextLevel: number; nextLevelPoints: number; progress: number }>('/user/points')
}

export function getUserPointsLog() {
  return apiGet<{ code: number; data: Array<{ change: number; type: string; description: string; created_at: string }> }>('/user/points-log')
}

export function signIn(): Promise<{ code: number; msg: string; already: boolean }> {
  return apiPost('/user/sign-in')
}

export function exchangePoints(itemId: number, type: string): Promise<{ code: number; msg: string }> {
  return apiPost('/user/exchange', { itemId, type })
}

// 获取消息通知列表
export function getNotifications() {
  return apiGet<AppNotification[]>('/user/notifications')
}

// 标记通知为已读
export function markNotificationRead(id: string) {
  return apiPost('/user/notifications/read', { id })
} 