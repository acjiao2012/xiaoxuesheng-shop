import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [] as Order[],
  }),
  actions: {
    loadOrders() {
      const o = localStorage.getItem('orders')
      if (o) this.orders = JSON.parse(o)
    },
    saveOrders() {
      localStorage.setItem('orders', JSON.stringify(this.orders))
    },
    setOrders(orders: Order[]) {
      this.orders = orders
      this.saveOrders()
    },
    updateOrder(order: Order) {
      const idx = this.orders.findIndex(o => o.id === order.id)
      if (idx > -1) {
        // 检查状态/物流变动
        const old = this.orders[idx]
        this.orders[idx] = order
        this.saveOrders()
        this.pushOrderChangeMsg(order, old)
      }
    },
    pushOrderChangeMsg(order: Order, old: Order) {
      const userStore = useUserStore()
      if (order.status !== old.status) {
        if (order.status === 'shipped') {
          userStore.addNotification({
            id: Date.now() + '-ship',
            type: 'logistics',
            title: '订单已发货',
            content: `您的订单${order.id}已发货，快递公司：${order.logistics?.company}`,
            read: false,
            createdAt: new Date().toLocaleString()
          } as AppNotification)
        }
        if (order.status === 'completed') {
          userStore.addNotification({
            id: Date.now() + '-done',
            type: 'order',
            title: '订单已完成',
            content: `您的订单${order.id}已签收，感谢您的购买！`,
            read: false,
            createdAt: new Date().toLocaleString()
          } as AppNotification)
        }
      }
      // 物流节点变动
      if (order.logistics && old.logistics) {
        const oldLen = old.logistics.traces.length
        const newLen = order.logistics.traces.length
        if (newLen > oldLen) {
          const lastTrace = order.logistics.traces[newLen-1]
          userStore.addNotification({
            id: Date.now() + '-trace',
            type: 'logistics',
            title: '物流更新',
            content: `您的订单${order.id}物流状态更新：${lastTrace.status}`,
            read: false,
            createdAt: new Date().toLocaleString()
          } as AppNotification)
        }
      }
    },
    addOrder(order: Order) {
      this.orders.unshift(order)
      this.saveOrders()
    }
  }
}) 