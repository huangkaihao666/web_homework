<template>
  <div class="home-container">
    <el-carousel height="400px" class="banner">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <img :src="getProxyImageUrl(item.imgUrl)" class="banner-img" />
      </el-carousel-item>
    </el-carousel>

    <div v-if="loading" class="loading-container container">
      <el-skeleton :rows="10" animated />
    </div>

    <template v-else>
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
          <h2>商品列表</h2>
          <el-button type="primary" text @click="loadData">查看全部</el-button>
        </div>
        
        <div v-if="products.length === 0" class="empty-products">
          <el-empty description="暂无商品" />
        </div>
        
        <el-row v-else :gutter="20">
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
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Picture, Loading } from '@element-plus/icons-vue'
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import productApi from '@/api/product'
import cartApi from '@/api/cart'

const router = useRouter()
const loading = ref(true)
const banners = ref([])

const categories = ref([])
const products = ref([])

// 根据分类ID过滤商品
const filterByCategory = async (categoryId) => {
  try {
    loading.value = true
    const result = await productApi.getProducts({ category: categoryId })
    products.value = result.map(product => ({
      ...product,
      imgUrl: product.imgUrl || DEFAULT_PRODUCT_IMAGE
    }))
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 跳转到商品详情页
const goToDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 添加商品到购物车
const addToCart = async (product) => {
  try {
    await cartApi.addToCart({
      productId: product.id,
      quantity: 1
    })
    ElMessage.success(`已将 ${product.name} 加入购物车`)
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error('添加到购物车失败，请稍后重试')
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  
  try {
    console.log('开始从API获取数据')
    // 并行获取分类、商品和轮播图数据
    const [categoriesResult, productsResult, bannersResult] = await Promise.all([
      productApi.getCategories(),
      productApi.getProducts(),
      productApi.getBanners()
    ])
    
    console.log('API返回数据:', { 
      categories: categoriesResult, 
      products: productsResult,
      banners: bannersResult 
    })
    
    // 设置轮播图数据
    banners.value = Array.isArray(bannersResult) ? bannersResult : [];
    
    // 设置分类数据（添加图标）
    categories.value = Array.isArray(categoriesResult) ? categoriesResult.map(category => ({
      ...category,
      icon: category.icon || 'Box' // 默认图标
    })) : []
    
    // 设置商品数据（确保所有商品都有图片）
    products.value = Array.isArray(productsResult) ? productsResult.map(product => ({
      ...product,
      imgUrl: product.imgUrl || DEFAULT_PRODUCT_IMAGE
    })) : []
    
    console.log('处理后的数据:', { 
      categories: categories.value, 
      products: products.value,
      banners: banners.value 
    })
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    
    // 设置一些默认数据，以防API调用失败
    banners.value = [
      { id: 1, imgUrl: 'https://img.alicdn.com/imgextra/i4/O1CN01LCoaYH1UmNEIlMsUB_!!6000000002568-0-tps-2880-1070.jpg' },
      { id: 2, imgUrl: 'https://img.alicdn.com/imgextra/i2/O1CN01AJQrI21QbIveZ33JI_!!6000000002001-0-tps-2880-1070.jpg' },
      { id: 3, imgUrl: 'https://img.alicdn.com/imgextra/i1/O1CN01m1hzc21lOX95MCcbf_!!6000000004809-0-tps-2880-1070.jpg' }
    ]
    
    categories.value = [
      { id: 1, name: '电子产品', icon: 'Monitor' },
      { id: 2, name: '手机', icon: 'Phone' },
      { id: 3, name: '服装', icon: 'ShoppingBag' },
      { id: 4, name: '食品', icon: 'Food' },
      { id: 5, name: '礼品', icon: 'Present' },
      { id: 6, name: '运动', icon: 'Soccer' }
    ]
    
    products.value = [
      { id: 1, name: '高端智能手机', price: 4999, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 1 },
      { id: 2, name: '超薄笔记本电脑', price: 6999, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 2 },
      { id: 3, name: '时尚休闲上衣', price: 299, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 3 },
      { id: 4, name: '有机新鲜水果', price: 99, imgUrl: DEFAULT_PRODUCT_IMAGE, category: 4 }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
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

.loading-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
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
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

.empty-products {
  padding: 40px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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