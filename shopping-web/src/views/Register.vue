<template>
  <div class="register-container">
    <div class="register-form">
      <h2>用户注册</h2>
      
      <el-form 
        ref="registerForm" 
        :model="registerData" 
        :rules="rules" 
        label-width="80px"
        status-icon
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="registerData.username" 
            placeholder="请输入用户名"
            prefix-icon="User"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="registerData.email" 
            placeholder="请输入邮箱"
            prefix-icon="Message"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="registerData.phone" 
            placeholder="请输入手机号"
            prefix-icon="PhoneFilled"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="registerData.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="registerData.confirmPassword" 
            type="password" 
            placeholder="请确认密码"
            prefix-icon="Lock"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="submitForm" 
            :loading="loading"
            style="width: 100%;"
          >
            注册
          </el-button>
        </el-form-item>
        
        <div class="register-footer">
          已有账号? <router-link to="/login">立即登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Message, PhoneFilled } from '@element-plus/icons-vue'

const router = useRouter()
const registerForm = ref(null)
const loading = ref(false)

const registerData = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerData.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const submitForm = () => {
  if (!registerForm.value) return
  
  registerForm.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟注册请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 实际项目中应该调用API注册
        // const res = await userApi.register({
        //   username: registerData.username,
        //   email: registerData.email,
        //   phone: registerData.phone,
        //   password: registerData.password
        // })
        
        // 注册成功后自动登录
        localStorage.setItem('isLogin', 'true')
        localStorage.setItem('username', registerData.username)
        
        // 触发storage事件，确保其他页面也能检测到登录状态变化
        window.dispatchEvent(new Event('storage'))
        
        ElMessage.success('注册成功并已自动登录，即将跳转到首页')
        
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } catch (error) {
        console.error('注册失败:', error)
        ElMessage.error('注册失败，请稍后再试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px);
  background-color: #f5f7fa;
  padding: 20px;
}

.register-form {
  width: 100%;
  max-width: 500px;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}

.register-footer a {
  color: #409eff;
  text-decoration: none;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style> 