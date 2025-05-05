<template>
  <div class="product-detail-container container" v-if="product">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ getCategoryName(product.category) }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="product-content">
      <div class="product-images">
        <el-image 
          :src="getProxyImageUrl(currentImage)" 
          fit="contain" 
          class="main-image"
          :preview-src-list="productImages.map(img => getProxyImageUrl(img))"
        >
          <template #error>
            <div class="image-error">
              <el-icon :size="48"><Picture /></el-icon>
            </div>
          </template>
          <template #placeholder>
            <div class="image-loading">
              <el-icon class="is-loading" :size="48"><Loading /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="thumbnail-list">
          <el-image 
            v-for="(img, index) in productImages" 
            :key="index" 
            :src="getProxyImageUrl(img)" 
            fit="cover" 
            class="thumbnail"
            :class="{ active: currentImage === img }"
            @click="currentImage = img"
          >
            <template #error>
              <div class="thumbnail-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>
      
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-price">¥{{ product.price.toFixed(2) }}</p>
        
        <div class="product-attrs">
          <div class="attr-item">
            <span class="attr-label">商品编号:</span>
            <span class="attr-value">{{ product.id }}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">分类:</span>
            <span class="attr-value">{{ getCategoryName(product.category) }}</span>
          </div>
          <div class="attr-item">
            <span class="attr-label">库存:</span>
            <span class="attr-value">{{ product.stock || 99 }}</span>
          </div>
        </div>
        
        <div class="product-actions">
          <el-input-number v-model="quantity" :min="1" :max="99" size="large" />
          <el-button type="primary" size="large" @click="addToCart">
            <el-icon><ShoppingCart /></el-icon> 加入购物车
          </el-button>
          <el-button type="danger" size="large" @click="buyNow">立即购买</el-button>
        </div>
      </div>
    </div>
    
    <div class="product-details">
      <el-tabs>
        <el-tab-pane label="商品详情">
          <div class="detail-content">
            <h3>商品详情</h3>
            <p>{{ product.description || '这是一段商品详情描述。这款商品具有很多优点，例如质量好、价格实惠等。' }}</p>
            <div class="detail-images">
              <el-image
                v-for="(img, index) in detailImages"
                :key="index"
                :src="getProxyImageUrl(img)"
                fit="contain"
                class="detail-image"
              >
                <template #error>
                  <div class="detail-image-error">
                    <el-icon :size="32"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="规格参数">
          <el-table :data="specifications" stripe>
            <el-table-column prop="name" label="参数名称" width="180" />
            <el-table-column prop="value" label="参数值" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="用户评价">
          <div class="reviews">
            <div v-if="reviews.length === 0" class="no-reviews">
              暂无评价
            </div>
            <div v-else class="review-list">
              <div v-for="review in reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <span class="username">{{ review.username }}</span>
                  <el-rate v-model="review.rating" disabled />
                  <span class="review-time">{{ review.time }}</span>
                </div>
                <div class="review-content">{{ review.content }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
  <div v-else class="loading container">
    <el-skeleton :rows="10" animated />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart, Picture, Loading } from '@element-plus/icons-vue'
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'

const route = useRoute()
const router = useRouter()
const productId = ref(parseInt(route.params.id))
const quantity = ref(1)

// 当前显示的图片
const currentImage = ref('')

// 模拟数据，实际项目中应该从API获取
const product = ref(null)
const productImages = ref([])
const detailImages = ref([])
const specifications = ref([])
const reviews = ref([])

const categories = [
  { id: 1, name: '电子产品' },
  { id: 2, name: '手机' },
  { id: 3, name: '服装' },
  { id: 4, name: '食品' },
  { id: 5, name: '礼品' },
  { id: 6, name: '运动' }
]

const getCategoryName = (categoryId) => {
  const category = categories.find(c => c.id === categoryId)
  return category ? category.name : '未分类'
}

const addToCart = () => {
  ElMessage.success(`已将 ${quantity.value} 件 ${product.value.name} 加入购物车`)
}

const buyNow = () => {
  // 添加到购物车后直接跳转到结算页面
  addToCart()
  router.push('/checkout')
}

onMounted(async () => {
  // 模拟从后端获取数据
  setTimeout(() => {
    product.value = {
      id: productId.value,
      name: `高品质商品${productId.value}`,
      price: 299.00 + productId.value * 100,
      category: (productId.value % 6) + 1,
      imgUrl: DEFAULT_PRODUCT_IMAGE,
      stock: 100,
      description: '这是一段商品详情描述。这款商品具有很多优点，例如质量好、价格实惠等。这款产品采用高品质材料制造，经久耐用。产品设计简约现代，符合当下流行趋势。无论是自用还是送礼，都是不错的选择。'
    }
    
    // 设置当前展示图片
    currentImage.value = DEFAULT_PRODUCT_IMAGE;
    
    // 模拟商品图片
    productImages.value = [
      DEFAULT_PRODUCT_IMAGE,
      DEFAULT_PRODUCT_IMAGE,
      DEFAULT_PRODUCT_IMAGE,
      DEFAULT_PRODUCT_IMAGE
    ]
    
    // 模拟详情图片
    detailImages.value = [
      DEFAULT_PRODUCT_IMAGE,
      DEFAULT_PRODUCT_IMAGE
    ]
    
    // 模拟规格参数
    specifications.value = [
      { name: '品牌', value: '品牌' + productId.value },
      { name: '型号', value: '型号' + productId.value },
      { name: '颜色', value: '红色/黑色/白色' },
      { name: '材质', value: '高级材质' },
      { name: '尺寸', value: '标准尺寸' }
    ]
    
    // 模拟用户评价
    reviews.value = [
      { id: 1, username: '用户1', rating: 5, time: '2024-04-15', content: '很好的商品，质量不错，值得购买！' },
      { id: 2, username: '用户2', rating: 4, time: '2024-04-10', content: '商品不错，但是发货有点慢。' }
    ]
  }, 500)
})
</script>

<style scoped>
.product-detail-container {
  padding-top: 20px;
  padding-bottom: 40px;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin: 30px 0;
}

.product-images {
  width: 100%;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.image-error, .image-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background-color: #f5f7fa;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  background-color: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.thumbnail.active {
  border-color: #409eff;
  transform: translateY(-5px);
}

.thumbnail-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 15px 0;
  line-height: 1.4;
}

.product-price {
  font-size: 28px;
  font-weight: bold;
  color: #f56c6c;
  margin: 0 0 20px 0;
}

.product-attrs {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.attr-item {
  display: flex;
  margin-bottom: 10px;
}

.attr-item:last-child {
  margin-bottom: 0;
}

.attr-label {
  width: 80px;
  color: #606266;
}

.product-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.product-details {
  margin-top: 40px;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.detail-content {
  padding: 20px 0;
}

.detail-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
}

.detail-content p {
  line-height: 1.6;
  margin-bottom: 20px;
}

.detail-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-image {
  width: 100%;
  max-height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.detail-image-error {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
}

.reviews {
  padding: 20px 0;
}

.no-reviews {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.review-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.username {
  font-weight: 500;
  margin-right: 15px;
}

.review-time {
  margin-left: auto;
  color: #909399;
  font-size: 14px;
}

.review-content {
  line-height: 1.6;
}

.loading {
  padding: 40px 0;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .product-content {
    grid-template-columns: 1fr;
  }
  
  .main-image {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .product-actions {
    flex-wrap: wrap;
  }
  
  .product-actions .el-button {
    flex: 1;
  }
}
</style> 