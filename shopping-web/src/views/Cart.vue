<template>
  <div class="cart-container">
    <div class="page-header">
      <h1>我的购物车</h1>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车是空的">
        <template #image>
          <el-icon :size="60"><ShoppingCart /></el-icon>
        </template>
        <el-button type="primary" @click="goToHome">去购物</el-button>
      </el-empty>
    </div>
    
    <div v-else class="cart-content">
      <!-- 购物车商品列表 -->
      <el-card class="cart-list">
        <template #header>
          <div class="cart-header">
            <el-checkbox
              v-model="selectAll"
              @change="handleSelectAllChange"
              :indeterminate="isIndeterminate"
            >
              全选
            </el-checkbox>
            <span class="selected-count">已选择 {{ selectedCount }} 件商品</span>
          </div>
        </template>
        
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <el-checkbox v-model="item.selected" @change="handleItemSelectChange"></el-checkbox>
          
          <div class="item-image">
            <el-image :src="productImage" fit="cover"></el-image>
          </div>
          
          <div class="item-info">
            <h3 class="item-name">{{ item.product.name }}</h3>
            <p class="item-specs" v-if="item.specs">
              <span v-for="(value, key) in item.specs" :key="key">
                {{ key }}: {{ value }}
              </span>
            </p>
          </div>
          
          <div class="item-price">
            ¥{{ item.product.price.toFixed(2) }}
          </div>
          
          <div class="item-quantity">
            <el-input-number 
              v-model="item.quantity" 
              :min="1" 
              :max="item.product.stock" 
              @change="handleQuantityChange(item)"
              size="small"
            ></el-input-number>
          </div>
          
          <div class="item-subtotal">
            ¥{{ (item.product.price * item.quantity).toFixed(2) }}
          </div>
          
          <div class="item-actions">
            <el-button type="danger" size="small" @click="removeItem(item.id)" :icon="Delete">删除</el-button>
          </div>
        </div>
      </el-card>
      
      <!-- 结算区域 -->
      <el-card class="cart-checkout">
        <div class="checkout-info">
          <div class="checkout-row">
            <span>商品总价:</span>
            <span class="price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="checkout-row">
            <span>优惠金额:</span>
            <span class="price discount">-¥{{ discount.toFixed(2) }}</span>
          </div>
          <div class="checkout-row">
            <span>运费:</span>
            <span class="price">¥{{ shipping.toFixed(2) }}</span>
          </div>
          <div class="checkout-row total">
            <span>实付金额:</span>
            <span class="price">¥{{ payableAmount.toFixed(2) }}</span>
          </div>
          
          <el-button 
            type="danger" 
            size="large" 
            class="checkout-button" 
            :disabled="selectedCount === 0"
            @click="checkout"
          >
            结算 ({{ selectedCount }}件)
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart, Delete } from '@element-plus/icons-vue'
import cartApi from '@/api/cart'

// 统一使用的图片地址
const productImage = 'https://gd-hbimg.huaban.com/1dfba91dd19657eb9d088e1be15e7319a46d5d6b8e0af-0vC9Ym_fw480webp';

const router = useRouter()
const loading = ref(true)
const cartItems = ref([])

// 加载购物车数据
const loadCartData = async () => {
  loading.value = true
  
  try {
    const res = await cartApi.getCartItems()
    
    // 替换所有商品图片为统一图片
    cartItems.value = res.data.map(item => ({
      ...item,
      selected: false, // 添加选择状态
      product: {
        ...item.product,
        image: productImage
      }
    }))
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    ElMessage.error('获取购物车数据失败')
    
    // 如果API调用失败，使用默认数据
    cartItems.value = [
      {
        id: 1,
        quantity: 2,
        selected: false,
        product: {
          id: 101,
          name: '高端智能手机',
          price: 4999,
          stock: 100,
          image: productImage
        },
        specs: {
          颜色: '深空黑',
          内存: '256GB'
        }
      },
      {
        id: 2,
        quantity: 1,
        selected: false,
        product: {
          id: 102,
          name: '超薄笔记本电脑',
          price: 6999,
          stock: 80,
          image: productImage
        },
        specs: {
          颜色: '银色',
          配置: 'i7/16GB/512GB'
        }
      },
      {
        id: 3,
        quantity: 3,
        selected: false,
        product: {
          id: 103,
          name: '有机新鲜水果',
          price: 99,
          stock: 50,
          image: productImage
        }
      }
    ]
  } finally {
    loading.value = false
  }
}

