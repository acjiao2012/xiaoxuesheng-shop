import { ElMessage } from 'element-plus'

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN'
}

// 错误信息映射
const errorMessages = {
  [ErrorType.NETWORK]: '网络连接失败，请检查网络后重试',
  [ErrorType.VALIDATION]: '输入信息有误，请检查后重试',
  [ErrorType.AUTH]: '登录已过期，请重新登录',
  [ErrorType.PERMISSION]: '权限不足，无法执行此操作',
  [ErrorType.UNKNOWN]: '系统出现未知错误，请稍后重试'
}

// 错误处理函数
export function handleError(error: unknown, type: ErrorType = ErrorType.UNKNOWN) {
  console.error('Error occurred:', error)
  
  // 根据错误类型显示不同的消息
  const message = errorMessages[type] || errorMessages[ErrorType.UNKNOWN]
  
  // 显示错误消息
  ElMessage.error(message)
  
  // 特殊错误处理
  if (type === ErrorType.AUTH) {
    // 跳转到登录页
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }
}

// API错误处理
export function handleApiError(error: unknown) {
  // 类型守卫检查
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response: { status: number; data?: { message?: string } } }
    const status = apiError.response.status
    const message = apiError.response.data?.message || '请求失败'
    
    switch (status) {
      case 401:
        handleError(error, ErrorType.AUTH)
        break
      case 403:
        handleError(error, ErrorType.PERMISSION)
        break
      case 422:
        handleError(error, ErrorType.VALIDATION)
        break
      default:
        ElMessage.error(message)
    }
  } else if (error && typeof error === 'object' && 'request' in error) {
    // 网络错误
    handleError(error, ErrorType.NETWORK)
  } else {
    // 其他错误
    handleError(error, ErrorType.UNKNOWN)
  }
}

// 表单验证错误处理
export function handleValidationError(errors: Record<string, unknown>) {
  const errorMessages = Object.values(errors).flat()
  if (errorMessages.length > 0) {
    ElMessage.error(errorMessages[0] as string)
  }
}

// 异步操作错误处理
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorType: ErrorType = ErrorType.UNKNOWN
): Promise<T | null> {
  try {
    return await asyncFn()
  } catch (error) {
    handleError(error, errorType)
    return null
  }
}

// 图片加载错误处理
export function handleImageError(event: Event, fallbackSrc: string = '/placeholder.jpg') {
  const img = event.target as HTMLImageElement
  if (img.src !== fallbackSrc) {
    img.src = fallbackSrc
    console.warn('Image failed to load, using fallback:', img.src)
  }
}

// 路由错误处理
export function handleRouteError(error: unknown) {
  console.error('Route error:', error)
  ElMessage.error('页面跳转失败，请重试')
}

// 全局未捕获错误处理
export function setupGlobalErrorHandling() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    handleError(event.error, ErrorType.UNKNOWN)
  })

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    handleError(event.reason, ErrorType.UNKNOWN)
    event.preventDefault()
  })
} 