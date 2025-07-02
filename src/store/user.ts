import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    userInfo: null as User | null,
    token: '',
    coupons: [] as Coupon[],
    notifications: [] as AppNotification[],
    addresses: [] as Address[],
    recommendProducts: [] as RecommendProduct[],
  }),
  actions: {
    login(user: User, token: string) {
      this.isLogin = true
      this.userInfo = user
      this.token = token
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
    },
    autoLogin() {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (user && token) {
        this.isLogin = true
        this.userInfo = JSON.parse(user)
        this.token = token
      }
    },
    logout() {
      this.isLogin = false
      this.userInfo = null
      this.token = ''
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('cartItems')
      localStorage.removeItem('orders')
      localStorage.removeItem('notifications')
    },
    loadFromStorage() {
      const user = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      if (user && token) {
        this.isLogin = true
        this.userInfo = JSON.parse(user)
        this.token = token
      }
    },
    setCoupons(coupons: Coupon[]) {
      this.coupons = coupons
    },
    setNotifications(notifications: AppNotification[]) {
      this.notifications = notifications
    },
    setAddresses(addresses: Address[]) {
      this.addresses = addresses
    },
    setRecommendProducts(products: RecommendProduct[]) {
      this.recommendProducts = products
    },
    updateUserInfo(user: User) {
      this.userInfo = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    addNotification(notification: AppNotification) {
      this.notifications.unshift(notification)
      localStorage.setItem('notifications', JSON.stringify(this.notifications))
    },
    markNotificationRead(id: string) {
      const n = this.notifications.find(n => n.id === id)
      if (n) n.read = true
      localStorage.setItem('notifications', JSON.stringify(this.notifications))
    },
    loadNotifications() {
      const n = localStorage.getItem('notifications')
      if (n) this.notifications = JSON.parse(n)
    },
    generateRecommend(products: Product[], userHistory: Product[] = []) {
      // 简单推荐算法：优先最近浏览、再热销、再猜你喜欢
      const rec: RecommendProduct[] = []
      if (userHistory.length) {
        rec.push(...userHistory.slice(-4).map(p => ({ ...p, reason: '最近浏览' })))
      }
      rec.push(...products.slice(0, 4).map(p => ({ ...p, reason: '热销推荐' })))
      // 去重
      const map = new Map()
      rec.forEach(item => map.set(item.id, item))
      this.recommendProducts = Array.from(map.values()).slice(0, 8)
    },
  }
}) 