// 全选状态
const selectAll = ref(false)
const isIndeterminate = computed(() => {
  const selectedItems = cartItems.value.filter(item => item.selected)
  return selectedItems.length > 0 && selectedItems.length < cartItems.value.length
})

// 已选商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).reduce((sum, item) => sum + item.quantity, 0)
})

// 处理全选/全不选
const handleSelectAllChange = (val) => {
  cartItems.value.forEach(item => {
    item.selected = val
  })
}

// 处理单个商品选择状态变化
const handleItemSelectChange = () => {
  const allSelected = cartItems.value.every(item => item.selected)
  const someSelected = cartItems.value.some(item => item.selected)
  
  selectAll.value = allSelected
  isIndeterminate.value = someSelected && !allSelected
}

// 修改商品数量
const handleQuantityChange = async (item) => {
  try {
    await cartApi.updateCartItem(item.id, { quantity: item.quantity })
  } catch (error) {
    console.error('更新商品数量失败:', error)
    ElMessage.error('更新商品数量失败')
  }
}

// 移除商品
const removeItem = async (itemId) => {
  try {
    await ElMessageBox.confirm('确定要从购物车移除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cartApi.removeCartItem(itemId)
    cartItems.value = cartItems.value.filter(item => item.id !== itemId)
    ElMessage.success('商品已从购物车移除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除商品失败:', error)
      ElMessage.error('移除商品失败')
    }
  }
}

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

// 优惠金额
const discount = computed(() => {
  // 这里可以根据业务规则计算优惠，例如满减、折扣等
  // 模拟满300减30的优惠
  return totalPrice.value >= 300 ? 30 : 0
})

// 运费
const shipping = computed(() => {
  // 这里可以根据业务规则计算运费，例如满额包邮
  // 模拟满100免运费，否则收取10元运费
  return totalPrice.value >= 100 ? 0 : 10
})

// 实付金额
const payableAmount = computed(() => {
  return totalPrice.value - discount.value + shipping.value
})

// 去结算
const checkout = () => {
  // 检查是否有选中的商品
  if (selectedCount.value === 0) {
    ElMessage.warning('请至少选择一件商品')
    return
  }
  
  // 获取选中的商品ID列表
  const selectedItems = cartItems.value
    .filter(item => item.selected)
    .map(item => ({
      id: item.id,
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }))
  
  // 存储到本地，传递到结算页面
  localStorage.setItem('checkoutItems', JSON.stringify(selectedItems))
  
  // 跳转到结算页面
  router.push('/checkout')
}

// 跳转到首页
const goToHome = () => {
  router.push('/')
}

onMounted(() => {
  loadCartData()
})
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
}

.loading-container {
  padding: 20px;
}

.empty-cart {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-count {
  font-size: 14px;
  color: #666;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  margin: 0 15px;
}

.item-info {
  flex: 1;
  margin-right: 15px;
}

.item-name {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 500;
}

.item-specs {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.item-specs span {
  margin-right: 10px;
}

.item-price,
.item-subtotal {
  width: 120px;
  text-align: center;
  font-weight: 500;
}

.item-quantity {
  width: 120px;
  text-align: center;
}

.item-actions {
  width: 100px;
  text-align: center;
}

.cart-checkout {
  height: fit-content;
}

.checkout-info {
  padding: 10px 0;
}

.checkout-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.checkout-row.total {
  margin-top: 20px;
  font-size: 18px;
  font-weight: 600;
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.price {
  font-weight: 500;
}

.discount {
  color: #f56c6c;
}

.checkout-button {
  width: 100%;
  margin-top: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    flex-wrap: wrap;
  }
  
  .item-image {
    width: 60px;
    height: 60px;
  }
  
  .item-info {
    width: calc(100% - 120px);
  }
  
  .item-price,
  .item-quantity,
  .item-subtotal,
  .item-actions {
    margin-top: 10px;
    width: 25%;
  }
}
</style> 