import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/ProductDetail.vue')
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/Cart.vue')
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { requiresAuth: false } // 临时设置为false以便测试
  },
  {
    path: '/order/success',
    name: 'OrderSuccess',
    component: () => import('@/views/OrderSuccess.vue'),
    meta: { requiresAuth: false } // 临时设置为false以便测试
  },
  {
    path: '/user/orders',
    name: 'UserOrders',
    component: () => import('@/views/UserOrders.vue'),
    meta: { requiresAuth: false } // 临时设置为false以便测试
  },
  {
    // 也匹配/orders路径，用于兼容旧链接
    path: '/orders',
    name: 'Orders',
    component: () => import('@/views/Orders.vue'),
    meta: { requiresAuth: false } // 临时设置为false以便测试
  },
  {
    path: '/order/:id',
    name: 'OrderDetail',
    component: () => import('@/views/OrderSuccess.vue'),
    meta: { requiresAuth: false } // 临时设置为false以便测试
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue')
  },
  {
    path: '/member-center',
    name: 'MemberCenter',
    component: () => import('@/views/MemberCenter.vue'),
    meta: { requiresAuth: false } // 临时设置为false以便测试
  },
  {
    path: '/activity-center',
    name: 'ActivityCenter',
    component: () => import('@/views/ActivityCenter.vue')
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/Community.vue')
  },
  {
    path: '/help-center',
    name: 'HelpCenter',
    component: () => import('@/views/HelpCenter.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { requiresAuth: false } // 临时设置为false以便测试
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加全局导航钩子，打印路由信息
router.beforeEach((to, from, next) => {
  console.log('===路由跳转===')
  console.log('从:', from.fullPath, '跳转到:', to.fullPath)
  console.log('目标路由:', to.name, '路由参数:', to.params, '查询参数:', to.query)
  console.log('是否需要授权:', to.meta.requiresAuth)
  
  const token = localStorage.getItem('userToken')
  console.log('当前token状态:', token ? '已登录' : '未登录')
  
  if (to.meta.requiresAuth && !token) {
    // 如果需要登录但没有token，重定向到登录页
    console.log('需要登录，重定向到登录页')
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    console.log('允许访问路由')
    next()
  }
})

export default router 