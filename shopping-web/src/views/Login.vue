<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用户登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <el-button type="text" style="float: right" @click="$router.push('/register')">没有账号？立即注册</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
      
      <div class="quick-login">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="login-icons">
          <el-button circle @click="quickLogin('weixin')">
            <el-icon><Avatar /></el-icon>
          </el-button>
          <el-button circle @click="quickLogin('qq')">
            <el-icon><ChatRound /></el-icon>
          </el-button>
          <el-button circle @click="quickLogin('weibo')">
            <el-icon><Share /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Avatar, ChatRound, Share } from '@element-plus/icons-vue'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  if (!loginFormRef.value) return
  
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 实际应用中应该调用API进行登录验证
      setTimeout(() => {
        // 模拟登录验证
        if (loginForm.username === 'user1' && loginForm.password === '123456') {
          ElMessage.success('登录成功')
          
          // 保存登录状态和用户信息
          localStorage.setItem('isLogin', 'true')
          localStorage.setItem('username', loginForm.username)
          
          // 触发storage事件，确保其他页面也能检测到登录状态变化
          window.dispatchEvent(new Event('storage'))
          
          // 跳转到首页
          router.push('/')
        } else {
          ElMessage.error('用户名或密码错误')
        }
        
        loading.value = false
      }, 1000)
    } else {
      return false
    }
  })
}

const quickLogin = (type) => {
  // 实际应用中应该跳转到第三方登录页面
  ElMessage.info(`${type} 登录功能开发中...`)
}
</script>

<style scoped>
.login-container {
  height: calc(100vh - 140px);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-form {
  width: 400px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.quick-login {
  margin-top: 30px;
}

.divider {
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: #909399;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #dcdfe6;
}

.divider span {
  padding: 0 10px;
}

.login-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}
</style> 