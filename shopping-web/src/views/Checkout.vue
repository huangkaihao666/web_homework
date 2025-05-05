<template>
  <div class="checkout-container container">
    <div class="page-header">
      <h1>结算页面</h1>
      <el-button @click="goBack" plain>返回购物车</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>
    
    <template v-else>
      <div class="checkout-main">
        <div class="checkout-form">
          <el-card class="address-card">
            <template #header>
              <div class="card-header">
                <h2>收货地址</h2>
              </div>
            </template>
            
            <div v-if="addresses.length > 0" class="saved-addresses">
              <el-select v-model="selectedAddress" @change="handleAddressChange" placeholder="选择已保存的地址" style="width: 100%">
                <el-option
                  v-for="addr in addresses"
                  :key="addr.id"
                  :label="`${addr.recipientName} - ${addr.province}${addr.city}${addr.address}`"
                  :value="addr.id"
                />
              </el-select>
            </div>
            
            <el-form :model="form" label-position="top">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="收件人">
                    <el-input v-model="form.recipientName" placeholder="请输入收件人姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系电话">
                    <el-input v-model="form.phoneNumber" placeholder="请输入联系电话" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="省份">
                    <el-input v-model="form.province" placeholder="请输入省份" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="城市">
                    <el-input v-model="form.city" placeholder="请输入城市" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="邮政编码">
                    <el-input v-model="form.zipCode" placeholder="请输入邮政编码" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="详细地址">
                <el-input v-model="form.address" placeholder="请输入详细地址" />
              </el-form-item>
            </el-form>
          </el-card>
          
          <el-card class="delivery-card">
            <template #header>
              <div class="card-header">
                <h2>配送方式</h2>
              </div>
            </template>
            
            <div class="delivery-options">
              <el-radio-group v-model="form.deliveryMethod">
                <el-radio v-for="method in deliveryMethods" :key="method.value" :label="method.value" border>
                  <div class="delivery-option">
                    <span>{{ method.label }}</span>
                    <span class="delivery-price">¥{{ method.price.toFixed(2) }}</span>
                  </div>
                </el-radio>
              </el-radio-group>
            </div>
          </el-card>
          
          <el-card class="payment-card">
            <template #header>
              <div class="card-header">
                <h2>支付方式</h2>
              </div>
            </template>
            
            <div class="payment-options">
              <el-radio-group v-model="form.paymentMethod">
                <el-radio v-for="method in paymentMethods" :key="method.value" :label="method.value" border>
                  {{ method.label }}
                </el-radio>
              </el-radio-group>
            </div>
          </el-card>
        </div>
        
        <div class="checkout-summary">
          <el-card class="summary-card">
            <template #header>
              <div class="card-header">
                <h2>订单摘要</h2>
              </div>
            </template>
            
            <div class="cart-items">
              <div v-for="item in cartItems" :key="item.id" class="cart-item">
                <div class="item-image">
                  <el-image :src="getProxyImageUrl(item.product.imgUrl)" fit="cover" />
                </div>
                <div class="item-info">
                  <div class="item-name">{{ item.product.name }}</div>
                  <div class="item-price">¥{{ item.product.price.toFixed(2) }} × {{ item.quantity }}</div>
                </div>
                <div class="item-total">¥{{ (item.product.price * item.quantity).toFixed(2) }}</div>
              </div>
            </div>
            
            <div class="price-summary">
              <div class="price-row">
                <span>商品总计</span>
                <span>¥{{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="price-row">
                <span>配送费</span>
                <span>¥{{ deliveryFee.toFixed(2) }}</span>
              </div>
              <div class="price-row total">
                <span>订单总计</span>
                <span>¥{{ total.toFixed(2) }}</span>
              </div>
            </div>
            
            <div class="submit-order">
              <el-button type="danger" size="large" @click="submitOrder" :loading="submitting" style="width: 100%">
                提交订单
              </el-button>
            </div>
          </el-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProxyImageUrl } from '@/utils/image'
import cartApi from '@/api/cart'
import userApi from '@/api/user'
import orderApi from '@/api/order'

const router = useRouter()
const loading = ref(true)
const submitting = ref(false)
const cartItems = ref([])
const addresses = ref([])
const selectedAddress = ref('')

// 表单数据
const form = reactive({
  recipientName: '',
  phoneNumber: '',
  address: '',
  city: '',
  province: '',
  zipCode: '',
  paymentMethod: 'ALIPAY',
  deliveryMethod: 'STANDARD'
})

// 支付方式
const paymentMethods = [
  { value: 'ALIPAY', label: '支付宝' },
  { value: 'WECHAT', label: '微信支付' },
  { value: 'CREDIT_CARD', label: '信用卡' },
  { value: 'COD', label: '货到付款' }
]

// 配送方式
const deliveryMethods = [
  { value: 'EXPRESS', label: '快递 (2-3天)', price: 20 },
  { value: 'STANDARD', label: '标准配送 (3-5天)', price: 10 },
  { value: 'SLOW', label: '慢递 (5-7天)', price: 0 }
]

// 获取送货方式价格
const getDeliveryPrice = (method) => {
  const delivery = deliveryMethods.find(d => d.value === method)
  return delivery ? delivery.price : 0
}

// 商品总价
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity)
  }, 0)
})

