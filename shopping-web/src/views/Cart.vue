<template>
  <div class="cart-container container">
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
            <el-image 
              :src="getProxyImageUrl(item.product.imgUrl)" 
              fit="cover"
              :preview-src-list="[getProxyImageUrl(item.product.imgUrl)]"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><ShoppingCart /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          
          <div class="item-info">
            <h3 class="item-name">{{ item.product.name }}</h3>
            <p class="item-specs" v-if="item.specs">
              <el-tag v-for="(value, key) in item.specs" :key="key" size="small" effect="plain" class="spec-tag">
                {{ key }}: {{ value }}
              </el-tag>
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
            <span class="price">{{ shipping > 0 ? `¥${shipping.toFixed(2)}` : '免运费' }}</span>
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
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'

const router = useRouter()
const loading = ref(true)
const cartItems = ref([])

// 加载购物车数据
const loadCartData = async () => {
  loading.value = true
  
  try {
    console.log('开始获取购物车数据')
    const res = await cartApi.getCartItems()
    console.log('购物车API返回数据:', res)
    
    // 防止后端返回null或非数组数据
    if (!res || !Array.isArray(res)) {
      console.warn('购物车API返回非数组数据:', res)
      cartItems.value = []
      return
    }
    
    // 替换所有商品图片为统一图片
    cartItems.value = res.map(item => ({
      ...item,
      selected: false, // 添加选择状态
      product: item.product ? {
        ...item.product,
        imgUrl: item.product.imgUrl || DEFAULT_PRODUCT_IMAGE // 使用原始URL，在显示时会通过代理访问
      } : {
        id: item.productId || 0,
        name: '未知商品',
        price: 0,
        stock: 0,
        imgUrl: DEFAULT_PRODUCT_IMAGE
      }
    }))
    
    console.log('处理后的购物车数据:', cartItems.value)
    
    // 保存购物车数据到localStorage
    localStorage.setItem('cartData', JSON.stringify(cartItems.value))
  } catch (error) {
    console.error('获取购物车数据失败:', error)
    ElMessage.error('获取购物车数据失败，请稍后重试')
    
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
          imgUrl: DEFAULT_PRODUCT_IMAGE
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
          imgUrl: DEFAULT_PRODUCT_IMAGE
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
          imgUrl: DEFAULT_PRODUCT_IMAGE
        }
      }
    ]
    
    // 保存默认购物车数据到localStorage
    localStorage.setItem('cartData', JSON.stringify(cartItems.value))
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

// 计算价格
const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0)
})

// 优惠金额
const discount = computed(() => {
  return totalPrice.value * 0.05 // 模拟优惠5%
})

// 运费
const shipping = computed(() => {
  return totalPrice.value > 0 ? (totalPrice.value > 99 ? 0 : 10) : 0
})

// 最终应付金额
const payableAmount = computed(() => {
  return totalPrice.value - discount.value + shipping.value
})

// 去结算
const checkout = () => {
  const selectedItems = cartItems.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  
  // 检查用户是否已登录
  const userInfo = localStorage.getItem('userInfo')
  let userId = null
  
  if (userInfo) {
    try {
      const parsedUserInfo = JSON.parse(userInfo)
      if (parsedUserInfo && parsedUserInfo.id) {
        userId = parseInt(parsedUserInfo.id)
        console.log('用户已登录，用户ID:', userId)
      }
    } catch (error) {
      console.error('解析用户信息失败:', error)
    }
  }
  
  if (!userId || isNaN(userId)) {
    console.log('用户未登录或ID无效，使用默认用户ID 1')
    // 为未登录用户创建默认用户信息
    const defaultUserInfo = {
      id: 1,
      username: 'guest',
      role: 'user'
    }
    localStorage.setItem('userInfo', JSON.stringify(defaultUserInfo))
    console.log('已设置默认用户信息:', defaultUserInfo)
  }
  
  // 保存选中的商品ID到localStorage
  const selectedItemIds = selectedItems.map(item => item.id)
  localStorage.setItem('selectedCartItems', JSON.stringify(selectedItemIds))
  console.log('保存选中的商品ID到localStorage:', selectedItemIds)
  
  // 跳转到结算页面
  router.push({
    path: '/checkout',
    query: { from: 'cart' }
  })
}

// 返回首页
const goToHome = () => {
  router.push('/')
}

onMounted(() => {
  loadCartData()
})
</script>

<style scoped>
.cart-container {
  padding-top: 20px;
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
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
  color: #909399;
}

.cart-item {
  display: grid;
  grid-template-columns: 40px 100px 1fr 120px 120px 120px 100px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 15px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
}

.item-info {
  padding-right: 20px;
}

.item-name {
  margin: 0 0 10px 0;
  font-size: 16px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-specs {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.spec-tag {
  margin-right: 5px;
}

.item-price, .item-subtotal {
  font-weight: 500;
}

.item-subtotal {
  color: #f56c6c;
}

.cart-checkout {
  height: fit-content;
  position: sticky;
  top: 80px;
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
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  font-size: 18px;
  font-weight: bold;
}

.price {
  color: #303133;
}

.price.discount {
  color: #67c23a;
}

.checkout-button {
  width: 100%;
  margin-top: 20px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-checkout {
    position: static;
    top: auto;
  }
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 40px 80px 1fr;
    grid-template-rows: auto auto auto;
    gap: 10px;
    padding: 15px 0;
  }
  
  .item-image {
    grid-row: span 3;
    grid-column: 2;
    width: 80px;
    height: 80px;
    margin-right: 0;
  }
  
  .item-info {
    grid-row: 1;
    grid-column: 3;
    padding-right: 0;
  }
  
  .item-price {
    grid-row: 2;
    grid-column: 3;
  }
  
  .item-quantity {
    grid-row: 3;
    grid-column: 3;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .item-subtotal, .item-actions {
    display: none;
  }
}
</style> 