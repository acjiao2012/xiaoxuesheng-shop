// API客户端配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// 请求拦截器
function createRequestConfig(method: string, data?: unknown): RequestInit {
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  }

  // 添加认证token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }

  // 添加请求体
  if (data && method !== 'GET') {
    config.body = JSON.stringify(data)
  }

  return config
}

// 响应处理
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

// 通用API请求函数
export async function apiRequest<T>(
  endpoint: string,
  method: string = 'GET',
  data?: unknown
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const config = createRequestConfig(method, data)
  
  try {
    const response = await fetch(url, config)
    return await handleResponse<T>(response)
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// GET请求
export function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, 'GET')
}

// POST请求
export function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, 'POST', data)
}

// PUT请求
export function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  return apiRequest<T>(endpoint, 'PUT', data)
}

// DELETE请求
export function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, 'DELETE')
}

// 文件上传
export async function uploadFile(file: File, endpoint: string = '/upload'): Promise<{ url: string }> {
  const formData = new FormData()
  formData.append('file', file)
  
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {}
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData
  })
  
  return handleResponse<{ url: string }>(response)
} 