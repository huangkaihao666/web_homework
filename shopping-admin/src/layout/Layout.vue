<template>
  <div class="admin-layout">
    <el-container class="layout-container">
      <el-aside width="220px" class="sidebar">
        <div class="logo">
          <h2>购物网站管理系统</h2>
        </div>
        <el-menu
          default-active="dashboard"
          class="menu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          
          <el-sub-menu index="1">
            <template #title>
              <el-icon><ShoppingBag /></el-icon>
              <span>商品管理</span>
            </template>
            <el-menu-item index="/products">商品列表</el-menu-item>
            <el-menu-item index="/products/add">添加商品</el-menu-item>
            <el-menu-item index="/categories">商品分类</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="2">
            <template #title>
              <el-icon><List /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/orders">订单列表</el-menu-item>
          </el-sub-menu>
          
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-container>
        <el-header class="header">
          <div class="left">
            <el-icon class="sidebar-btn" @click="toggleSidebar"><Fold /></el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="right">
            <el-dropdown>
              <span class="user-dropdown">
                管理员 <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  Odometer, 
  ShoppingBag, 
  List, 
  User, 
  Fold, 
  ArrowDown 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const sidebar = ref({
  collapsed: false
})

const routeMap = {
  dashboard: '仪表盘',
  products: '商品列表',
  'products/add': '添加商品',
  'products/edit': '编辑商品',
  orders: '订单列表',
  users: '用户管理',
  categories: '商品分类'
}

const currentRoute = computed(() => {
  const path = route.path.split('/')[1]
  return routeMap[path] || path
})

const toggleSidebar = () => {
  sidebar.value.collapsed = !sidebar.value.collapsed
}

const logout = () => {
  localStorage.removeItem('adminToken')
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  height: 100%;
}

.layout-container {
  height: 100%;
}

.sidebar {
  background-color: #304156;
  color: #fff;
  height: 100%;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b2f3a;
}

.logo h2 {
  color: #fff;
  margin: 0;
  font-size: 16px;
}

.menu {
  border-right: none;
  height: calc(100% - 60px);
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 15px;
}

.left, .right {
  display: flex;
  align-items: center;
}

.sidebar-btn {
  margin-right: 15px;
  cursor: pointer;
  font-size: 20px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.main {
  padding: 20px;
  background-color: #f0f2f5;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
</style> 