// 配送费
const deliveryFee = computed(() => {
  return getDeliveryPrice(form.deliveryMethod)
})

// 订单总价
const total = computed(() => {
  return subtotal.value + deliveryFee.value
})

// 加载购物车数据
const loadCartItems = async () => {
  loading.value = true
  try {
    console.log('开始获取购物车数据')
    const result = await cartApi.getCartItems()
    console.log('购物车API返回数据:', result)
    
    if (!result || !Array.isArray(result)) {
      console.error('购物车API返回格式错误:', result)
      ElMessage.error('获取购物车数据失败，返回格式错误')
      router.push('/cart')
      return
    }
    
    // 只处理选中的商品
    const selectedItems = localStorage.getItem('selectedCartItems')
    let filteredItems = []
    
    if (selectedItems) {
      try {
        const parsedItems = JSON.parse(selectedItems)
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          console.log('从localStorage获取到选中的商品:', parsedItems)
          // 过滤获取到的选中商品
          filteredItems = result.filter(item => parsedItems.includes(item.id))
        } else {
          console.warn('从localStorage获取到的选中商品无效:', parsedItems)
          // 如果没有选中的商品，默认使用全部数据
          filteredItems = result
        }
      } catch (error) {
        console.error('解析选中商品失败:', error)
        filteredItems = result
      }
    } else {
      console.log('没有找到选中的商品，使用所有购物车商品')
      filteredItems = result
    }
    
    // 如果过滤后没有商品，回到购物车页面
    if (filteredItems.length === 0) {
      console.warn('购物车为空或没有选中商品')
      ElMessage.warning('购物车为空或没有选中任何商品，请先选择商品')
      router.push('/cart')
      return
    }
    
    console.log('准备结算的商品数据:', filteredItems)
    cartItems.value = filteredItems
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    ElMessage.error('获取购物车数据失败，请稍后重试')
    router.push('/cart')
  } finally {
    loading.value = false
  }
}

// 加载用户地址
const loadAddresses = async () => {
  // 首先获取用户ID，确保它是有效的
  const userInfo = localStorage.getItem('userInfo')
  let userId = null
  let hasValidUser = false
  
  if (userInfo) {
    try {
      const parsedUserInfo = JSON.parse(userInfo)
      if (parsedUserInfo && parsedUserInfo.id) {
        userId = parseInt(parsedUserInfo.id)
        if (!isNaN(userId) && userId > 0) {
          hasValidUser = true
          console.log('获取地址时使用的用户ID:', userId)
        } else {
          console.error('用户ID无效:', userId)
        }
      }
    } catch (error) {
      console.error('解析用户信息失败:', error)
    }
  }
  
  if (!hasValidUser) {
    console.log('用户未登录或ID无效，不加载地址数据，使用默认空地址')
    addresses.value = []
    return
  }
  
  try {
    console.log('开始获取用户地址数据')
    const result = await userApi.getUserAddresses()
    console.log('地址API返回数据:', result)
    
    if (result && Array.isArray(result)) {
      addresses.value = result
      
      if (addresses.value.length > 0) {
        selectedAddress.value = addresses.value[0].id
        fillAddressForm(addresses.value[0])
      } else {
        console.log('用户没有保存的地址')
      }
    } else {
      console.warn('地址API返回格式错误或空数据:', result)
      addresses.value = []
    }
  } catch (error) {
    console.error('获取地址数据失败:', error)
    addresses.value = []
    // 不显示错误消息，因为新用户可能没有地址，这是正常情况
  }
}

// 填充地址表单
const fillAddressForm = (address) => {
  form.recipientName = address.recipientName
  form.phoneNumber = address.phoneNumber
  form.address = address.address
  form.city = address.city
  form.province = address.province
  form.zipCode = address.zipCode
}

// 选择地址
const handleAddressChange = () => {
  const address = addresses.value.find(a => a.id === selectedAddress.value)
  if (address) {
    fillAddressForm(address)
  }
}

