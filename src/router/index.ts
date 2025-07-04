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
  { path: '/payment/:orderId', name: 'Payment', component: () => import('../views/Payment.vue') },
  { path: '/logistics/:orderId', name: 'Logistics', component: () => import('../views/Logistics.vue') },
  { path: '/review/:productId/:orderId', name: 'Review', component: () => import('../views/Review.vue') },
  { path: '/reviews/:productId', name: 'ProductReviews', component: () => import('../views/ProductReviews.vue') },
  { path: '/api-test', name: 'ApiTest', component: () => import('../views/ApiTest.vue') },
  { path: '/payment-test', name: 'PaymentTest', component: () => import('../views/PaymentTest.vue') },
  { path: '/simple-payment-test', name: 'SimplePaymentTest', component: () => import('../views/SimplePaymentTest.vue') },
  { path: '/debug-payment', name: 'DebugPayment', component: () => import('../views/DebugPayment.vue') },
  { path: '/points-shop', name: 'PointsShop', component: () => import('../views/PointsShop.vue') },
  { path: '/my-reviews', name: 'MyReviews', component: () => import('../views/MyReviews.vue') },
  { path: '/admin/review-reply', name: 'AdminReviewReply', component: () => import('../views/AdminReviewReply.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router 