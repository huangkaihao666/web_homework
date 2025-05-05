<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('profile')
const userInfo = ref({
  username: '',
  nickname: '',
  avatar: '',
  level: '',
  points: 0,
  registerTime: ''
})
const loading = ref(true)

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    userInfo.value = {
      username: 'user1',
      nickname: '张三',
      avatar: '',
      level: '黄金会员',
      points: 1250,
      registerTime: '2023-01-15'
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    loading.value = false
  }
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 初始化
onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="member-container container">
    <div class="page-header">
      <h1>会员中心</h1>
      <el-button @click="goHome" plain>返回首页</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else class="member-content">
      <!-- 会员信息卡片 -->
      <div class="member-card">
        <div class="avatar">
          <el-avatar :size="80" :src="userInfo.avatar">
            {{ userInfo.nickname ? userInfo.nickname.substring(0, 1) : 'U' }}
          </el-avatar>
        </div>
        <div class="info">
          <h2>{{ userInfo.nickname || userInfo.username }}</h2>
          <div class="level">
            <el-tag type="warning">{{ userInfo.level }}</el-tag>
          </div>
          <div class="points">积分: {{ userInfo.points }}</div>
          <div class="register-time">注册时间: {{ userInfo.registerTime }}</div>
        </div>
      </div>
      
      <!-- 会员功能选项卡 -->
      <el-tabs v-model="activeTab" class="member-tabs">
        <el-tab-pane label="个人资料" name="profile">
          <div class="tab-content">
            <h3>个人资料</h3>
            <p>这里将显示用户的个人资料设置</p>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="收货地址" name="address">
          <div class="tab-content">
            <h3>收货地址</h3>
            <p>这里将显示用户的收货地址管理</p>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="我的收藏" name="favorites">
          <div class="tab-content">
            <h3>我的收藏</h3>
            <p>这里将显示用户收藏的商品</p>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="浏览历史" name="history">
          <div class="tab-content">
            <h3>浏览历史</h3>
            <p>这里将显示用户的浏览历史</p>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="消息中心" name="messages">
          <div class="tab-content">
            <h3>消息中心</h3>
            <p>这里将显示系统消息和通知</p>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="积分中心" name="points">
          <div class="tab-content">
            <h3>积分中心</h3>
            <p>这里将显示积分获取和使用记录</p>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="账户安全" name="security">
          <div class="tab-content">
            <h3>账户安全</h3>
            <p>这里将显示账户安全设置</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.member-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.member-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.avatar {
  margin-right: 20px;
}

.info h2 {
  margin: 0 0 10px 0;
}

.level {
  margin-bottom: 10px;
}

.points, .register-time {
  color: #606266;
  margin-bottom: 5px;
}

.member-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.tab-content {
  min-height: 300px;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .member-card {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar {
    margin-right: 0;
    margin-bottom: 15px;
  }
}
</style> 