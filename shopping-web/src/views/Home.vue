<template>
  <div class="home-container">
    <el-carousel height="400px" class="banner">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img :src="item.imgUrl" class="banner-img" />
      </el-carousel-item>
    </el-carousel>

    <div class="category-section">
      <h2>商品分类</h2>
      <el-row :gutter="20">
        <el-col :span="4" v-for="category in categories" :key="category.id">
          <div class="category-item" @click="filterByCategory(category.id)">
            <el-icon><component :is="category.icon" /></el-icon>
            <span>{{ category.name }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="product-section">
      <h2>热门商品</h2>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in products" :key="product.id" class="product-col">
          <el-card class="product-card" shadow="hover" @click="goToDetail(product.id)">
            <img :src="product.imgUrl" class="product-img" />
            <div class="product-info">
              <h3 class="product-title">{{ product.name }}</h3>
              <p class="product-price">¥{{ product.price.toFixed(2) }}</p>
              <el-button type="primary" size="small" @click.stop="addToCart(product)">加入购物车</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Monitor, Phone, ShoppingBag, Food, Present, Soccer } from '@element-plus/icons-vue'

const router = useRouter()

// 模拟数据，实际项目中应该从API获取
const banners = ref([
  { id: 1, imgUrl: 'https://via.placeholder.com/1200x400?text=Banner+1' },
  { id: 2, imgUrl: 'https://via.placeholder.com/1200x400?text=Banner+2' },
  { id: 3, imgUrl: 'https://via.placeholder.com/1200x400?text=Banner+3' }
])

const categories = ref([
  { id: 1, name: '电子产品', icon: 'Monitor' },
  { id: 2, name: '手机', icon: 'Phone' },
  { id: 3, name: '服装', icon: 'ShoppingBag' },
  { id: 4, name: '食品', icon: 'Food' },
  { id: 5, name: '礼品', icon: 'Present' },
  { id: 6, name: '运动', icon: 'Soccer' }
])

const products = ref([
  { id: 1, name: '商品1', price: 299, imgUrl: 'https://via.placeholder.com/300x300?text=Product+1', category: 1 },
  { id: 2, name: '商品2', price: 599, imgUrl: 'https://via.placeholder.com/300x300?text=Product+2', category: 2 },
  { id: 3, name: '商品3', price: 99, imgUrl: 'https://via.placeholder.com/300x300?text=Product+3', category: 3 },
  { id: 4, name: '商品4', price: 249, imgUrl: 'https://via.placeholder.com/300x300?text=Product+4', category: 4 },
  { id: 5, name: '商品5', price: 499, imgUrl: 'https://via.placeholder.com/300x300?text=Product+5', category: 5 },
  { id: 6, name: '商品6', price: 199, imgUrl: 'https://via.placeholder.com/300x300?text=Product+6', category: 6 },
  { id: 7, name: '商品7', price: 799, imgUrl: 'https://via.placeholder.com/300x300?text=Product+7', category: 1 },
  { id: 8, name: '商品8', price: 399, imgUrl: 'https://via.placeholder.com/300x300?text=Product+8', category: 2 }
])

const filterByCategory = (categoryId) => {
  // 实际应用中应该通过API过滤
  console.log('按分类过滤:', categoryId)
}

const goToDetail = (productId) => {
  router.push(`/product/${productId}`)
}

const addToCart = (product) => {
  // 实际应用中应该调用API或更新状态
  ElMessage.success(`已将 ${product.name} 加入购物车`)
}

onMounted(() => {
  // 从后端获取数据
  console.log('组件已挂载，可以调用API获取数据')
})
</script>

<style scoped>
.home-container {
  padding: 0 0 40px;
}

.banner {
  margin-bottom: 40px;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-section {
  margin-bottom: 40px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  background-color: #f5f7fa;
}

.product-section {
  margin-bottom: 40px;
}

.product-col {
  margin-bottom: 20px;
}

.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.product-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  margin: 10px 0;
  height: 40px;
  overflow: hidden;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}
</style> 