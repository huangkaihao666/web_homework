<template>
  <div class="product-detail-container" v-if="product">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{ getCategoryName(product.category) }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ product.name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <div class="product-content">
      <div class="product-images">
        <el-image :src="product.imgUrl" fit="contain" class="main-image"></el-image>
        <div class="thumbnail-list">
          <el-image 
            v-for="(img, index) in productImages" 
            :key="index" 
            :src="img" 
            fit="cover" 
            class="thumbnail"
            @click="product.imgUrl = img"
          ></el-image>
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
                :src="img"
                fit="contain"
                class="detail-image"
              ></el-image>
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
  <div v-else class="loading">
    <el-skeleton :rows="10" animated />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const productId = ref(parseInt(route.params.id))
const quantity = ref(1)

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
      name: `商品${productId.value}`,
      price: 299.00 + productId.value * 100,
      category: (productId.value % 6) + 1,
      imgUrl: `https://via.placeholder.com/500x500?text=Product+${productId.value}`,
      stock: 100,
      description: '这是一段商品详情描述。这款商品具有很多优点，例如质量好、价格实惠等。'
    }
    
    // 模拟商品图片
    productImages.value = [
      `https://via.placeholder.com/500x500?text=Product+${productId.value}`,
      `https://via.placeholder.com/500x500?text=Product+${productId.value}+View+1`,
      `https://via.placeholder.com/500x500?text=Product+${productId.value}+View+2`,
      `https://via.placeholder.com/500x500?text=Product+${productId.value}+View+3`
    ]
    
    // 模拟详情图片
    detailImages.value = [
      `https://via.placeholder.com/800x400?text=Product+${productId.value}+Detail+1`,
      `https://via.placeholder.com/800x400?text=Product+${productId.value}+Detail+2`
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
  padding: 20px 0;
}

.product-content {
  display: flex;
  margin: 30px 0;
  gap: 30px;
}

.product-images {
  flex: 1;
}

.main-image {
  width: 100%;
  height: 400px;
  border: 1px solid #eee;
  margin-bottom: 10px;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border: 1px solid #eee;
  cursor: pointer;
}

.thumbnail:hover {
  border-color: #409eff;
}

.product-info {
  flex: 1;
  padding: 0 20px;
}

.product-name {
  font-size: 24px;
  margin-bottom: 15px;
}

.product-price {
  font-size: 28px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.product-attrs {
  background-color: #f8f8f8;
  padding: 15px;
  margin-bottom: 20px;
}

.attr-item {
  margin-bottom: 10px;
}

.attr-label {
  color: #666;
  margin-right: 10px;
}

.attr-value {
  color: #333;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.product-details {
  margin-top: 40px;
}

.detail-content {
  padding: 20px 0;
}

.detail-images {
  margin-top: 20px;
}

.detail-image {
  width: 100%;
  margin-bottom: 10px;
}

.reviews {
  padding: 20px 0;
}

.no-reviews {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.review-item {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.username {
  font-weight: bold;
  margin-right: 15px;
}

.review-time {
  color: #999;
  margin-left: 10px;
}

.loading {
  padding: 40px 0;
}
</style> 