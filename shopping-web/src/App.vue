<script setup>
import { ref } from 'vue'
import { House, ShoppingCart, List, User, Plus, ArrowDown } from '@element-plus/icons-vue'

// 用户登录状态管理，实际应用中应该从状态管理中获取
const isLoggedIn = ref(false)
const username = ref('用户名')

const logout = () => {
  // 实现登出逻辑
  isLoggedIn.value = false
}
</script>

<template>
  <div class="app-container">
    <header>
      <el-menu mode="horizontal" router>
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          首页
        </el-menu-item>
        <el-menu-item index="/cart">
          <el-icon><ShoppingCart /></el-icon>
          购物车
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><List /></el-icon>
          我的订单
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
            {{ username }}<el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-menu>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>© 2024 电商购物网站 - 校企合作项目</p>
    </footer>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  padding: 20px;
}

.flex-grow {
  flex-grow: 1;
}

footer {
  text-align: center;
  padding: 20px;
  background-color: #f5f5f5;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  height: 60px;
  padding: 0 15px;
}
</style>
