<template>
  <div class="home-container">
    <el-carousel height="400px" class="banner">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img :src="getProxyImageUrl(item.imgUrl)" class="banner-img" />
      </el-carousel-item>
    </el-carousel>

    <div class="category-section container">
      <div class="section-header">
        <h2>商品分类</h2>
      </div>
      <el-row :gutter="20">
        <el-col :xs="8" :sm="6" :md="4" v-for="category in categories" :key="category.id">
          <div class="category-item" @click="filterByCategory(category.id)">
            <el-icon size="24"><component :is="category.icon" /></el-icon>
            <span>{{ category.name }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="product-section container">
      <div class="section-header">
        <h2>热门商品</h2>
        <el-button type="primary" text>查看更多</el-button>
      </div>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="8" :md="6" :lg="6" v-for="product in products" :key="product.id" class="product-col">
          <el-card class="product-card" shadow="hover" @click="goToDetail(product.id)">
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
import { Monitor, Phone, ShoppingBag, Food, Present, Soccer, Picture, Loading } from '@element-plus/icons-vue'
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'

const router = useRouter()

// 模拟数据，实际项目中应该从API获取
const banners = ref([
  { id: 1, imgUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01LCoaYH1UmNEIlMsUB_!!6000000002568-0-tps-2880-1070.jpg' },
  { id: 2, imgUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01AJQrI21QbIveZ33JI_!!6000000002001-0-tps-2880-1070.jpg' },
  { id: 3, imgUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01m1hzc21lOX95MCcbf_!!6000000004809-0-tps-2880-1070.jpg' }
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
  { id: 1, name: '高端智能手机', price: 4999, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 1 },
  { id: 2, name: '超薄笔记本电脑', price: 6999, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 2 },
  { id: 3, name: '时尚休闲上衣', price: 299, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 3 },
  { id: 4, name: '有机新鲜水果', price: 99, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 4 },
  { id: 5, name: '精美礼品套装', price: 499, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 5 },
  { id: 6, name: '专业运动装备', price: 699, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 6 },
  { id: 7, name: '智能家居设备', price: 799, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 1 },
  { id: 8, name: '高清平板电脑', price: 2999, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 2 }
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
  width: 100%;
}

.banner {
  margin-bottom: 40px;
  width: 100%;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 15px;
}

.category-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.category-item span {
  margin-top: 10px;
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
  transition: all 0.3s;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-img {
  width: 100%;
  height: 200px;
}

.image-placeholder, .image-loading {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.product-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .banner {
    height: 200px;
  }
  
  .el-carousel {
    height: 200px;
  }
  
  .section-header h2 {
    font-size: 20px;
  }
  
  .product-img {
    height: 150px;
  }
  
  .image-placeholder, .image-loading {
    height: 150px;
  }
}
</style> 