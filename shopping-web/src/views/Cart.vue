<template>
  <div class="cart-container">
    <h1>我的购物车</h1>
    
    <div v-if="cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="$router.push('/')">去购物</el-button>
      </el-empty>
    </div>
    
    <div v-else class="cart-content">
      <el-table :data="cartItems" style="width: 100%">
        <el-table-column width="80">
          <template #default="scope">
            <el-checkbox v-model="scope.row.selected" @change="calculateTotal"></el-checkbox>
          </template>
        </el-table-column>
        
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
        
        <el-table-column label="数量" width="200">
          <template #default="scope">
            <el-input-number 
              v-model="scope.row.quantity" 
              :min="1" 
              :max="99"
              @change="updateItemTotal(scope.row)" 
              size="small"
            ></el-input-number>
          </template>
        </el-table-column>
        
        <el-table-column label="小计" width="150">
          <template #default="scope">
            <span class="subtotal">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              type="danger" 
              plain 
              size="small" 
              @click="removeItem(scope.$index)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="cart-footer">
        <div class="select-all">
          <el-checkbox v-model="allSelected" @change="selectAll">全选</el-checkbox>
        </div>
        <div class="batch-actions">
          <el-button type="danger" plain @click="removeSelected">删除选中</el-button>
        </div>
        <div class="cart-total">
          <div class="total-info">
            已选择 <span class="selected-count">{{ selectedCount }}</span> 件商品，
            合计：<span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <el-button type="primary" size="large" @click="checkout" :disabled="selectedCount === 0">
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const cartItems = ref([])
const allSelected = ref(false)

// 计算属性
const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
})

// 方法
const loadCartItems = () => {
  // 这里应该从后端API获取购物车数据
  // 模拟获取购物车数据
  cartItems.value = [
    { 
      id: 1, 
      name: '商品1', 
      price: 299, 
      quantity: 2, 
      imgUrl: 'https://via.placeholder.com/100x100?text=Product+1',
      selected: true
    },
    { 
      id: 2, 
      name: '商品2', 
      price: 599, 
      quantity: 1, 
      imgUrl: 'https://via.placeholder.com/100x100?text=Product+2',
      selected: true
    },
    { 
      id: 3, 
      name: '商品3', 
      price: 99, 
      quantity: 3, 
      imgUrl: 'https://via.placeholder.com/100x100?text=Product+3',
      selected: true
    }
  ]
  calculateTotal()
}

const calculateTotal = () => {
  // 检查是否所有商品都被选中
  allSelected.value = cartItems.value.length > 0 && cartItems.value.every(item => item.selected)
}

const updateItemTotal = (item) => {
  // 实际应用中应该调用API更新购物车项
  calculateTotal()
}

const removeItem = (index) => {
  ElMessageBox.confirm(
    '确定要将这个商品从购物车中移除吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      cartItems.value.splice(index, 1)
      calculateTotal()
      ElMessage.success('商品已从购物车移除')
    })
    .catch(() => {
      // 用户取消删除
    })
}

const removeSelected = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedCount.value} 件商品吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      cartItems.value = cartItems.value.filter(item => !item.selected)
      calculateTotal()
      ElMessage.success('选中商品已从购物车移除')
    })
    .catch(() => {
      // 用户取消删除
    })
}

const selectAll = (val) => {
  cartItems.value.forEach(item => {
    item.selected = val
  })
}

const checkout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }
  
  // 跳转到结算页面
  router.push('/checkout')
}

onMounted(() => {
  // 加载购物车数据
  loadCartItems()
})
</script>

<style scoped>
.cart-container {
  padding: 20px 0;
}

.cart-container h1 {
  margin-bottom: 30px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
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

.product-details {
  display: flex;
  flex-direction: column;
}

.product-name {
  margin-bottom: 10px;
}

.price, .subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.subtotal {
  font-size: 16px;
}

.cart-footer {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.select-all {
  margin-right: 20px;
}

.batch-actions {
  margin-right: auto;
}

.cart-total {
  display: flex;
  align-items: center;
}

.total-info {
  margin-right: 20px;
  font-size: 16px;
}

.selected-count {
  color: #f56c6c;
  font-weight: bold;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
  font-weight: bold;
}
</style> 