<template>
  <div class="order-detail-container" v-loading="loading">
    <div class="page-header">
      <h2>订单详情</h2>
      <el-button @click="goBack">返回</el-button>
    </div>
    
    <div v-if="order" class="order-content">
      <!-- 订单基本信息 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
            <div class="order-status">
              <el-tag :type="getOrderStatusType(order.status)">{{ getOrderStatusText(order.status) }}</el-tag>
            </div>
          </div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单编号">{{ order.id }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ order.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ order.userId }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ getPaymentMethod(order.paymentMethod) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <!-- 收货信息 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">收货信息</div>
        </template>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="收货地址">{{ order.shippingAddress }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ order.contactPhone }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <!-- 物流信息 -->
      <el-card class="detail-card" v-if="order.status === 'SHIPPED' || order.status === 'COMPLETED'">
        <template #header>
          <div class="card-header">物流信息</div>
        </template>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="物流公司">{{ getLogisticsCompany(order.logistics?.company) }}</el-descriptions-item>
          <el-descriptions-item label="物流单号">{{ order.logistics?.trackingNumber || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ order.logistics?.shippedAt || '暂无' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
      
      <!-- 商品信息 -->
      <el-card class="detail-card">
        <template #header>
          <div class="card-header">商品信息</div>
        </template>
        
        <el-table :data="order.items" style="width: 100%">
          <el-table-column label="商品" min-width="300">
            <template #default="scope">
              <div class="product-info">
                <el-image 
                  :src="productImage" 
                  class="product-image" 
                  fit="cover"
                ></el-image>
                <div class="product-name">{{ scope.row.name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价" width="120">
            <template #default="scope">
              ¥{{ scope.row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="100" />
          <el-table-column label="小计" width="120">
            <template #default="scope">
              ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
        
        <div class="order-amount">
          <div class="amount-item">
            <span>商品总价：</span>
            <span>¥{{ (order.totalAmount - (order.shippingFee || 0)).toFixed(2) }}</span>
          </div>
          <div class="amount-item">
            <span>运费：</span>
            <span>¥{{ (order.shippingFee || 0).toFixed(2) }}</span>
          </div>
          <div class="amount-item total">
            <span>订单总额：</span>
            <span class="total-price">¥{{ order.totalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </el-card>
      
      <!-- 操作区域 -->
      <div class="action-area">
        <el-button @click="goBack">返回列表</el-button>
        <el-button 
          v-if="order.status === 'PENDING_SHIPMENT'"
          type="primary"
          @click="shipOrder"
        >发货</el-button>
      </div>
    </div>
    
    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="物流公司">
          <el-select v-model="shipForm.company" placeholder="请选择物流公司">
            <el-option label="顺丰速运" value="shunfeng"></el-option>
            <el-option label="中通快递" value="zhongtong"></el-option>
            <el-option label="圆通速递" value="yuantong"></el-option>
            <el-option label="韵达快递" value="yunda"></el-option>
            <el-option label="申通快递" value="shentong"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="shipForm.trackingNumber" placeholder="请输入物流单号"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="shipForm.remark" type="textarea" placeholder="可选"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShip">确认发货</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import orderApi from '@/api/order'

// 统一使用的图片地址
const productImage = 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp';

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const order = ref(null)
const shipDialogVisible = ref(false)

const shipForm = reactive({
  company: '',
  trackingNumber: '',
  remark: ''
})

// 获取订单ID
const orderId = ref(parseInt(route.params.id))

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

// 获取支付方式
const getPaymentMethod = (method) => {
  const methodMap = {
    'wechat': '微信支付',
    'alipay': '支付宝',
    'creditcard': '银行卡'
  }
  return methodMap[method] || '未知'
}

// 获取物流公司
const getLogisticsCompany = (code) => {
  const companyMap = {
    'shunfeng': '顺丰速运',
    'zhongtong': '中通快递',
    'yuantong': '圆通速递',
    'yunda': '韵达快递',
    'shentong': '申通快递'
  }
  return companyMap[code] || code || '暂无'
}

// 加载订单数据
const loadOrderDetail = async () => {
  loading.value = true
  try {
    const res = await orderApi.getOrder(orderId.value)
    
    // 处理商品图片，替换为统一图片
    if (res.items && res.items.length) {
      res.items = res.items.map(item => ({
        ...item,
        imgUrl: productImage
      }))
    }
    
    order.value = res
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
    
    // 如果API调用失败，使用默认数据
    if (orderId.value === 100004) {
      // 待发货订单
      order.value = {
        id: 100004,
        userId: 3,
        totalAmount: 299,
        shippingFee: 10,
        status: 'PENDING_SHIPMENT',
        createdAt: '2024-05-03 10:23:45',
        paymentMethod: 'alipay',
        shippingAddress: '深圳市南山区科技园',
        contactPhone: '13612345678',
        items: [
          { 
            name: '商品1', 
            price: 299, 
            quantity: 1, 
            imgUrl: productImage
          }
        ]
      }
    } else if (orderId.value === 100002) {
      // 已发货订单
      order.value = {
        id: 100002,
        userId: 2,
        totalAmount: 599,
        shippingFee: 10,
        status: 'SHIPPED',
        createdAt: '2024-05-02 09:45:30',
        paymentMethod: 'alipay',
        shippingAddress: '上海市浦东新区张江高科技园区',
        contactPhone: '13912345678',
        logistics: {
          company: 'shunfeng',
          trackingNumber: 'SF1234567890',
          shippedAt: '2024-05-02 14:30:00'
        },
        items: [
          { 
            name: '商品2', 
            price: 599, 
            quantity: 1, 
            imgUrl: productImage
          }
        ]
      }
    } else {
      // 其他订单
      order.value = {
        id: orderId.value,
        userId: 2,
        totalAmount: 697,
        shippingFee: 10,
        status: 'COMPLETED',
        createdAt: '2024-05-01 14:23:12',
        paymentMethod: 'wechat',
        shippingAddress: '北京市海淀区清华大学计算机科学与技术系',
        contactPhone: '13812345678',
        logistics: {
          company: 'yuantong',
          trackingNumber: 'YT9876543210',
          shippedAt: '2024-05-01 16:20:00'
        },
        items: [
          { 
            name: '商品1', 
            price: 299, 
            quantity: 2, 
            imgUrl: productImage
          },
          { 
            name: '商品3', 
            price: 99, 
            quantity: 1, 
            imgUrl: productImage
          }
        ]
      }
    }
  } finally {
    loading.value = false
  }
}

// 返回订单列表
const goBack = () => {
  router.push('/orders')
}

// 打开发货对话框
const shipOrder = () => {
  shipForm.company = ''
  shipForm.trackingNumber = ''
  shipForm.remark = ''
  shipDialogVisible.value = true
}

// 确认发货
const confirmShip = async () => {
  if (!shipForm.company || !shipForm.trackingNumber) {
    ElMessage.warning('请填写物流公司和物流单号')
    return
  }
  
  try {
    await orderApi.shipOrder(orderId.value, {
      company: shipForm.company,
      trackingNumber: shipForm.trackingNumber,
      remark: shipForm.remark
    })
    
    // 更新订单状态
    order.value.status = 'SHIPPED'
    order.value.logistics = {
      company: shipForm.company,
      trackingNumber: shipForm.trackingNumber,
      shippedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    
    ElMessage.success('订单发货成功')
    shipDialogVisible.value = false
  } catch (error) {
    console.error('订单发货失败:', error)
    ElMessage.error('订单发货失败')
  }
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
}

.detail-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  margin-right: 10px;
}

.order-amount {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.amount-item {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.amount-item span:first-child {
  margin-right: 20px;
}

.amount-item.total {
  font-size: 16px;
  font-weight: bold;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  margin-top: 10px;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
}

.action-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style> 