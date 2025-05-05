<template>
  <div class="product-detail-container container">
    <div class="breadcrumb">
      <el-button size="small" type="default" @click="goBack">
        <el-icon class="mr-5"><i class="el-icon-arrow-left"></i></el-icon>
        返回
      </el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>
    
    <div v-else-if="!product" class="product-not-found">
      <el-empty description="商品不存在或已下架" />
      <el-button type="primary" @click="router.push('/')">返回首页</el-button>
    </div>
    
    <div v-else class="product-detail">
      <div class="product-image-section">
        <el-image :src="getProxyImageUrl(product.imgUrl)" class="product-img" fit="cover">
          <template #error>
            <div class="image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
          <template #placeholder>
            <div class="image-loading">
              <el-icon class="is-loading"><Loading /></el-icon>
            </div>
          </template>
        </el-image>
      </div>
      
      <div class="product-info-section">
        <h1 class="product-title">{{ product.name }}</h1>
        
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ product.price?.toFixed(2) }}</span>
        </div>
        
        <div class="product-stock" v-if="product.stock">
          <span>库存: {{ product.stock }} 件</span>
        </div>
        
        <div class="product-description">
          <h3>商品描述</h3>
          <p>{{ product.description || '暂无描述' }}</p>
        </div>
        
        <div class="product-quantity">
          <span class="quantity-label">数量:</span>
          <el-input-number
            v-model="quantity"
            :min="1"
            :max="product.stock || 99"
            @change="handleQuantityChange"
            size="large"
          />
        </div>
        
        <div class="product-actions">
          <el-button type="primary" size="large" @click="addToCart" :disabled="!product.stock">
            加入购物车
          </el-button>
          <el-button type="danger" size="large" @click="buyNow" :disabled="!product.stock">
            立即购买
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { Picture, Loading } from '@element-plus/icons-vue'
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import productApi from '@/api/product'
import cartApi from '@/api/cart'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const product = ref(null)
const quantity = ref(1)

// 获取URL中的产品ID
const productId = computed(() => route.params.id)

// 增加数量
const increaseQuantity = () => {
  quantity.value++
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 加入购物车
const addToCart = async () => {
  if (!product.value) return
  
  try {
    await cartApi.addToCart({
      productId: product.value.id,
      quantity: quantity.value
    })
    
    ElNotification({
      title: '成功',
      message: `已将 ${quantity.value} 件 ${product.value.name} 加入购物车`,
      type: 'success'
    })
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error('添加到购物车失败，请稍后重试')
  }
}

// 立即购买
const buyNow = async () => {
  try {
    await addToCart()
    router.push('/cart')
  } catch (error) {
    console.error('立即购买失败:', error)
  }
}

// 获取产品详情
const fetchProductDetail = async () => {
  loading.value = true
  
  try {
    const result = await productApi.getProduct(productId.value)
    product.value = {
      ...result,
      imgUrl: result.imgUrl || DEFAULT_PRODUCT_IMAGE
    }
  } catch (error) {
    console.error('获取产品详情失败:', error)
    ElMessage.error('获取产品详情失败，请稍后重试')
    
    // 如果获取失败，可以使用默认数据（或跳转到404页面）
    product.value = {
      id: productId.value,
      name: '商品不存在或已下架',
      price: 0,
      description: '抱歉，该商品信息无法获取',
      imgUrl: DEFAULT_PRODUCT_IMAGE,
      stock: 0,
      category: null
    }
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-container {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.loading-container {
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-not-found .el-button {
  margin-top: 20px;
}

.product-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.product-image-section {
  flex: 1;
  min-width: 300px;
}

.product-img {
  width: 100%;
  height: 400px;
  border-radius: 8px;
}

.image-placeholder, .image-loading {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
  border-radius: 8px;
}

.product-info-section {
  flex: 1;
  min-width: 300px;
}

.product-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.product-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 20px;
  color: #f56c6c;
}

.price-symbol {
  font-size: 18px;
  margin-right: 5px;
}

.price-value {
  font-size: 28px;
  font-weight: bold;
}

.product-stock {
  margin-bottom: 20px;
  color: #606266;
}

.product-description {
  margin-bottom: 30px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.product-description h3 {
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: 500;
}

.product-description p {
  color: #606266;
  line-height: 1.6;
}

.product-quantity {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.quantity-label {
  margin-right: 15px;
  font-size: 16px;
}

.product-actions {
  display: flex;
  gap: 15px;
}

@media (max-width: 768px) {
  .product-detail {
    flex-direction: column;
  }
  
  .product-img, .image-placeholder, .image-loading {
    height: 300px;
  }
  
  .product-title {
    font-size: 20px;
  }
  
  .price-value {
    font-size: 24px;
  }
  
  .product-actions {
    flex-direction: column;
  }
}
</style> 