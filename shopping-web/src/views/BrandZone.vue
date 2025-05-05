<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(true)
const searchQuery = ref('')
const activeCategory = ref('all')
const activeBrand = ref(null)

// 模拟数据 - 品牌分类
const categories = ref([
  { id: 'all', name: '全部品牌' },
  { id: 'electronic', name: '电子数码' },
  { id: 'clothing', name: '服装鞋包' },
  { id: 'beauty', name: '美妆护肤' },
  { id: 'food', name: '食品饮料' },
  { id: 'home', name: '家居家装' },
  { id: 'sports', name: '运动户外' }
])

// 模拟数据 - 品牌列表
const brands = ref([
  {
    id: 1,
    name: 'Apple',
    logo: 'https://via.placeholder.com/150?text=Apple',
    description: '美国高科技公司，全球知名的智能手机、个人电脑、平板电脑以及相关软件、服务和配件的制造商。',
    category: 'electronic',
    featured: true,
    hot: true
  },
  {
    id: 2,
    name: 'Samsung',
    logo: 'https://via.placeholder.com/150?text=Samsung',
    description: '韩国跨国企业集团，业务涵盖电子、半导体、电信设备等多个领域。',
    category: 'electronic',
    featured: true,
    hot: false
  },
  {
    id: 3,
    name: 'Nike',
    logo: 'https://via.placeholder.com/150?text=Nike',
    description: '美国体育用品制造商，生产运动鞋、运动服饰及体育器材等产品。',
    category: 'sports',
    featured: true,
    hot: true
  },
  {
    id: 4,
    name: 'Adidas',
    logo: 'https://via.placeholder.com/150?text=Adidas',
    description: '德国运动用品制造商，提供各类运动鞋、服装和配件等产品。',
    category: 'sports',
    featured: true,
    hot: false
  },
  {
    id: 5,
    name: 'ZARA',
    logo: 'https://via.placeholder.com/150?text=ZARA',
    description: '西班牙时装品牌，以快速时尚著称，提供男装、女装和儿童服装。',
    category: 'clothing',
    featured: false,
    hot: true
  },
  {
    id: 6,
    name: 'H&M',
    logo: 'https://via.placeholder.com/150?text=H&M',
    description: '瑞典服装零售商，以平价时尚服装和配饰著称。',
    category: 'clothing',
    featured: false,
    hot: true
  },
  {
    id: 7,
    name: "L'Oreal",
    logo: 'https://via.placeholder.com/150?text=L%27Oreal',
    description: '法国化妆品公司，全球最大的化妆品制造商之一，产品涵盖护肤、彩妆、香水等。',
    category: 'beauty',
    featured: true,
    hot: false
  },
  {
    id: 8,
    name: 'Estée Lauder',
    logo: 'https://via.placeholder.com/150?text=Estee+Lauder',
    description: '美国高端化妆品制造商，拥有多个知名化妆品和香水品牌。',
    category: 'beauty',
    featured: false,
    hot: false
  },
  {
    id: 9,
    name: 'Coca-Cola',
    logo: 'https://via.placeholder.com/150?text=Coca+Cola',
    description: '美国跨国饮料公司，生产非酒精饮料、浓缩液和糖浆。',
    category: 'food',
    featured: true,
    hot: true
  },
  {
    id: 10,
    name: 'Nestlé',
    logo: 'https://via.placeholder.com/150?text=Nestle',
    description: '瑞士跨国食品和饮料公司，全球最大的食品公司之一。',
    category: 'food',
    featured: false,
    hot: false
  },
  {
    id: 11,
    name: 'IKEA',
    logo: 'https://via.placeholder.com/150?text=IKEA',
    description: '瑞典家具零售商，以自组装家具、家居用品和室内设计服务著称。',
    category: 'home',
    featured: true,
    hot: true
  },
  {
    id: 12,
    name: 'Dyson',
    logo: 'https://via.placeholder.com/150?text=Dyson',
    description: '英国科技公司，生产吸尘器、空气净化器、风扇、吹风机等家电产品。',
    category: 'home',
    featured: false,
    hot: true
  }
])

