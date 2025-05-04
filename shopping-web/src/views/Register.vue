<template>
  <div class="register-container">
    <div class="register-form">
      <h2>用户注册</h2>
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码"></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"></el-input>
        </el-form-item>
        
        <el-form-item label="验证码" prop="captcha">
          <div class="captcha-container">
            <el-input v-model="registerForm.captcha" placeholder="请输入验证码"></el-input>
            <div class="captcha-image" @click="refreshCaptcha">
              <img :src="captchaUrl" alt="验证码">
            </div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="registerForm.agreement" label="我已阅读并同意">
            <el-button type="text" @click="showTerms">《用户协议》</el-button>
          </el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click="handleRegister" :loading="loading" :disabled="!registerForm.agreement">注册</el-button>
        </el-form-item>
        
        <el-form-item>
          <div class="login-link">
            已有账号？<el-button type="text" @click="$router.push('/login')">立即登录</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 用户协议对话框 -->
    <el-dialog v-model="termsVisible" title="用户协议" width="600px">
      <div class="terms-content">
        <h3>电商购物网站用户协议</h3>
        <p>欢迎您使用我们的电商购物平台。在使用本平台之前，请您仔细阅读以下条款：</p>
        
        <h4>1. 账户注册与安全</h4>
        <p>1.1 您承诺注册时提供的个人资料是真实、准确、完整的。</p>
        <p>1.2 您有责任保管好自己的账号和密码，任何基于您的账号和密码的操作将被视为您本人的行为。</p>
        
        <h4>2. 用户行为规范</h4>
        <p>2.1 您承诺遵守中华人民共和国相关法律法规。</p>
        <p>2.2 您不得利用本平台从事任何违法或不当的活动。</p>
        
        <h4>3. 商品和服务</h4>
        <p>3.1 本平台上展示的商品信息仅供参考，最终以实际购买时的商品信息为准。</p>
        <p>3.2 本平台有权随时调整商品价格和库存信息。</p>
        
        <h4>4. 隐私保护</h4>
        <p>4.1 我们重视对您个人信息的保护，具体内容请参见《隐私政策》。</p>
        
        <h4>5. 协议修改</h4>
        <p>5.1 本平台有权在必要时修改用户协议，修改后的协议会在平台上公布。</p>
        <p>5.2 如您继续使用本平台，则视为您接受修改后的协议。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="termsVisible = false">关闭</el-button>
          <el-button type="primary" @click="agreeTerms">同意</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const registerFormRef = ref(null)
const loading = ref(false)
const termsVisible = ref(false)
const captchaUrl = ref('https://via.placeholder.com/120x40?text=1234')

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  agreement: false
})

// 自定义验证规则
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 4, message: '验证码长度应为4个字符', trigger: 'blur' }
  ]
}

const handleRegister = () => {
  if (!registerFormRef.value) return
  
  registerFormRef.value.validate((valid) => {
    if (valid) {
      if (!registerForm.agreement) {
        ElMessage.warning('请阅读并同意用户协议')
        return
      }
      
      loading.value = true
      
      // 实际应用中应该调用API进行注册
      setTimeout(() => {
        // 模拟注册成功
        ElMessage.success('注册成功，请登录')
        router.push('/login')
        
        loading.value = false
      }, 1000)
    } else {
      return false
    }
  })
}

const refreshCaptcha = () => {
  // 实际应用中应该从服务器获取新的验证码
  // 这里只是模拟更新验证码
  const random = Math.floor(1000 + Math.random() * 9000)
  captchaUrl.value = `https://via.placeholder.com/120x40?text=${random}`
}

const showTerms = () => {
  termsVisible.value = true
}

const agreeTerms = () => {
  registerForm.agreement = true
  termsVisible.value = false
}

onMounted(() => {
  refreshCaptcha()
})
</script>

<style scoped>
.register-container {
  min-height: calc(100vh - 140px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  background-color: #f5f5f5;
}

.register-form {
  width: 500px;
  padding: 30px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.register-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-image {
  margin-left: 10px;
  cursor: pointer;
}

.captcha-image img {
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.login-link {
  text-align: center;
}

.terms-content {
  height: 300px;
  overflow-y: auto;
  padding: 0 10px;
}

.terms-content h3, .terms-content h4 {
  margin-top: 20px;
  margin-bottom: 10px;
}

.terms-content p {
  margin-bottom: 10px;
  line-height: 1.5;
}
</style> 