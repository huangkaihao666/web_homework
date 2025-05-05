<template>
  <div class="user-list-container">
    <div class="page-header">
      <h2>用户列表</h2>
    </div>
    
    <!-- 搜索区域 -->
    <el-card class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="输入用户ID"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="注册时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 表格区域 -->
    <el-card class="table-area" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        
        <el-table-column label="头像" width="100">
          <template #default="scope">
            <el-avatar 
              :size="40" 
              :src="scope.row.imgUrl ? getProxyImageUrl(scope.row.imgUrl) : userAvatar"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        
        <el-table-column prop="username" label="用户名" width="150"></el-table-column>
        
        <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
        
        <el-table-column prop="phone" label="手机号" width="150"></el-table-column>
        
        <el-table-column prop="registerTime" label="注册时间" width="180"></el-table-column>
        
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="180"></el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button size="small" type="primary" @click="viewUser(scope.row)">查看</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 'active' ? 'danger' : 'success'"
              @click="toggleUserStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 用户详情对话框 -->
    <el-dialog v-model="userDialogVisible" title="用户详情" width="600px">
      <div v-if="currentUser" class="user-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ currentUser.registerTime }}</el-descriptions-item>
          <el-descriptions-item label="最后登录时间">{{ currentUser.lastLoginTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'">
              {{ currentUser.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="user-orders" style="margin-top: 20px;">
          <h4>最近订单</h4>
          <el-table :data="currentUser.orders || []" border style="width: 100%">
            <el-table-column prop="id" label="订单ID" width="100"></el-table-column>
            <el-table-column prop="totalAmount" label="订单金额" width="120">
              <template #default="scope">
                ¥{{ scope.row.totalAmount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="下单时间" width="180"></el-table-column>
            <el-table-column label="订单状态" width="120">
              <template #default="scope">
                <el-tag :type="getOrderStatusType(scope.row.status)">
                  {{ getOrderStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button size="small" type="primary" @click="viewOrder(scope.row.id)">查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import userApi from '@/api/user'

// 原始图片URL
const originalUserAvatar = 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp';

// 通过代理访问图片
const getProxyImageUrl = (url) => {
  return `http://localhost:3000/api/proxy/image?url=${encodeURIComponent(url)}`
}

// 统一使用的代理图片地址
const userAvatar = getProxyImageUrl(originalUserAvatar);

const router = useRouter()
const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const userDialogVisible = ref(false)
const currentUser = ref(null)

// 搜索表单
const searchForm = reactive({
  userId: '',
  username: '',
  dateRange: []
})

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    'PENDING_PAYMENT': '待付款',
    'PENDING_SHIPMENT': '待发货',
    'SHIPPED': '已发货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态标签类型
const getOrderStatusType = (status) => {
  const typeMap = {
    'PENDING_PAYMENT': 'warning',
    'PENDING_SHIPMENT': 'info',
    'SHIPPED': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  }
  return typeMap[status] || ''
}

// 加载用户数据
const loadUsers = async () => {
  loading.value = true
  
  const params = {
    page: currentPage.value,
    limit: pageSize.value,
    userId: searchForm.userId || undefined,
    username: searchForm.username || undefined,
    startDate: searchForm.dateRange?.[0] || undefined,
    endDate: searchForm.dateRange?.[1] || undefined
  }
  
  try {
    console.log('正在调用用户API:', params)
    const res = await userApi.getUsers(params)
    console.log('API返回数据:', res)
    
    // 替换所有用户头像为统一图片
    tableData.value = res.map(user => ({
      ...user,
      imgUrl: user.imgUrl || originalUserAvatar // 使用原始URL，在显示时会通过代理访问
    }))
    
    total.value = res.total || res.length
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败: ' + (error.message || '未知错误'))
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 查询用户
const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.userId = ''
  searchForm.username = ''
  searchForm.dateRange = []
  handleSearch()
}

// 切换页码
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadUsers()
}

// 切换每页显示数量
const handleSizeChange = (val) => {
  pageSize.value = val
  loadUsers()
}

// 查看用户详情
const viewUser = async (user) => {
  loading.value = true
  
  try {
    // 获取用户详情
    const userDetail = await userApi.getUser(user.id)
    console.log('获取到的用户详情:', userDetail)
    
    // 将获取到的用户详情合并到当前用户对象
    currentUser.value = { 
      ...userDetail,
      imgUrl: userDetail.imgUrl || originalUserAvatar // 使用原始URL，在显示时会通过代理访问
    }
    
    // 由于后端API未实现用户订单接口，这里使用模拟数据
    currentUser.value.orders = [
      {
        id: 10001,
        totalAmount: 299,
        createdAt: '2024-05-01 14:23:12',
        status: 'COMPLETED'
      },
      {
        id: 10002,
        totalAmount: 599,
        createdAt: '2024-04-15 09:45:30',
        status: 'SHIPPED'
      },
      {
        id: 10003,
        totalAmount: 158,
        createdAt: '2024-03-20 16:32:45',
        status: 'CANCELLED'
      }
    ]
    
    userDialogVisible.value = true
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
    
    // 如果API调用失败，使用表格中现有的用户数据
    currentUser.value = { ...user }
    
    // 添加订单模拟数据
    currentUser.value.orders = [
      {
        id: 10001,
        totalAmount: 299,
        createdAt: '2024-05-01 14:23:12',
        status: 'COMPLETED'
      },
      {
        id: 10002,
        totalAmount: 599,
        createdAt: '2024-04-15 09:45:30',
        status: 'SHIPPED'
      },
      {
        id: 10003,
        totalAmount: 158,
        createdAt: '2024-03-20 16:32:45',
        status: 'CANCELLED'
      }
    ]
    
    userDialogVisible.value = true
  } finally {
    loading.value = false
  }
}

// 查看订单详情
const viewOrder = (orderId) => {
  userDialogVisible.value = false
  router.push(`/orders/${orderId}`)
}

// 切换用户状态
const toggleUserStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active'
  const actionText = newStatus === 'active' ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}用户 ${user.username} 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用API更新用户状态
    await userApi.updateUserStatus(user.id, newStatus)
    
    // 更新本地状态
    user.status = newStatus
    ElMessage.success(`已${actionText}用户 ${user.username}`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新用户状态失败:', error)
      ElMessage.error('更新用户状态失败')
    }
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
}

.search-area {
  margin-bottom: 20px;
}

.table-area {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 用户详情样式 */
.user-details {
  padding: 10px;
}
</style> 