// 模拟数据 - 品牌产品
const getProductsForBrand = (brandId) => {
  // 随机生成产品数量 (5-12)
  const count = Math.floor(Math.random() * 8) + 5
  const products = []
  
  const brand = brands.value.find(b => b.id === brandId)
  if (!brand) return []
  
  const priceRange = {
    electronic: [999, 9999],
    clothing: [99, 999],
    beauty: [99, 599],
    food: [10, 199],
    home: [199, 2999],
    sports: [199, 1599]
  }
  
  const range = priceRange[brand.category] || [99, 999]
  
  for (let i = 1; i <= count; i++) {
    const price = Math.floor(Math.random() * (range[1] - range[0])) + range[0]
    const discountRate = Math.random() > 0.7 ? (Math.floor(Math.random() * 3) + 7) / 10 : 1
    
    products.push({
      id: `${brandId}-${i}`,
      brandId,
      name: `${brand.name} 产品 ${i}`,
      image: `https://via.placeholder.com/300x300?text=${brand.name}+${i}`,
      price,
      discountPrice: Math.floor(price * discountRate),
      hasDiscount: discountRate < 1,
      rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
      salesCount: Math.floor(Math.random() * 1000) + 100
    })
  }
  
  return products
}

// 当前显示的品牌列表
const filteredBrands = computed(() => {
  let result = brands.value
  
  // 应用分类过滤
  if (activeCategory.value !== 'all') {
    result = result.filter(brand => brand.category === activeCategory.value)
  }
  
  // 应用搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter(brand => 
      brand.name.toLowerCase().includes(query) ||
      brand.description.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 特色品牌
const featuredBrands = computed(() => {
  return brands.value.filter(brand => brand.featured)
})

// 热门品牌
const hotBrands = computed(() => {
  return brands.value.filter(brand => brand.hot)
})

// 当前选中品牌的产品
const currentBrandProducts = ref([])

// 加载品牌产品
const loadBrandProducts = (brand) => {
  activeBrand.value = brand
  currentBrandProducts.value = getProductsForBrand(brand.id)
}

// 切换分类
const changeCategory = (categoryId) => {
  activeCategory.value = categoryId
  activeBrand.value = null
}

// 搜索品牌
const searchBrands = () => {
  activeBrand.value = null
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 查看产品详情
const viewProductDetail = (product) => {
  ElMessage.success(`查看产品：${product.name}`)
  // 实际项目中跳转到产品详情页
  // router.push(`/product/${product.id}`)
}

// 加入购物车
const addToCart = (product) => {
  ElMessage.success(`已将 ${product.name} 加入购物车`)
}

// 初始化
onMounted(() => {
  loading.value = false
})
</script>

<template>
  <div class="brand-zone-container container">
    <div class="page-header">
      <h1>品牌专区</h1>
      <el-button @click="goHome" plain>返回首页</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else>
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索品牌"
          clearable
          @keyup.enter="searchBrands"
          @clear="searchBrands"
        >
          <template #prefix>
            <i class="el-icon-search"></i>
          </template>
          <template #append>
            <el-button @click="searchBrands">搜索</el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 特色品牌轮播 -->
      <div v-if="!searchQuery && !activeBrand" class="featured-brands">
        <h2>特色品牌</h2>
        <el-carousel height="300px" :interval="4000" type="card">
          <el-carousel-item v-for="brand in featuredBrands" :key="brand.id">
            <div class="featured-brand-card" @click="loadBrandProducts(brand)">
              <img :src="brand.logo" :alt="brand.name" class="brand-logo">
              <h3>{{ brand.name }}</h3>
              <p>{{ brand.description }}</p>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      
      <!-- 热门品牌展示 -->
      <div v-if="!searchQuery && !activeBrand" class="hot-brands">
        <h2>热门品牌</h2>
        <div class="hot-brands-grid">
          <div 
            v-for="brand in hotBrands" 
            :key="brand.id"
            class="hot-brand-card"
            @click="loadBrandProducts(brand)"
          >
            <img :src="brand.logo" :alt="brand.name" class="brand-logo">
            <h3>{{ brand.name }}</h3>
          </div>
        </div>
      </div>
      
      <!-- 品牌列表 -->
      <div class="all-brands" v-if="!activeBrand">
        <div class="category-tabs">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-tab"
            :class="{ active: activeCategory === category.id }"
            @click="changeCategory(category.id)"
          >
            {{ category.name }}
          </div>
        </div>
        
        <div class="brand-list">
          <div 
            v-for="brand in filteredBrands" 
            :key="brand.id"
            class="brand-card"
            @click="loadBrandProducts(brand)"
          >
            <img :src="brand.logo" :alt="brand.name" class="brand-logo">
            <div class="brand-info">
              <h3>{{ brand.name }}</h3>
              <p>{{ brand.description }}</p>
            </div>
          </div>
          
          <div v-if="filteredBrands.length === 0" class="no-results">
            <el-empty description="没有找到符合条件的品牌" />
          </div>
        </div>
      </div>
      
      <!-- 品牌详情和产品 -->
      <div v-if="activeBrand" class="brand-detail">
        <div class="brand-header">
          <el-button icon="el-icon-back" @click="activeBrand = null">返回品牌列表</el-button>
          <h2>{{ activeBrand.name }}</h2>
        </div>
        
        <div class="brand-profile">
          <div class="brand-profile-left">
            <img :src="activeBrand.logo" :alt="activeBrand.name" class="brand-detail-logo">
          </div>
          <div class="brand-profile-right">
            <h3>品牌简介</h3>
            <p>{{ activeBrand.description }}</p>
          </div>
        </div>
        
        <div class="brand-products">
          <h3>品牌产品</h3>
          <div class="product-grid">
            <div 
              v-for="product in currentBrandProducts" 
              :key="product.id"
              class="product-card"
            >
              <div class="product-image" @click="viewProductDetail(product)">
                <img :src="product.image" :alt="product.name">
              </div>
              <div class="product-info">
                <h4 class="product-name" @click="viewProductDetail(product)">{{ product.name }}</h4>
                <div class="product-price">
                  <span class="current-price">¥{{ product.discountPrice }}</span>
                  <span class="original-price" v-if="product.hasDiscount">¥{{ product.price }}</span>
                </div>
                <div class="product-meta">
                  <span class="product-rating">
                    <i class="el-icon-star-on"></i>
                    {{ product.rating }}
                  </span>
                  <span class="product-sales">销量 {{ product.salesCount }}</span>
                </div>
                <el-button type="primary" size="small" @click="addToCart(product)">
                  加入购物车
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
.brand-zone-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-box {
  margin-bottom: 30px;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 500;
}

/* 特色品牌 */
.featured-brands {
  margin-bottom: 40px;
}

.featured-brand-card {
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s;
}

.featured-brand-card:hover {
  transform: translateY(-5px);
}

.featured-brand-card .brand-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 15px;
}

.featured-brand-card h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.featured-brand-card p {
  text-align: center;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

/* 热门品牌 */
.hot-brands {
  margin-bottom: 40px;
}

.hot-brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.hot-brand-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.hot-brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.2);
}

.hot-brand-card .brand-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 10px;
}