// 提交订单
const submitOrder = async () => {
  if (!validateForm()) {
    return
  }
  
  submitting.value = true
  
  try {
    // 获取本地存储的用户信息
    const userInfo = localStorage.getItem('userInfo')
    let userId = 1 // 默认用户ID

    // 如果存在用户信息，尝试解析并获取用户ID
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo)
        if (parsedUserInfo && parsedUserInfo.id) {
          userId = parseInt(parsedUserInfo.id)
          console.log('从localStorage获取到用户ID:', userId)
        }
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    } else {
      console.log('未找到用户信息，使用默认用户ID:', userId)
    }

    // 验证用户ID是否为有效数字
    if (isNaN(userId) || userId <= 0) {
      console.error('无效的用户ID:', userId)
      ElMessage.error('无效的用户ID，请重新登录')
      return
    }
    
    // 检查商品数据是否有效
    if (!cartItems.value || cartItems.value.length === 0) {
      console.error('没有商品数据，无法提交订单')
      ElMessage.error('购物车数据缺失，请返回购物车重新选择商品')
      return
    }
    
    // 确保每个商品都有productId和quantity
    const orderItems = cartItems.value.map(item => {
      // 如果商品数据中有product对象，使用product.id作为productId
      if (item.product && item.product.id) {
        return {
          productId: item.product.id,
          quantity: item.quantity
        }
      }
      
      // 否则尝试直接使用item中的productId
      if (item.productId) {
        return {
          productId: item.productId,
          quantity: item.quantity
        }
      }
      
      // 最后尝试使用item.id作为productId
      return {
        productId: item.id,
        quantity: item.quantity
      }
    })
    
    const orderData = {
      userId: userId,
      items: orderItems,
      recipientName: form.recipientName,
      phoneNumber: form.phoneNumber,
      address: `${form.province} ${form.city} ${form.address}`,
      zipCode: form.zipCode,
      paymentMethod: form.paymentMethod,
      deliveryMethod: form.deliveryMethod
    }
    
    console.log('提交订单数据:', orderData)
    const result = await orderApi.createOrder(orderData)
    console.log('订单创建成功:', result)
    
    // 清空购物车
    await cartApi.clearCart()
    
    // 显示成功消息
    ElMessageBox.alert(
      '您的订单已提交成功，我们将尽快为您处理',
      '订单提交成功',
      {
        confirmButtonText: '确定',
        type: 'success',
        callback: () => {
          console.log('订单创建结果:', result)
          // 确保有订单ID
          if (result && result.id) {
            console.log('跳转到订单成功页面，订单ID:', result.id)
            router.push({
              path: '/order/success',
              query: { orderId: result.id }
            })
          } else {
            console.error('创建订单成功但没有返回订单ID')
            router.push('/user/orders')
          }
        }
      }
    )
  } catch (error) {
    console.error('提交订单失败:', error)
    ElMessage.error('提交订单失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 表单验证
const validateForm = () => {
  if (!form.recipientName) {
    ElMessage.warning('请输入收件人姓名')
    return false
  }
  
  if (!form.phoneNumber) {
    ElMessage.warning('请输入联系电话')
    return false
  }
  
  if (!form.address || !form.city || !form.province) {
    ElMessage.warning('请输入完整的收货地址')
    return false
  }
  
  if (!form.zipCode) {
    ElMessage.warning('请输入邮政编码')
    return false
  }
  
  return true
}

// 返回购物车
const goBack = () => {
  router.push('/cart')
}

onMounted(() => {
  // 获取本地存储的商品详情
  const selectedItemsDetail = localStorage.getItem('selectedCartItemsDetail')
  
  if (!selectedItemsDetail) {
    console.warn('没有找到选中的商品详情，尝试获取ID')
    
    // 兼容旧版本，尝试使用ID列表
    const selectedItems = localStorage.getItem('selectedCartItems')
    if (!selectedItems) {
      console.warn('也没有找到选中的商品ID，返回购物车页面')
      ElMessage.warning('未选择任何商品，请先在购物车选择要结算的商品')
      router.push('/cart')
      return
    }
    
    // 如果只有ID但没有详情，使用API获取
    loadCartItems()
    return
  }
  
  try {
    // 直接使用本地存储的完整商品详情
    console.log('从本地存储获取商品详情')
    const selectedItems = JSON.parse(selectedItemsDetail)
    
    if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
      console.warn('选中的商品详情无效或为空')
      ElMessage.warning('购物车数据不完整，请返回购物车重新选择商品')
      router.push('/cart')
      return
    }
    
    console.log('结算的商品详情:', selectedItems)
    cartItems.value = selectedItems
    loading.value = false
    
    // 加载用户地址
    loadAddresses()
  } catch (error) {
    console.error('处理购物车数据出错:', error)
    ElMessage.error('加载购物车数据失败')
    router.push('/cart')
  }
})
</script>

<style scoped>
.checkout-container {
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
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.checkout-main {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkout-form {
  flex: 2;
  min-width: 300px;
}

.checkout-summary {
  flex: 1;
  min-width: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.address-card,
.delivery-card,
.payment-card {
  margin-bottom: 20px;
}

.saved-addresses {
  margin-bottom: 20px;
}

.delivery-options,
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.delivery-option {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.delivery-price {
  font-weight: bold;
  color: #f56c6c;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  margin-right: 10px;
  overflow: hidden;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.price-summary {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price-row.total {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
  margin-top: 10px;
}

.submit-order {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .checkout-main {
    flex-direction: column-reverse;
  }
}
</style> 