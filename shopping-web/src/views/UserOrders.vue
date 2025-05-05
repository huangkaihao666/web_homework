<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import userApi from '@/api/user'
import orderApi from '@/api/order'
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'

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
    console.log('API返回订单数据:', JSON.stringify(result, null, 2))
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.warn('API返回订单数据不符合预期:', result)
      // 如果后端返回空数据，仍使用模拟数据，便于开发
      useMockData()
      return
    }
    
    // 确保每个订单项的totalAmount是数字
    orders.value = result.map(order => {
      // 详细输出订单数据格式，方便调试
      console.log('处理订单数据 ID:', order.id, '完整数据:', JSON.stringify(order, null, 2))
      
      // 处理订单项
      let processedItems = []
      if (Array.isArray(order.items)) {
        processedItems = order.items.map(item => {
          console.log('订单项原始数据:', JSON.stringify(item, null, 2))
          
          // 提取所有可能包含商品信息的字段，用于调试
          const possibleFields = {
            id: item.id, 
            productId: item.productId,
            name: item.name,
            productName: item.productName,
            product: item.product,
            price: item.price,
            quantity: item.quantity,
            imgUrl: item.imgUrl
          }
          console.log('可能的商品信息字段:', JSON.stringify(possibleFields, null, 2))
          
          // 处理不同格式的订单项
          const processedItem = {
            ...item,
            // 确保有商品名称 - 尝试所有可能的字段名
            name: item.name || 
                  item.productName || 
                  (item.product ? item.product.name : null) || 
                  `商品 ${item.productId || '未知'}`,
            // 确保价格为数字
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
            // 确保数量为数字
            quantity: typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1,
            // 确保有图片URL
            imgUrl: item.imgUrl || 
                    (item.product ? item.product.imgUrl : null) || 
                    'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
          }
          
          console.log('处理后的订单项:', processedItem)
          return processedItem
        })
      } else {
        console.warn('订单没有items数组或格式不正确:', order.id)
      }
      
      return {
        ...order,
        totalAmount: typeof order.totalAmount === 'number' ? 
                    order.totalAmount : 
                    parseFloat(order.totalAmount) || 0,
        items: processedItems
      }
    })
    
    // 按照创建时间倒序排序，最新的订单排在前面
    orders.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
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
  console.log('查看订单详情，ID:', orderId, '类型:', typeof orderId)
  
  // 订单ID可能是字符串格式，不再强制转换为数字
  if (!orderId) {
    console.error('无效的订单ID:', orderId)
    ElMessage.error('无效的订单ID')
    return
  }
  
  console.log('使用订单ID:', orderId)
  router.push(`/order/${orderId}`)
}

