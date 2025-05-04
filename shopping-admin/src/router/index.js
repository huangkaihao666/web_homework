import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/product/ProductList.vue')
      },
      {
        path: 'products/add',
        name: 'AddProduct',
        component: () => import('../views/product/ProductForm.vue')
      },
      {
        path: 'products/edit/:id',
        name: 'EditProduct',
        component: () => import('../views/product/ProductForm.vue')
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/order/OrderList.vue')
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/order/OrderDetail.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/user/UserList.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/category/CategoryList.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('adminToken')
  
  if (to.path !== '/login' && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router 