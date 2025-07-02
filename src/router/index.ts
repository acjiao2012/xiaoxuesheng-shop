import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/product/:id', name: 'Product', component: () => import('../views/Product.vue') },
  { path: '/cart', name: 'Cart', component: () => import('../views/Cart.vue') },
  { path: '/checkout', name: 'Checkout', component: () => import('../views/Checkout.vue') },
  { path: '/orders', name: 'Orders', component: () => import('../views/Orders.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/category', name: 'Category', component: () => import('../views/Category.vue') },
  { path: '/category/:type', name: 'CategoryType', component: () => import('../views/Category.vue') },
  { path: '/user', name: 'UserCenter', component: () => import('../views/UserCenter.vue') },
  { path: '/coupons', name: 'Coupons', component: () => import('../views/Coupons.vue') },
  { path: '/notifications', name: 'Notifications', component: () => import('../views/Notifications.vue') },
  { path: '/address', name: 'AddressList', component: () => import('../views/AddressList.vue') },
  { path: '/order/:id', name: 'OrderDetail', component: () => import('../views/OrderDetail.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router 