<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import userApi from '@/api/user'
import orderApi from '@/api/order'

const router = useRouter()
const loading = ref(true)
const orders = ref([])

// 获取用户订单列表
const fetchUserOrders = async () => {
  loading.value = true
  try {
    console.log('开始通过API获取用户订单数据')
    // 使用订单API获取数据（从orderApi而非userApi获取订单）
    const result = await orderApi.getUserOrders()
    console.log('API返回订单数据:', result)
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.warn('API返回订单数据不符合预期:', result)
      // 如果后端返回空数据，仍使用模拟数据，便于开发
      useMockData()
      return
    }
    
    // 确保每个订单项的totalAmount是数字
    orders.value = result.map(order => ({
      ...order,
      totalAmount: typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount) || 0,
      // 确保每个项目都有必需的属性
      items: Array.isArray(order.items) ? order.items.map(item => ({
        ...item,
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
        quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1
      })) : []
    }))
    
    console.log('处理后的订单数据:', orders.value)
  } catch (error) {
    console.error('获取订单列表失败:', error)
    
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误详情:', error.response.data)
    } else if (error.request) {
      console.error('未收到响应:', error.request)
    } else {
      console.error('错误信息:', error.message)
    }
    
    ElMessage.error('获取订单列表失败，使用模拟数据')
    // 使用模拟数据
    useMockData()
  } finally {
    loading.value = false
  }
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/order/${orderId}`)
}

// 取消订单
const cancelOrder = async (order) => {
  if (order.status !== 'PENDING') {
    ElMessage.warning('只能取消待处理的订单')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要取消这个订单吗？取消后无法恢复。',
      '取消订单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await orderApi.cancelOrder(order.id)
    ElMessage.success('订单已取消')
    
    // 刷新订单列表
    fetchUserOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败，请稍后重试')
    }
  }
}

// 跳转到支付页面
const goToPay = (orderId) => {
  router.push(`/order/${orderId}/pay`)
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    'PENDING': '待付款',
    'PAID': '已付款',
    'SHIPPED': '已发货',
    'DELIVERED': '已送达',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态标签类型
const getOrderStatusType = (status) => {
  const typeMap = {
    'PENDING': 'warning',
    'PAID': 'primary',
    'SHIPPED': 'success',
    'DELIVERED': 'success',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  }
  return typeMap[status] || ''
}

// 返回首页
const goHome = () => {
  router.push('/')
}

onMounted(() => {
  fetchUserOrders()
})
</script>

<template>
  <div class="user-orders-container container">
    <div class="page-header">
      <h1>我的订单</h1>
      <el-button @click="goHome" plain>返回首页</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>
    
    <div v-else-if="orders.length === 0" class="empty-orders">
      <el-empty description="暂无订单">
        <el-button type="primary" @click="goHome">去购物</el-button>
      </el-empty>
    </div>
    
    <div v-else class="orders-list">
      <el-card v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号: {{ order.id }}</span>
            <span class="order-date">下单时间: {{ new Date(order.createdAt).toLocaleString() }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getOrderStatusType(order.status)">
              {{ getOrderStatusText(order.status) }}
            </el-tag>
          </div>
        </div>
        
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div class="item-image">
              <el-image :src="item.imgUrl || ''" fit="cover">
                <template #error>
                  <div class="image-placeholder">暂无图片</div>
                </template>
              </el-image>
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-price">¥{{ item.price.toFixed(2) }} × {{ item.quantity }}</div>
            </div>
            <div class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <span>订单总额: </span>
            <span class="total-amount">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
          
          <div class="order-actions">
            <el-button size="small" @click="viewOrderDetail(order.id)">查看详情</el-button>
            
            <template v-if="order.status === 'PENDING'">
              <el-button size="small" type="primary" @click="goToPay(order.id)">去支付</el-button>
              <el-button size="small" type="danger" @click="cancelOrder(order)">取消订单</el-button>
            </template>
            
            <template v-if="order.status === 'SHIPPED'">
              <el-button size="small" type="success">确认收货</el-button>
            </template>
            
            <template v-if="order.status === 'DELIVERED'">
              <el-button size="small" type="primary">评价订单</el-button>
            </template>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.user-orders-container {
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

.loading-container,
.empty-orders {
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.order-card {
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.order-info {
  display: flex;
  flex-direction: column;
}

.order-number {
  font-weight: 500;
  margin-bottom: 5px;
}

.order-date {
  color: #909399;
  font-size: 14px;
}

.order-items {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.item-image {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  overflow: hidden;
  border-radius: 4px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 12px;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  margin-bottom: 5px;
  font-size: 14px;
}

.item-price {
  color: #606266;
  font-size: 12px;
}

.item-total {
  font-weight: bold;
  color: #f56c6c;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
}

.order-total {
  font-size: 16px;
}

.total-amount {
  font-weight: bold;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .order-header,
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-status {
    margin-top: 10px;
  }
  
  .order-total {
    margin-bottom: 15px;
  }
  
  .order-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style> 