.hot-brand-card h3 {
  margin: 0;
  font-size: 16px;
  text-align: center;
}

/* 品牌列表 */
.all-brands {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.category-tab {
  padding: 8px 16px;
  margin-right: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.category-tab:hover {
  background-color: #f5f7fa;
}

.category-tab.active {
  background-color: #409eff;
  color: #fff;
}

.brand-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.brand-card {
  display: flex;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  transition: all 0.3s;
  cursor: pointer;
}

.brand-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.brand-card .brand-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-right: 15px;
}

.brand-info {
  flex: 1;
}

.brand-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.brand-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  line-height: 1.5;
}

.no-results {
  grid-column: 1 / -1;
  padding: 40px 0;
}

/* 品牌详情 */
.brand-detail {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.brand-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.brand-header h2 {
  margin: 0 0 0 15px;
}

.brand-profile {
  display: flex;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.brand-profile-left {
  padding-right: 20px;
}

.brand-detail-logo {
  width: 200px;
  height: 200px;
  object-fit: contain;
}

.brand-profile-right {
  flex: 1;
}

.brand-profile-right h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.brand-profile-right p {
  line-height: 1.6;
  color: #606266;
}

.brand-products h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 220px;
  overflow: hidden;
  cursor: pointer;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-image:hover img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-name {
  margin: 0 0 10px 0;
  font-size: 14px;
  cursor: pointer;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
  height: 40px;
}

.product-name:hover {
  color: #409eff;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.original-price {
  margin-left: 5px;
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 12px;
  color: #909399;
}

.product-rating {
  color: #e6a23c;
}

.product-card .el-button {
  display: block;
  width: 100%;
}

@media (max-width: 768px) {
  .brand-profile {
    flex-direction: column;
  }
  
  .brand-profile-left {
    margin-bottom: 20px;
    padding-right: 0;
    text-align: center;
  }
  
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
  
  .product-image {
    height: 160px;
  }
}
</style> 