// 取消订单
const cancelOrder = async (order) => {
  console.log('准备取消订单，订单对象:', order)
  
  if (!order) {
    console.error('无效的订单对象: undefined或null')
    ElMessage.error('无效的订单')
    return
  }
  
  if (!order.id && order.id !== 0) {
    console.error('订单对象中没有ID:', order)
    ElMessage.error('订单缺少ID')
    return
  }
  
  // 获取订单ID，不强制转换为数字
  const orderId = order.id
  console.log('取消订单，ID:', orderId, '类型:', typeof orderId)
  
  if (order.status !== 'PENDING') {
    console.warn('尝试取消非待付款状态的订单:', order.status)
    ElMessage.warning('只能取消待付款的订单')
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
    
    loading.value = true
    console.log('用户确认取消订单，发送API请求，订单ID:', orderId)
    
    // 先使用模拟数据处理，避免API问题
    if (typeof orderId === 'number' && orderId >= 1001 && orderId <= 1010) {
      console.log('使用模拟数据处理取消订单')
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 直接更新当前列表中的订单状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index].status = 'CANCELLED'
        console.log('已更新本地订单状态为已取消')
        ElMessage.success('订单已成功取消')
      } else {
        console.warn('未找到要更新的订单')
        ElMessage.warning('订单状态更新失败')
      }
    } else {
      // 真实API调用
      console.log('发送取消订单API请求')
      const result = await orderApi.cancelOrder(orderId)
      console.log('取消订单API返回结果:', result)
      
      // 直接更新当前列表中的订单状态，避免重新加载整个列表
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index].status = 'CANCELLED'
        console.log('已更新本地订单状态为已取消')
      } else {
        console.warn('未找到要更新的订单')
      }
      
      ElMessage.success('订单已成功取消')
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了操作')
      return
    }
    
    console.error('取消订单失败:', error)
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误详情:', error.response.data)
    }
    
    ElMessage.error('取消订单失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 跳转到支付页面
const goToPay = async (orderId) => {
  console.log('准备支付订单，ID:', orderId, '类型:', typeof orderId)
  
  if (orderId === undefined || orderId === null || orderId === '') {
    console.error('无效的订单ID:', orderId)
    ElMessage.error('无效的订单ID')
    return
  }
  
  try {
    loading.value = true
    
    // 先使用模拟数据处理，避免API问题
    if (typeof orderId === 'number' && orderId >= 1001 && orderId <= 1010) {
      console.log('使用模拟数据处理支付')
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 创建模拟订单详情
      const orderDetail = {
        id: orderId,
        status: 'PENDING',
        totalAmount: 2000 + (orderId % 10) * 1000
      }
      console.log('模拟订单详情:', orderDetail)
      
      // 模拟支付过程
      const confirmed = await ElMessageBox.confirm(
        `订单金额: ¥${orderDetail.totalAmount.toFixed(2)}，确认支付吗？`,
        '支付订单',
        {
          confirmButtonText: '确认支付',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).catch(() => false)
      
      if (!confirmed) {
        console.log('用户取消了支付')
        return
      }
      
      console.log('用户确认支付，处理模拟支付')
      
      // 更新订单状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index].status = 'PAID'
        console.log('已更新本地订单状态为已支付')
        
        ElMessage.success('订单支付成功')
        
        // 显示支付成功信息
        await ElMessageBox.alert(
          '您的订单已支付成功，我们将尽快为您安排发货',
          '支付成功',
          {
            confirmButtonText: '确定',
            type: 'success'
          }
        )
      } else {
        console.warn('未找到要更新的订单')
        ElMessage.warning('订单状态更新失败')
      }
    } else {
      // 真实API调用
      console.log('获取订单详情，订单ID:', orderId)
      const orderDetail = await orderApi.getOrder(orderId)
      console.log('获取订单详情成功:', orderDetail)
      
      if (!orderDetail || !orderDetail.status) {
        console.error('获取到的订单详情无效:', orderDetail)
        ElMessage.error('订单信息获取失败')
        return
      }
      
      if (orderDetail.status !== 'PENDING') {
        console.warn('订单状态不是待付款:', orderDetail.status)
        ElMessage.warning('只能支付待付款状态的订单')
        return
      }
      
      // 模拟支付过程
      const confirmed = await ElMessageBox.confirm(
        `订单金额: ¥${orderDetail.totalAmount.toFixed(2)}，确认支付吗？`,
        '支付订单',
        {
          confirmButtonText: '确认支付',
          cancelButtonText: '取消',
          type: 'info'
        }
      ).catch(() => false)
      
      if (!confirmed) {
        console.log('用户取消了支付')
        return
      }
      
      console.log('用户确认支付，处理支付请求')
      const paymentData = {
        paymentMethod: 'ALIPAY',
        paymentTime: new Date().toISOString()
      }
      
      console.log('发送支付订单API请求')
      const result = await orderApi.payOrder(orderId, paymentData)
      console.log('支付订单成功:', result)
      
      // 直接更新当前列表中的订单状态
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index].status = 'PAID'
        console.log('已更新本地订单状态为已支付')
      } else {
        console.warn('未找到要更新的订单')
      }
      
      ElMessage.success('订单支付成功')
      
      // 显示支付成功信息
      await ElMessageBox.alert(
        '您的订单已支付成功，我们将尽快为您安排发货',
        '支付成功',
        {
          confirmButtonText: '确定',
          type: 'success'
        }
      )
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消了操作')
      return
    }
    
    console.error('支付订单失败:', error)
    if (error.message) {
      console.error('错误消息:', error.message)
    }
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误详情:', error.response.data)
    }
    
    ElMessage.error('支付订单失败，请稍后重试')
  } finally {
    loading.value = false
  }
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

