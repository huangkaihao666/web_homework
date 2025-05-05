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
                  <el-image :src="getProxyImageUrl(item.imgUrl)" fit="cover" />
                </div>
                <div class="item-info">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-price">¥{{ item.price.toFixed(2) }} × {{ item.quantity }}</div>
                </div>
                <div class="item-total">¥{{ (item.price * item.quantity).toFixed(2) }}</div>
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
    return sum + (item.price * item.quantity)
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
    const result = await cartApi.getCartItems()
    cartItems.value = result || []
    
    if (cartItems.value.length === 0) {
      ElMessage.warning('购物车为空，无法结账')
      router.push('/cart')
    }
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
  try {
    const result = await userApi.getUserAddresses()
    addresses.value = result || []
    
    if (addresses.value.length > 0) {
      selectedAddress.value = addresses.value[0].id
      fillAddressForm(addresses.value[0])
    }
  } catch (error) {
    console.error('获取地址数据失败:', error)
    // 不显示错误，因为新用户可能没有地址
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
    const orderData = {
      userId: 1,
      items: cartItems.value.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
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
          router.push({
            path: '/order/success',
            query: { orderId: result.id }
          })
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
  loadCartItems()
  loadAddresses()
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