<template>
  <div class="orders-container">
    <h1>我的订单</h1>
    
    <div v-if="orders.length === 0" class="empty-orders">
      <el-empty description="暂无订单">
        <el-button type="primary" @click="$router.push('/')">去购物</el-button>
      </el-empty>
    </div>
    
    <div v-else class="orders-list">
      <!-- 订单列表过滤 -->
      <div class="filter-bar">
        <el-radio-group v-model="statusFilter" @change="filterOrders">
          <el-radio-button label="">全部订单</el-radio-button>
          <el-radio-button label="PENDING_PAYMENT">待付款</el-radio-button>
          <el-radio-button label="PENDING_SHIPMENT">待发货</el-radio-button>
          <el-radio-button label="SHIPPED">已发货</el-radio-button>
          <el-radio-button label="COMPLETED">已完成</el-radio-button>
          <el-radio-button label="CANCELLED">已取消</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 订单列表 -->
      <div v-for="order in filteredOrders" :key="order.id" class="order-item">
        <div class="order-header">
          <div class="order-meta">
            <span class="order-id">订单号：{{ order.id }}</span>
            <span class="order-time">下单时间：{{ order.createdAt }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getStatusTagType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
        </div>
        
        <div class="order-items">
          <div v-for="(item, index) in order.items" :key="index" class="order-product">
            <div class="product-info">
              <el-image :src="item.imgUrl" class="product-image"></el-image>
              <div class="product-details">
                <div class="product-name">{{ item.name }}</div>
                <div class="product-price">¥{{ item.price.toFixed(2) }} x {{ item.quantity }}</div>
              </div>
            </div>
            <div class="product-subtotal">
              ¥{{ (item.price * item.quantity).toFixed(2) }}
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-summary">
            <span>共 {{ getTotalItems(order) }} 件商品，总计：</span>
            <span class="total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
            <span class="shipping-info">(含运费：¥{{ order.shippingFee || 0 }})</span>
          </div>
          <div class="order-actions">
            <template v-if="order.status === 'PENDING_PAYMENT'">
              <el-button type="primary" size="small" @click="payOrder(order.id)">付款</el-button>
              <el-button type="danger" plain size="small" @click="cancelOrder(order.id)">取消订单</el-button>
            </template>
            <template v-else-if="order.status === 'SHIPPED'">
              <el-button type="success" size="small" @click="confirmReceipt(order.id)">确认收货</el-button>
              <el-button size="small" @click="viewLogistics(order.id)">查看物流</el-button>
            </template>
            <template v-else-if="order.status === 'COMPLETED'">
              <el-button type="primary" plain size="small" @click="reviewOrder(order.id)">评价</el-button>
              <el-button size="small" @click="buyAgain(order)">再次购买</el-button>
            </template>
            <el-button size="small" @click="viewOrderDetail(order.id)">订单详情</el-button>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalOrders"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>
    
    <!-- 订单详情弹窗 -->
    <el-dialog v-model="orderDetailVisible" title="订单详情" width="800px">
      <div v-if="currentOrder" class="order-detail">
        <h3>订单信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ currentOrder.id }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusTagType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ getPaymentMethod(currentOrder.paymentMethod) }}</el-descriptions-item>
        </el-descriptions>
        
        <h3>收货信息</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="收货人">{{ currentOrder.shippingAddress }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentOrder.contactPhone }}</el-descriptions-item>
        </el-descriptions>
        
        <h3>商品信息</h3>
        <el-table :data="currentOrder.items" style="width: 100%">
          <el-table-column label="商品">
            <template #default="scope">
              <div class="product-info">
                <el-image :src="scope.row.imgUrl" class="product-image-small"></el-image>
                <span>{{ scope.row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" prop="price" width="100">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="quantity" width="80" />
          <el-table-column label="小计" width="120">
            <template #default="scope">
              ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
        
        <div class="order-amount">
          <div class="amount-item">
            <span>商品总价：</span>
            <span>¥{{ (currentOrder.totalAmount - (currentOrder.shippingFee || 0)).toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span>运费：</span>
            <span>¥{{ (currentOrder.shippingFee || 0).toFixed(2) }}</span>
          </div>
          <div class="amount-item total">
            <span>实付款：</span>
            <span class="total-price">¥{{ currentOrder.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const orders = ref([])
const filteredOrders = ref([])
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(5)
const totalOrders = ref(0)
const orderDetailVisible = ref(false)
const currentOrder = ref(null)

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PENDING_PAYMENT': '待付款',
    'PENDING_SHIPMENT': '待发货',
    'SHIPPED': '已发货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    'PENDING_PAYMENT': 'warning',
    'PENDING_SHIPMENT': 'info',
    'SHIPPED': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  }
  return typeMap[status] || ''
}

// 获取支付方式
const getPaymentMethod = (method) => {
  const methodMap = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'creditcard': '银行卡'
  }
  return methodMap[method] || '未知'
}

// 计算订单商品总数
const getTotalItems = (order) => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

// 加载订单数据
const loadOrders = () => {
  // 实际应用中应该从API获取订单数据
  // 模拟订单数据
  orders.value = [
    {
      id: 'ORDER20240502001',
      createdAt: '2024-05-02 14:23:12',
      status: 'COMPLETED',
      totalAmount: 697,
      shippingFee: 10,
      paymentMethod: 'wechat',
      shippingAddress: '北京市海淀区清华大学计算机科学与技术系',
      contactPhone: '13812345678',
      items: [
        { 
          name: '商品1', 
          price: 299, 
          quantity: 2, 
          imgUrl: 'https://via.placeholder.com/100x100?text=Product+1' 
        },
        { 
          name: '商品3', 
          price: 99, 
          quantity: 1, 
          imgUrl: 'https://via.placeholder.com/100x100?text=Product+3' 
        }
      ]
    },
    {
      id: 'ORDER20240502002',
      createdAt: '2024-05-02 16:45:30',
      status: 'SHIPPED',
      totalAmount: 609,
      shippingFee: 10,
      paymentMethod: 'alipay',
      shippingAddress: '上海市浦东新区张江高科技园区',
      contactPhone: '13912345678',
      items: [
        { 
          name: '商品2', 
          price: 599, 
          quantity: 1, 
          imgUrl: 'https://via.placeholder.com/100x100?text=Product+2' 
        }
      ]
    },
    {
      id: 'ORDER20240502003',
      createdAt: '2024-05-02 18:12:08',
      status: 'PENDING_PAYMENT',
      totalAmount: 1007,
      shippingFee: 10,
      paymentMethod: '',
      shippingAddress: '广州市天河区',
      contactPhone: '13712345678',
      items: [
        { 
          name: '商品1', 
          price: 299, 
          quantity: 1, 
          imgUrl: 'https://via.placeholder.com/100x100?text=Product+1' 
        },
        { 
          name: '商品2', 
          price: 599, 
          quantity: 1, 
          imgUrl: 'https://via.placeholder.com/100x100?text=Product+2' 
        },
        { 
          name: '商品3', 
          price: 99, 
          quantity: 1, 
          imgUrl: 'https://via.placeholder.com/100x100?text=Product+3' 
        }
      ]
    }
  ]
  
  totalOrders.value = orders.value.length
  filterOrders()
}

// 过滤订单
const filterOrders = () => {
  if (!statusFilter.value) {
    filteredOrders.value = [...orders.value]
  } else {
    filteredOrders.value = orders.value.filter(order => order.status === statusFilter.value)
  }
}

// 页面变化
const handlePageChange = (page) => {
  currentPage.value = page
  // 在实际应用中，这里应该重新加载当前页的数据
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  const order = orders.value.find(o => o.id === orderId)
  if (order) {
    currentOrder.value = order
    orderDetailVisible.value = true
  }
}

// 支付订单
const payOrder = (orderId) => {
  ElMessage.success(`订单 ${orderId} 支付成功`)
  // 更新订单状态
  const index = orders.value.findIndex(o => o.id === orderId)
  if (index !== -1) {
    orders.value[index].status = 'PENDING_SHIPMENT'
    orders.value[index].paymentMethod = 'wechat' // 假设使用微信支付
    filterOrders()
  }
}

// 取消订单
const cancelOrder = (orderId) => {
  ElMessageBox.confirm(
    '确定要取消该订单吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 更新订单状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index].status = 'CANCELLED'
        filterOrders()
        ElMessage.success('订单已取消')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 确认收货
const confirmReceipt = (orderId) => {
  ElMessageBox.confirm(
    '确认已收到商品？',
    '提示',
    {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'info',
    }
  )
    .then(() => {
      // 更新订单状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index].status = 'COMPLETED'
        filterOrders()
        ElMessage.success('已确认收货')
      }
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 查看物流
const viewLogistics = (orderId) => {
  ElMessage.info(`查看订单 ${orderId} 的物流信息`)
  // 实际应用中应该打开物流详情弹窗
}

// 评价订单
const reviewOrder = (orderId) => {
  ElMessage.info(`评价订单 ${orderId}`)
  // 实际应用中应该打开评价弹窗
}

// 再次购买
const buyAgain = (order) => {
  ElMessage.success('已将商品添加到购物车')
  // 实际应用中应该将商品添加到购物车，然后跳转到购物车页面
  router.push('/cart')
}

onMounted(() => {
  // 加载订单数据
  loadOrders()
})
</script>

<style scoped>
.orders-container {
  padding: 20px 0;
}

.orders-container h1 {
  margin-bottom: 30px;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.filter-bar {
  margin-bottom: 20px;
}

.order-item {
  margin-bottom: 30px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.order-meta {
  display: flex;
  gap: 20px;
}

.order-id {
  font-weight: bold;
}

.order-items {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.order-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #ebeef5;
}

.order-product:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 15px;
}

.product-image-small {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-right: 10px;
}

.product-details {
  display: flex;
  flex-direction: column;
}

.product-name {
  margin-bottom: 10px;
}

.product-price {
  color: #909399;
  font-size: 14px;
}

.product-subtotal {
  font-weight: bold;
  color: #f56c6c;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
}

.order-summary {
  font-size: 14px;
}

.total-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.shipping-info {
  color: #909399;
  font-size: 12px;
  margin-left: 10px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.order-detail h3 {
  margin: 20px 0 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.order-amount {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.amount-item.total {
  font-size: 16px;
  font-weight: bold;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  margin-top: 10px;
}
</style> 