// 使用模拟数据
const useMockData = () => {
  const currentDate = new Date()
  const yesterday = new Date(currentDate)
  yesterday.setDate(currentDate.getDate() - 1)
  const lastWeek = new Date(currentDate)
  lastWeek.setDate(currentDate.getDate() - 7)
  
  // 确保ID是数字类型
  orders.value = [
    {
      id: 1001, // 使用更简单的ID
      userId: 1,
      status: 'PENDING',
      createdAt: currentDate.toISOString(),
      totalAmount: 4999,
      items: [
        {
          id: 1,
          productId: 1,
          name: '智能手机',
          price: 3999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        },
        {
          id: 2,
          productId: 6,
          name: '智能音箱',
          price: 399,
          quantity: 2,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        },
        {
          id: 3,
          productId: 26,
          name: '瑜伽垫',
          price: 129,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        }
      ],
      recipientName: '张三',
      phoneNumber: '13800138000',
      address: '北京市朝阳区三里屯街道10号',
      zipCode: '100000',
      paymentMethod: 'ALIPAY',
      deliveryMethod: 'EXPRESS'
    },
    {
      id: 1002, // 使用更简单的ID
      userId: 1,
      status: 'PAID',
      createdAt: yesterday.toISOString(),
      totalAmount: 7299,
      items: [
        {
          id: 4,
          productId: 2,
          name: '笔记本电脑',
          price: 5999,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        },
        {
          id: 5,
          productId: 4,
          name: '无线耳机',
          price: 899,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        },
        {
          id: 6,
          productId: 22,
          name: '编程入门指南',
          price: 89,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        }
      ],
      recipientName: '李四',
      phoneNumber: '13900139000',
      address: '上海市浦东新区陆家嘴金融中心',
      zipCode: '200000',
      paymentMethod: 'WECHAT',
      deliveryMethod: 'STANDARD'
    },
    {
      id: 1003, // 使用更简单的ID
      userId: 1,
      status: 'SHIPPED',
      createdAt: lastWeek.toISOString(),
      totalAmount: 1795,
      items: [
        {
          id: 7,
          productId: 7,
          name: '男士休闲夹克',
          price: 299,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        },
        {
          id: 8,
          productId: 12,
          name: '棉质T恤',
          price: 99,
          quantity: 3,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        },
        {
          id: 9,
          productId: 10,
          name: '运动鞋',
          price: 499,
          quantity: 2,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        }
      ],
      recipientName: '王五',
      phoneNumber: '13700137000',
      address: '广州市天河区珠江新城',
      zipCode: '510000',
      paymentMethod: 'ALIPAY',
      deliveryMethod: 'EXPRESS'
    },
    {
      id: 1004, // 使用更简单的ID
      userId: 1,
      status: 'COMPLETED',
      createdAt: new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: 3197,
      items: [
        {
          id: 10,
          productId: 5,
          name: '平板电脑',
          price: 2599,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        },
        {
          id: 11,
          productId: 13,
          name: '智能床头灯',
          price: 159,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        },
        {
          id: 12,
          productId: 21,
          name: '烹饪食谱大全',
          price: 159,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        }
      ],
      recipientName: '赵六',
      phoneNumber: '13600136000',
      address: '深圳市南山区科技园',
      zipCode: '518000',
      paymentMethod: 'CREDIT_CARD',
      deliveryMethod: 'STANDARD'
    },
    {
      id: 1005, // 使用更简单的ID
      userId: 1,
      status: 'CANCELLED',
      createdAt: new Date(lastWeek.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: 599,
      items: [
        {
          id: 13,
          productId: 28,
          name: '户外帐篷',
          price: 599,
          quantity: 1,
          imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp'
        }
      ],
      recipientName: '张三',
      phoneNumber: '13800138000',
      address: '北京市朝阳区三里屯街道10号',
      zipCode: '100000',
      paymentMethod: 'ALIPAY',
      deliveryMethod: 'SLOW'
    }
  ]
  
  // 按照创建时间倒序排序，最新的订单排在前面
  orders.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  // 打印每个订单ID及其类型，用于调试
  orders.value.forEach(order => {
    console.log(`订单ID: ${order.id}, 类型: ${typeof order.id}, 创建时间: ${new Date(order.createdAt).toLocaleString()}`)
  })
  
  console.log('使用模拟订单数据:', orders.value)
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
        
        <!-- 订单商品列表 -->
        <div class="order-items">
          <div v-if="!order.items || order.items.length === 0" class="no-items">
            <el-empty description="订单中没有商品信息" :image-size="60"></el-empty>
          </div>
          
          <div v-else v-for="(item, index) in order.items" :key="index" class="order-item">
            <div class="item-image">
              <el-image :src="getProxyImageUrl(item.imgUrl) || DEFAULT_PRODUCT_IMAGE" fit="cover">
                <template #error>
                  <div class="image-placeholder">暂无图片</div>
                </template>
              </el-image>
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name || `商品 ${item.productId || index + 1}` }}</div>
              <div class="item-price">
                ¥{{ (typeof item.price === 'number' ? item.price : 0).toFixed(2) }} × 
                {{ (typeof item.quantity === 'number' ? item.quantity : 1) }}
              </div>
            </div>
            <div class="item-total">
              ¥{{ ((typeof item.price === 'number' ? item.price : 0) * 
                  (typeof item.quantity === 'number' ? item.quantity : 1)).toFixed(2) }}
            </div>
          </div>
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <span>订单总额: </span>
            <span class="total-amount">¥{{ (typeof order.totalAmount === 'number' ? order.totalAmount : 0).toFixed(2) }}</span>
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