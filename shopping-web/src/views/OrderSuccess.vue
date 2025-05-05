<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import orderApi from '@/api/order'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const orderId = ref('')
const orderInfo = ref(null)

// 是否为订单成功页面（而非订单详情页面）
const isSuccessPage = computed(() => {
  return !!route.query.orderId
})

// 获取页面标题
const pageTitle = computed(() => {
  return isSuccessPage.value ? '订单提交成功' : '订单详情'
})

// 获取URL中的订单ID
const fetchOrderDetails = async () => {
  // 从query或params中获取订单ID
  orderId.value = route.query.orderId || route.params.id
  console.log('获取订单ID:', orderId.value, '路由信息:', route.fullPath)
  
  if (!orderId.value) {
    console.error('订单ID不存在')
    ElMessage.error('订单ID不存在')
    router.push('/')
    return
  }
  
  loading.value = true
  try {
    console.log('开始获取订单详情，订单ID:', orderId.value)
    const result = await orderApi.getOrder(orderId.value)
    console.log('API返回订单详情:', result)
    
    if (!result) {
      console.warn('获取到空的订单详情')
      ElMessage.warning('未找到订单信息')
      orderInfo.value = null
      return
    }
    
    orderInfo.value = result
    console.log('处理后的订单信息:', orderInfo.value)
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败，请稍后重试')
    orderInfo.value = null
  } finally {
    loading.value = false
  }
}

// 跳转到我的订单页面
const goToMyOrders = () => {
  router.push('/user/orders')
}

// 继续购物
const continueShopping = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchOrderDetails()
})
</script>

<template>
  <div class="order-success-container container">
    <div class="page-header" v-if="!isSuccessPage">
      <h1>{{ pageTitle }}</h1>
      <el-button @click="goBack" plain>返回</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>
    
    <div v-else class="success-content">
      <el-result
        :icon="isSuccessPage ? 'success' : 'info'"
        :title="pageTitle"
        :sub-title="`订单号: ${orderId}`"
      >
        <template #extra>
          <div class="order-summary" v-if="orderInfo">
            <h3>订单摘要</h3>
            <div class="summary-item">
              <span>订单状态:</span>
              <span>
                <el-tag :type="orderInfo.status === 'COMPLETED' ? 'success' : 
                         orderInfo.status === 'CANCELLED' ? 'info' : 
                         orderInfo.status === 'PENDING' ? 'warning' : 'primary'">
                  {{ orderInfo.status === 'PENDING' ? '待付款' : 
                     orderInfo.status === 'PAID' ? '已付款' : 
                     orderInfo.status === 'SHIPPED' ? '已发货' : 
                     orderInfo.status === 'DELIVERED' ? '已送达' : 
                     orderInfo.status === 'COMPLETED' ? '已完成' : 
                     orderInfo.status === 'CANCELLED' ? '已取消' : '未知状态' }}
                </el-tag>
              </span>
            </div>
            <div class="summary-item">
              <span>下单时间:</span>
              <span>{{ orderInfo.createdAt ? new Date(orderInfo.createdAt).toLocaleString() : '未知' }}</span>
            </div>
            <div class="summary-item">
              <span>收货人:</span>
              <span>{{ orderInfo.recipientName || '未知' }}</span>
            </div>
            <div class="summary-item">
              <span>联系电话:</span>
              <span>{{ orderInfo.phoneNumber || '未知' }}</span>
            </div>
            <div class="summary-item">
              <span>收货地址:</span>
              <span>{{ orderInfo.address || '未知' }}</span>
            </div>
            <div class="summary-item">
              <span>支付方式:</span>
              <span>{{ orderInfo.paymentMethod === 'ALIPAY' ? '支付宝' : 
                      orderInfo.paymentMethod === 'WECHAT' ? '微信支付' : 
                      orderInfo.paymentMethod === 'CREDIT_CARD' ? '信用卡' : 
                      orderInfo.paymentMethod === 'COD' ? '货到付款' : '未知' }}</span>
            </div>
            <div class="summary-item">
              <span>配送方式:</span>
              <span>{{ orderInfo.deliveryMethod === 'EXPRESS' ? '快递 (2-3天)' : 
                      orderInfo.deliveryMethod === 'STANDARD' ? '标准配送 (3-5天)' : 
                      orderInfo.deliveryMethod === 'SLOW' ? '慢递 (5-7天)' : '未知' }}</span>
            </div>
            
            <div class="order-items" v-if="orderInfo.items && orderInfo.items.length > 0">
              <h4>订单商品</h4>
              <div v-for="item in orderInfo.items" :key="item.id" class="order-item">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-price">¥{{ item.price.toFixed(2) }} × {{ item.quantity }}</span>
                <span class="item-subtotal">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="summary-item total">
              <span>订单总计:</span>
              <span>¥{{ orderInfo.totalAmount?.toFixed(2) || '0.00' }}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <template v-if="isSuccessPage">
              <el-button type="primary" @click="goToMyOrders">查看我的订单</el-button>
              <el-button @click="continueShopping">继续购物</el-button>
            </template>
            <template v-else>
              <el-button type="primary" @click="goToMyOrders">返回订单列表</el-button>
              <el-button @click="continueShopping">继续购物</el-button>
            </template>
          </div>
        </template>
      </el-result>
    </div>
  </div>
</template>

<style scoped>
.order-success-container {
  padding: 40px 20px;
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
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.success-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.order-summary {
  width: 100%;
  max-width: 500px;
  margin: 0 auto 30px auto;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #f5f7fa;
}

.order-summary h3 {
  text-align: center;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-item.total {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  font-weight: bold;
  font-size: 16px;
  color: #f56c6c;
}

.order-items {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.order-items h4 {
  margin: 0 0 10px 0;
  font-size: 15px;
  font-weight: 500;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.item-name {
  flex: 2;
}

.item-price {
  flex: 1;
  text-align: center;
}

.item-subtotal {
  flex: 1;
  text-align: right;
  font-weight: 500;
  color: #f56c6c;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

@media (max-width: 768px) {
  .order-summary {
    padding: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .el-button {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style> 