<script setup>
import { ref, onMounted } from 'vue'
import { House, ShoppingCart, List, User, Plus, ArrowDown, Star, InfoFilled, QuestionFilled, Collection } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
// 用户登录状态管理
const isLoggedIn = ref(false)
const username = ref('')

// 检查登录状态
const checkLoginStatus = () => {
  const loginStatus = localStorage.getItem('isLogin')
  const storedUsername = localStorage.getItem('username')
  
  isLoggedIn.value = loginStatus === 'true'
  username.value = storedUsername || '用户'
  
  console.log('登录状态:', isLoggedIn.value ? '已登录' : '未登录', '用户名:', username.value)
}

const logout = () => {
  // 实现登出逻辑
  localStorage.removeItem('isLogin')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  username.value = ''
  
  // 提示用户已登出
  ElMessage.success('已退出登录')
  
  // 跳转到首页
  router.push('/')
}

// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus()
  
  // 监听storage变化，以便在其他标签页登录/登出时更新状态
  window.addEventListener('storage', checkLoginStatus)
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-container">
        <el-menu mode="horizontal" router :ellipsis="false" class="app-menu">
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            首页
          </el-menu-item>
          <el-menu-item index="/cart">
            <el-icon><ShoppingCart /></el-icon>
            购物车
          </el-menu-item>
          <el-menu-item index="/user/orders">
            <el-icon><List /></el-icon>
            我的订单
          </el-menu-item>
          <el-menu-item index="/activity-center">
            <el-icon><Star /></el-icon>
            活动中心
          </el-menu-item>
          <el-menu-item index="/community">
            <el-icon><Collection /></el-icon>
            社区
          </el-menu-item>
          <el-menu-item index="/help-center">
            <el-icon><QuestionFilled /></el-icon>
            帮助中心
          </el-menu-item>
          <div class="flex-grow"></div>
          <el-menu-item index="/login" v-if="!isLoggedIn">
            <el-icon><User /></el-icon>
            登录
          </el-menu-item>
          <el-menu-item index="/register" v-if="!isLoggedIn">
            <el-icon><Plus /></el-icon>
            注册
          </el-menu-item>
          <el-dropdown v-else>
            <span class="user-info">
              {{ username }}<el-icon class="ml-5"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/member-center')">会员中心</el-dropdown-item>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-menu>
      </div>
    </header>
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="app-footer">
      <div class="footer-container">
        <p>© 2025 电商购物网站</p>
      </div>
    </footer>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.app-menu {
  width: 100%;
  border-bottom: none !important;
}

.app-main {
  flex: 1;
  padding: 20px;
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
}

.app-footer {
  background-color: #f5f5f5;
  padding: 20px 0;
  margin-top: 40px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}

.flex-grow {
  flex-grow: 1;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 60px;
  padding: 0 15px;
}

.ml-5 {
  margin-left: 5px;
}

/* 页面过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .app-main {
    padding: 10px;
  }
  
  .footer-container {
    padding: 0 10px;
  }
}
</style>
