<template>
  <div class="product-detail-container container">
    <div class="breadcrumb">
      <el-button size="small" type="default" @click="goBack">
        <el-icon class="mr-5"><ArrowLeft /></el-icon>
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
    
    <template v-else>
      <div class="product-detail">
        <div class="product-image-section">
          <!-- 主图 -->
          <el-image 
            :src="getProxyImageUrl(product.images ? product.images[selectedImageIndex] : product.imgUrl)" 
            class="product-img" 
            fit="contain"
            :preview-src-list="product.images?.map(img => getProxyImageUrl(img)) || [getProxyImageUrl(product.imgUrl)]"
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          
          <!-- 缩略图列表 -->
          <div class="thumbnail-list" v-if="product.images && product.images.length > 1">
            <div 
              v-for="(image, index) in product.images" 
              :key="index"
              class="thumbnail"
              :class="{ active: selectedImageIndex === index }"
              @click="selectedImageIndex = index"
            >
              <el-image :src="getProxyImageUrl(image)" fit="cover"></el-image>
            </div>
          </div>
        </div>
        
        <div class="product-info-section">
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-brand" v-if="product.brand">品牌：{{ product.brand }}</div>
          
          <div class="product-price">
            <span class="price-symbol">¥</span>
            <span class="price-value">{{ discountPrice }}</span>
            <span v-if="product.discount && product.discount < 1" class="original-price">¥{{ product.price?.toFixed(2) }}</span>
            <span v-if="product.discount && product.discount < 1" class="discount-badge">{{ (product.discount * 10).toFixed(1) }}折</span>
          </div>
          
          <div class="product-stock" :class="{ 'out-of-stock': !hasStock }">
            库存：{{ hasStock ? `${product.stock} 件` : '暂时缺货' }}
          </div>
          
          <div class="product-description">
            <h3>商品描述</h3>
            <p>{{ product.description || '暂无描述' }}</p>
          </div>
          
          <div class="product-quantity">
            <span class="quantity-label">数量:</span>
            <div class="quantity-control">
              <el-button @click="decreaseQuantity" :disabled="quantity <= 1">-</el-button>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="product.stock || 99"
                size="small"
                controls-position="right"
              />
              <el-button @click="increaseQuantity" :disabled="quantity >= (product.stock || 99)">+</el-button>
            </div>
          </div>
          
          <div class="product-actions">
            <el-button 
              type="primary" 
              size="large" 
              :icon="ShoppingCart" 
              @click="addToCart" 
              :disabled="!hasStock"
            >
              加入购物车
            </el-button>
            
            <el-button 
              type="danger" 
              size="large" 
              @click="buyNow" 
              :disabled="!hasStock"
            >
              立即购买
            </el-button>
            
            <el-button 
              :type="isFavorite ? 'warning' : 'default'" 
              :icon="isFavorite ? StarFilled : Star" 
              circle
              @click="toggleFavorite"
            ></el-button>
            
            <el-button 
              :icon="Share" 
              circle
              @click="ElMessageBox.alert('复制链接分享给好友', '分享商品')"
            ></el-button>
          </div>
          
          <div class="product-services">
            <div class="service-item">
              <el-icon><Finished /></el-icon>
              <span>正品保证</span>
            </div>
            <div class="service-item">
              <el-icon><ShoppingCart /></el-icon>
              <span>闪电发货</span>
            </div>
            <div class="service-item">
              <el-icon><Picture /></el-icon>
              <span>7天无理由退换</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 详情选项卡 -->
      <div class="product-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="description">
            <div class="product-description-detail">
              <h3>商品详情</h3>
              <p>{{ product.description }}</p>
              
              <!-- 详情图片 -->
              <div class="detail-images">
                <el-image 
                  v-for="(image, index) in product.images" 
                  :key="`detail-${index}`"
                  :src="getProxyImageUrl(image)"
                  fit="contain"
                  style="width: 100%; margin-bottom: 15px;"
                ></el-image>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="规格参数" name="specifications">
            <div class="product-specifications">
              <el-table :data="productSpecs" border stripe style="width: 100%">
                <el-table-column prop="key" label="参数名" width="180"></el-table-column>
                <el-table-column prop="value" label="参数值"></el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="用户评价" name="reviews">
            <div class="product-reviews">
              <div v-if="productReviews.length === 0" class="no-reviews">
                <el-empty description="暂无评价" />
              </div>
              
              <div v-else class="review-list">
                <div v-for="review in productReviews" :key="review.id" class="review-item">
                  <div class="review-header">
                    <div class="reviewer-info">
                      <el-avatar :size="40" :src="review.avatar"></el-avatar>
                      <div class="reviewer-name">{{ review.username }}</div>
                    </div>
                    <div class="review-rating">
                      <el-rate v-model="review.rating" disabled show-score text-color="#ff9900"></el-rate>
                    </div>
                  </div>
                  
                  <div class="review-content">{{ review.content }}</div>
                  
                  <div class="review-images" v-if="review.images && review.images.length > 0">
                    <el-image 
                      v-for="(image, index) in review.images" 
                      :key="`review-${review.id}-${index}`"
                      :src="getProxyImageUrl(image)"
                      fit="cover"
                      style="width: 80px; height: 80px; margin-right: 10px;"
                      :preview-src-list="[getProxyImageUrl(image)]"
                    ></el-image>
                  </div>
                  
                  <div class="review-date">{{ review.date }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 相关推荐 -->
      <div class="related-products" v-if="relatedProducts.length > 0">
        <h3>相关推荐</h3>
        
        <div class="related-product-list">
          <el-row :gutter="20">
            <el-col 
              :xs="12" 
              :sm="6" 
              :md="6" 
              :lg="6" 
              v-for="item in relatedProducts" 
              :key="item.id"
            >
              <div class="product-card" @click="router.push(`/product/${item.id}`)">
                <div class="product-image">
                  <el-image 
                    :src="getProxyImageUrl(item.imgUrl)" 
                    fit="cover"
                  ></el-image>
                  <div v-if="item.discount && item.discount < 1" class="discount-badge">
                    {{ (item.discount * 10).toFixed(1) }}折
                  </div>
                </div>
                
                <div class="product-card-info">
                  <h4 class="product-card-name">{{ item.name }}</h4>
                  <div class="product-card-price">
                    <span class="current-price">¥{{ (item.price * (item.discount || 1)).toFixed(2) }}</span>
                    <span v-if="item.discount && item.discount < 1" class="original-price">¥{{ item.price.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
import { Picture, Loading, ArrowLeft, ShoppingCart, Star, StarFilled, Share, Finished } from '@element-plus/icons-vue'
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import productApi from '@/api/product'
import cartApi from '@/api/cart'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const product = ref(null)
const quantity = ref(1)
const selectedImageIndex = ref(0)
const activeTab = ref('description')
const relatedProducts = ref([])

// 获取URL中的产品ID
const productId = computed(() => route.params.id)

// 增加数量
const increaseQuantity = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  }
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 计算折扣价格
const discountPrice = computed(() => {
  if (!product.value) return '0.00'
  return (product.value.price * (product.value.discount || 1)).toFixed(2)
})

// 商品是否在收藏中
const isFavorite = computed(() => {
  if (!product.value) return false
  
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
  return favorites.includes(product.value.id.toString())
})

// 商品是否有库存
const hasStock = computed(() => {
  return product.value && product.value.stock > 0
})

// 商品规格参数
const productSpecs = computed(() => {
  if (!product.value) return []
  
  // 如果产品已有规格参数，则直接返回
  if (product.value.specifications) {
    return product.value.specifications
  }
  
  // 否则根据产品信息创建基础规格参数
  return [
    { key: '品牌', value: product.value.brand || '未知' },
    { key: '型号', value: `Model-${product.value.id}` },
    { key: '产地', value: '中国' },
    { key: '上市日期', value: product.value.createdAt || '未知' },
    { key: '保修期', value: '12个月' }
  ]
})

// 商品评价
const productReviews = computed(() => {
  if (!product.value) return []
  
  // 如果产品已有评价，则直接返回
  if (product.value.reviews) {
    return product.value.reviews
  }
  
  // 否则返回模拟的评价
  return [
    { id: 1, username: '用户1001', avatar: '', rating: 5, content: '商品质量很好，物流速度快，客服态度好，会继续支持。', date: '2023-08-15', images: [] },
    { id: 2, username: '用户2345', avatar: '', rating: 4, content: '外观很漂亮，功能也不错，就是价格稍微贵了点。', date: '2023-08-10', images: [] },
    { id: 3, username: '用户8876', avatar: '', rating: 5, content: '很满意的一次购物，快递很快，包装很好，产品也很好用。', date: '2023-08-05', images: ['https://via.placeholder.com/100x100?text=Review'] }
  ]
})

// 收藏商品
const toggleFavorite = () => {
  if (!product.value) return
  
  // 这里应该调用收藏API，暂时使用本地存储模拟
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
  const productId = product.value.id.toString()
  
  if (favorites.includes(productId)) {
    // 取消收藏
    localStorage.setItem('favorites', JSON.stringify(favorites.filter(id => id !== productId)))
    ElMessage.success('已取消收藏')
  } else {
    // 添加收藏
    favorites.push(productId)
    localStorage.setItem('favorites', JSON.stringify(favorites))
    ElMessage.success('已收藏成功')
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
    // 首先尝试使用新的API方法
    let result
    try {
      result = await productApi.getProductDetail(productId.value)
    } catch (e) {
      // 如果失败，尝试旧的API方法
      result = await productApi.getProduct(productId.value)
    }
    
    if (!result) {
      throw new Error('商品不存在')
    }
    
    // 处理产品数据
    product.value = {
      ...result,
      imgUrl: result.imgUrl || DEFAULT_PRODUCT_IMAGE,
      // 如果没有images数组，创建一个包含主图的数组
      images: result.images || [result.imgUrl || DEFAULT_PRODUCT_IMAGE]
    }
    
    // 加载相关商品
    loadRelatedProducts()
    
  } catch (error) {
    console.error('获取产品详情失败:', error)
    ElMessage.error('获取产品详情失败，请稍后重试')
    product.value = null
  } finally {
    loading.value = false
  }
}

// 加载相关商品
const loadRelatedProducts = async () => {
  if (!product.value) return
  
  try {
    // 根据当前商品分类获取相关商品
    const params = { category: product.value.category }
    const products = await productApi.getProducts(params)
    
    // 过滤掉当前商品，并只取最多4个相关商品
    relatedProducts.value = products
      .filter(p => p.id !== parseInt(productId.value))
      .slice(0, 4)
  } catch (error) {
    console.error('获取相关商品失败:', error)
    relatedProducts.value = []
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.mr-5 {
  margin-right: 5px;
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
  margin-bottom: 30px;
}

.product-image-section {
  flex: 1;
  min-width: 300px;
}

.product-img {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  overflow-x: auto;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  overflow: hidden;
}

.thumbnail.active {
  border-color: #409EFF;
}

.thumbnail .el-image {
  width: 100%;
  height: 100%;
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
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.product-brand {
  font-size: 14px;
  color: #606266;
  margin-bottom: 15px;
}

.product-price {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.price-symbol {
  font-size: 18px;
  color: #f56c6c;
  margin-right: 5px;
}

.price-value {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  margin-left: 10px;
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.discount-badge {
  margin-left: 10px;
  padding: 2px 6px;
  background-color: #f56c6c;
  color: white;
  border-radius: 4px;
  font-size: 12px;
}

.product-stock {
  margin-bottom: 20px;
  font-size: 14px;
  color: #67c23a;
}

.out-of-stock {
  color: #f56c6c;
}

.product-description {
  margin-bottom: 20px;
}

.product-description h3 {
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 600;
}

.product-description p {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.product-quantity {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.quantity-label {
  margin-right: 15px;
  font-size: 14px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.product-services {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #606266;
}

.product-tabs {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.product-description-detail {
  padding: 20px 0;
}

.product-description-detail h3 {
  font-size: 18px;
  margin-bottom: 15px;
}

.product-description-detail p {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 20px;
}

.detail-images {
  margin-top: 20px;
}

.product-specifications {
  padding: 20px 0;
}

.product-reviews {
  padding: 20px 0;
}

.no-reviews {
  text-align: center;
  padding: 30px 0;
}

.review-item {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reviewer-name {
  font-weight: 500;
}

.review-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 15px;
}

.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.review-date {
  font-size: 12px;
  color: #909399;
}

.related-products {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.related-products h3 {
  font-size: 18px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 160px;
  position: relative;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
}

.product-card-info {
  padding: 15px;
}

.product-card-name {
  font-size: 14px;
  margin: 0;
  margin-bottom: 10px;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card-price {
  display: flex;
  align-items: center;
}

.product-card-price .current-price {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 8px;
}

.product-card-price .original-price {
  font-size: 12px;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .product-detail {
    flex-direction: column;
  }
  
  .product-img {
    height: 300px;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .product-actions .el-button {
    width: 100%;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 