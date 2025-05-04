<template>
  <div class="checkout-container">
    <h1>订单结算</h1>
    
    <el-steps :active="activeStep" finish-status="success" class="checkout-steps">
      <el-step title="确认订单"></el-step>
      <el-step title="填写地址"></el-step>
      <el-step title="支付"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    
    <!-- 第一步：确认订单 -->
    <div v-if="activeStep === 0" class="checkout-step">
      <h2>确认商品信息</h2>
      <el-table :data="selectedItems" style="width: 100%">
        <el-table-column label="商品" width="400">
          <template #default="scope">
            <div class="product-info">
              <el-image :src="scope.row.imgUrl" class="product-image"></el-image>
              <div class="product-details">
                <div class="product-name">{{ scope.row.name }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="单价" width="150">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price.toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="数量" width="150">
          <template #default="scope">
            <span>x {{ scope.row.quantity }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="小计">
          <template #default="scope">
            <span class="subtotal">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="order-summary">
        <div class="summary-item">
          <span>商品总价：</span>
          <span class="price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span>运费：</span>
          <span class="price">¥{{ shippingFee.toFixed(2) }}</span>
        </div>
        <div class="summary-item total">
          <span>应付总额：</span>
          <span class="total-price">¥{{ (totalPrice + shippingFee).toFixed(2) }}</span>
        </div>
      </div>
      
      <div class="step-actions">
        <el-button @click="$router.push('/cart')">返回购物车</el-button>
        <el-button type="primary" @click="nextStep">下一步</el-button>
      </div>
    </div>
    
    <!-- 第二步：填写地址 -->
    <div v-if="activeStep === 1" class="checkout-step">
      <h2>收货地址</h2>
      
      <div v-if="addresses.length > 0" class="address-list">
        <el-radio-group v-model="selectedAddressId">
          <div v-for="address in addresses" :key="address.id" class="address-item">
            <el-radio :label="address.id">
              <div class="address-content">
                <div class="address-info">
                  <p><strong>{{ address.name }}</strong> {{ address.phone }}</p>
                  <p>{{ address.province }} {{ address.city }} {{ address.district }}</p>
                  <p>{{ address.detail }}</p>
                </div>
                <div class="address-actions">
                  <el-button type="text" @click.stop="editAddress(address)">编辑</el-button>
                  <el-button type="text" @click.stop="deleteAddress(address.id)">删除</el-button>
                </div>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      
      <div class="add-address">
        <el-button type="primary" plain @click="showAddressForm = true">添加新地址</el-button>
      </div>
      
      <el-dialog v-model="showAddressForm" title="收货地址" width="600px">
        <el-form :model="addressForm" label-width="120px">
          <el-form-item label="收货人">
            <el-input v-model="addressForm.name" placeholder="请输入收货人姓名"></el-input>
          </el-form-item>
          <el-form-item label="手机号码">
            <el-input v-model="addressForm.phone" placeholder="请输入手机号码"></el-input>
          </el-form-item>
          <el-form-item label="所在地区">
            <el-select v-model="addressForm.province" placeholder="省" style="width: 120px">
              <el-option label="北京市" value="北京市"></el-option>
              <el-option label="上海市" value="上海市"></el-option>
              <el-option label="广东省" value="广东省"></el-option>
            </el-select>
            <el-select v-model="addressForm.city" placeholder="市" style="width: 120px; margin-left: 10px">
              <el-option label="北京市" value="北京市"></el-option>
              <el-option label="上海市" value="上海市"></el-option>
              <el-option label="广州市" value="广州市"></el-option>
              <el-option label="深圳市" value="深圳市"></el-option>
            </el-select>
            <el-select v-model="addressForm.district" placeholder="区/县" style="width: 120px; margin-left: 10px">
              <el-option label="海淀区" value="海淀区"></el-option>
              <el-option label="朝阳区" value="朝阳区"></el-option>
              <el-option label="浦东新区" value="浦东新区"></el-option>
              <el-option label="天河区" value="天河区"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input v-model="addressForm.detail" type="textarea" placeholder="请输入详细地址"></el-input>
          </el-form-item>
          <el-form-item label="设为默认地址">
            <el-switch v-model="addressForm.isDefault"></el-switch>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showAddressForm = false">取消</el-button>
            <el-button type="primary" @click="saveAddress">保存</el-button>
          </span>
        </template>
      </el-dialog>
      
      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="nextStep" :disabled="!selectedAddressId">下一步</el-button>
      </div>
    </div>
    
    <!-- 第三步：支付 -->
    <div v-if="activeStep === 2" class="checkout-step">
      <h2>选择支付方式</h2>
      
      <div class="payment-methods">
        <el-radio-group v-model="paymentMethod">
          <div class="payment-method-item">
            <el-radio label="wechat">
              <div class="payment-method-content">
                <img src="https://via.placeholder.com/40x40?text=WeChat" alt="微信支付" />
                <span>微信支付</span>
              </div>
            </el-radio>
          </div>
          <div class="payment-method-item">
            <el-radio label="alipay">
              <div class="payment-method-content">
                <img src="https://via.placeholder.com/40x40?text=Alipay" alt="支付宝" />
                <span>支付宝</span>
              </div>
            </el-radio>
          </div>
          <div class="payment-method-item">
            <el-radio label="creditcard">
              <div class="payment-method-content">
                <img src="https://via.placeholder.com/40x40?text=Card" alt="银行卡" />
                <span>银行卡</span>
              </div>
            </el-radio>
          </div>
        </el-radio-group>
      </div>
      
      <div class="payment-summary">
        <div class="summary-item total">
          <span>应付总额：</span>
          <span class="total-price">¥{{ (totalPrice + shippingFee).toFixed(2) }}</span>
        </div>
      </div>
      
      <div class="step-actions">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" @click="submitOrder" :disabled="!paymentMethod">提交订单</el-button>
      </div>
    </div>
    
    <!-- 第四步：完成 -->
    <div v-if="activeStep === 3" class="checkout-step">
      <div class="order-success">
        <el-result
          icon="success"
          title="订单提交成功"
          :sub-title="`订单号: ${orderId}`"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/orders')">查看订单</el-button>
            <el-button @click="$router.push('/')">继续购物</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeStep = ref(0)
const selectedItems = ref([])
const totalPrice = ref(0)
const shippingFee = ref(10)
const addresses = ref([])
const selectedAddressId = ref(null)
const showAddressForm = ref(false)
const paymentMethod = ref('wechat')
const orderId = ref('')

const addressForm = ref({
  id: null,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

// 加载选中的商品
const loadSelectedItems = () => {
  // 实际应用中应该从API获取已选中的购物车商品
  // 模拟数据
  selectedItems.value = [
    { 
      id: 1, 
      name: '商品1', 
      price: 299, 
      quantity: 2, 
      imgUrl: 'https://via.placeholder.com/100x100?text=Product+1'
    },
    { 
      id: 2, 
      name: '商品2', 
      price: 599, 
      quantity: 1, 
      imgUrl: 'https://via.placeholder.com/100x100?text=Product+2'
    }
  ]
  
  // 计算总价
  totalPrice.value = selectedItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

// 加载地址
const loadAddresses = () => {
  // 实际应用中应该从API获取用户地址
  // 模拟数据
  addresses.value = [
    { 
      id: 1, 
      name: '张三', 
      phone: '13812345678', 
      province: '北京市', 
      city: '北京市', 
      district: '海淀区', 
      detail: '清华大学计算机科学与技术系', 
      isDefault: true 
    },
    { 
      id: 2, 
      name: '李四', 
      phone: '13912345678', 
      province: '上海市', 
      city: '上海市', 
      district: '浦东新区', 
      detail: '张江高科技园区', 
      isDefault: false 
    }
  ]
  
  // 选择默认地址
  const defaultAddress = addresses.value.find(addr => addr.isDefault)
  if (defaultAddress) {
    selectedAddressId.value = defaultAddress.id
  } else if (addresses.value.length > 0) {
    selectedAddressId.value = addresses.value[0].id
  }
}

// 下一步
const nextStep = () => {
  if (activeStep.value < 3) {
    if (activeStep.value === 1 && !selectedAddressId.value) {
      ElMessage.warning('请选择收货地址')
      return
    }
    activeStep.value++
  }
}

// 上一步
const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}

// 编辑地址
const editAddress = (address) => {
  addressForm.value = { ...address }
  showAddressForm.value = true
}

// 删除地址
const deleteAddress = (id) => {
  addresses.value = addresses.value.filter(addr => addr.id !== id)
  if (selectedAddressId.value === id) {
    selectedAddressId.value = addresses.value.length > 0 ? addresses.value[0].id : null
  }
}

// 保存地址
const saveAddress = () => {
  if (!addressForm.value.name || !addressForm.value.phone || !addressForm.value.detail) {
    ElMessage.warning('请填写完整的地址信息')
    return
  }
  
  if (addressForm.value.id) {
    // 更新已有地址
    const index = addresses.value.findIndex(addr => addr.id === addressForm.value.id)
    if (index !== -1) {
      addresses.value[index] = { ...addressForm.value }
    }
  } else {
    // 添加新地址
    const newId = addresses.value.length > 0 
      ? Math.max(...addresses.value.map(addr => addr.id)) + 1 
      : 1
    addresses.value.push({ ...addressForm.value, id: newId })
    selectedAddressId.value = newId
  }
  
  // 处理默认地址
  if (addressForm.value.isDefault) {
    addresses.value.forEach(addr => {
      if (addr.id !== addressForm.value.id) {
        addr.isDefault = false
      }
    })
  }
  
  showAddressForm.value = false
  
  // 重置表单
  addressForm.value = {
    id: null,
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  }
}

// 提交订单
const submitOrder = () => {
  // 实际应用中应该调用API提交订单
  // 模拟提交订单并获取订单号
  setTimeout(() => {
    orderId.value = `ORDER${Date.now().toString().substring(5)}`
    activeStep.value = 3
    ElMessage.success('订单提交成功')
  }, 1000)
}

onMounted(() => {
  // 加载数据
  loadSelectedItems()
  loadAddresses()
})
</script>

<style scoped>
.checkout-container {
  padding: 20px 0;
}

.checkout-container h1 {
  margin-bottom: 30px;
}

.checkout-steps {
  margin-bottom: 40px;
}

.checkout-step {
  margin-bottom: 40px;
}

.checkout-step h2 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  margin-right: 15px;
}

.price, .subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.order-summary {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-item.total {
  font-size: 18px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
  margin-top: 10px;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}

.step-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
}

.address-list {
  margin-bottom: 20px;
}

.address-item {
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.address-item:hover {
  border-color: #409eff;
}

.address-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-info p {
  margin: 5px 0;
}

.add-address {
  margin: 20px 0;
}

.payment-methods {
  margin: 30px 0;
}

.payment-method-item {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.payment-method-content {
  display: flex;
  align-items: center;
}

.payment-method-content img {
  margin-right: 10px;
}

.order-success {
  padding: 50px 0;
}
</style> 