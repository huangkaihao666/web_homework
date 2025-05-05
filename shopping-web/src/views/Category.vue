<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Filter, Sort, Sunrise, ShoppingCart, Search, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'
import productApi from '@/api/product'
import cartApi from '@/api/cart'

const router = useRouter()
const route = useRoute()
const loading = ref(true)
const products = ref([])
const categories = ref([])
const currentCategory = ref(null)
const searchQuery = ref('')
const totalProducts = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 筛选和排序
const filters = ref({
  priceRange: [0, 10000],
  brands: [],
  sortBy: 'default', // default, price-asc, price-desc, newest
  inStock: false
})

// 选中的筛选项
const selectedBrands = ref([])
const selectedPriceRange = ref([0, 10000])

// 品牌列表（从产品中提取）
const availableBrands = computed(() => {
  const brands = new Set()
  products.value.forEach(product => {
    if (product.brand) {
      brands.add(product.brand)
    }
  })
  return Array.from(brands)
})

// 根据筛选条件过滤商品
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // 按品牌筛选
  if (selectedBrands.value.length > 0) {
    result = result.filter(product => 
      selectedBrands.value.includes(product.brand)
    )
  }
  
  // 按价格范围筛选
  result = result.filter(product => 
    product.price >= selectedPriceRange.value[0] && 
    product.price <= selectedPriceRange.value[1]
  )
  
  // 按库存筛选
  if (filters.value.inStock) {
    result = result.filter(product => product.stock > 0)
  }
  
  // 排序
  switch (filters.value.sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    default:
      // 默认排序（推荐或热门）
      break
  }
  
  return result
})

// 当前页的商品
const currentPageProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value
  return filteredProducts.value.slice(startIndex, startIndex + pageSize.value)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / pageSize.value)
})

// 从路由参数获取分类ID和搜索关键词
const getCategoryAndSearchFromRoute = () => {
  const categoryId = route.params.id
  const query = route.query.q || ''
  
  searchQuery.value = query
  
  if (categoryId) {
    currentCategory.value = categories.value.find(c => c.id.toString() === categoryId.toString())
  } else {
    currentCategory.value = null
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const result = await productApi.getCategories()
    categories.value = Array.isArray(result) ? result : []
  } catch (error) {
    console.error('获取分类列表失败:', error)
    categories.value = [
      { id: 1, name: '电子产品', icon: 'Monitor' },
      { id: 2, name: '手机', icon: 'Phone' },
      { id: 3, name: '服装', icon: 'ShoppingBag' },
      { id: 4, name: '食品', icon: 'Food' },
      { id: 5, name: '礼品', icon: 'Present' },
      { id: 6, name: '运动', icon: 'Soccer' }
    ]
  }
}

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  
  try {
    // 构建查询参数
    const params = {}
    
    // 如果有分类ID，添加到查询参数
    if (currentCategory.value) {
      params.category = currentCategory.value.id
    }
    
    // 如果有搜索关键词，添加到查询参数
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    const result = await productApi.getProducts(params)
    
    // 模拟数据（如果API返回为空）
    const productData = Array.isArray(result) && result.length > 0 ? result : [
      { 
        id: 1, 
        name: '智能手表 2023款', 
        price: 1299, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Smartwatch',
        description: '多功能智能手表，支持心率监测、血氧检测、睡眠监测等功能',
        brand: 'TechWear',
        category: 1,
        stock: 35,
        discount: 0.9,
        createdAt: '2023-05-15'
      },
      { 
        id: 2, 
        name: '无线蓝牙耳机', 
        price: 499, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Headphone',
        description: '降噪蓝牙耳机，续航时间长达30小时，支持快充',
        brand: 'SoundPlus',
        category: 1,
        stock: 56,
        discount: 0.85,
        createdAt: '2023-06-20'
      },
      { 
        id: 3, 
        name: '轻薄笔记本电脑', 
        price: 5699, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Laptop',
        description: '13.3英寸高清屏幕，8GB内存，512GB固态硬盘',
        brand: 'CompTech',
        category: 1,
        stock: 10,
        discount: 0.95,
        createdAt: '2023-07-05'
      },
      { 
        id: 4, 
        name: '机械键盘', 
        price: 369, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Keyboard',
        description: '87键机械键盘，青轴，RGB背光',
        brand: 'GamerGear',
        category: 1,
        stock: 86,
        discount: 1,
        createdAt: '2023-07-15'
      },
      { 
        id: 5, 
        name: '人体工学椅', 
        price: 999, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Chair',
        description: '高品质办公椅，舒适透气，支持腰部调节',
        brand: 'ComfortPlus',
        category: 6,
        stock: 15,
        discount: 0.8,
        createdAt: '2023-08-01'
      },
      { 
        id: 6, 
        name: '4K高清投影仪', 
        price: 3699, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Projector',
        description: '家用投影仪，支持4K解析度，亮度2000ANSI流明',
        brand: 'ViewMax',
        category: 1,
        stock: 8,
        discount: 0.9,
        createdAt: '2023-06-10'
      },
      { 
        id: 7, 
        name: '智能家居套装', 
        price: 1599, 
        imgUrl: 'https://via.placeholder.com/300x300?text=SmartHome',
        description: '包含智能音箱、智能灯泡、智能插座等多个设备',
        brand: 'HomeSmart',
        category: 1,
        stock: 20,
        discount: 0.85,
        createdAt: '2023-06-25'
      },
      { 
        id: 8, 
        name: '电动牙刷', 
        price: 399, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Toothbrush',
        description: '声波震动电动牙刷，5种清洁模式，续航30天',
        brand: 'CleanTech',
        category: 5,
        stock: 45,
        discount: 1,
        createdAt: '2023-07-30'
      },
      { 
        id: 9, 
        name: '智能空气净化器', 
        price: 1299, 
        imgUrl: 'https://via.placeholder.com/300x300?text=AirPurifier',
        description: 'HEPA过滤，去除99.97%的污染物，适用于25-30平方米房间',
        brand: 'PureAir',
        category: 5,
        stock: 18,
        discount: 0.9,
        createdAt: '2023-08-05'
      },
      { 
        id: 10, 
        name: '便携式蓝牙音箱', 
        price: 259, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Speaker',
        description: '10W输出功率，防水防尘，续航12小时',
        brand: 'SoundPlus',
        category: 1,
        stock: 60,
        discount: 0.85,
        createdAt: '2023-07-25'
      },
      { 
        id: 11, 
        name: '智能体重秤', 
        price: 159, 
        imgUrl: 'https://via.placeholder.com/300x300?text=Scale',
        description: '测量体重、BMI、体脂率等多项数据，支持APP同步',
        brand: 'HealthTech',
        category: 5,
        stock: 75,
        discount: 1,
        createdAt: '2023-08-10'
      },
      { 
        id: 12, 
        name: '超薄移动电源', 
        price: 199, 
        imgUrl: 'https://via.placeholder.com/300x300?text=PowerBank',
        description: '10000mAh容量，支持18W快充，体积小巧',
        brand: 'PowerPlus',
        category: 1,
        stock: 50,
        discount: 0.8,
        createdAt: '2023-08-15'
      }
    ]
    
    // 确保所有产品都有图片
    products.value = productData.map(product => ({
      ...product,
      imgUrl: product.imgUrl || DEFAULT_PRODUCT_IMAGE
    }))
    
    totalProducts.value = products.value.length
    
    // 更新价格范围
    if (products.value.length > 0) {
      const prices = products.value.map(product => product.price)
      filters.value.priceRange = [
        Math.min(...prices),
        Math.max(...prices)
      ]
      selectedPriceRange.value = [...filters.value.priceRange]
    }
    
    loading.value = false
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败，请稍后重试')
    loading.value = false
  }
}

// 切换排序方式
const changeSortBy = (sortBy) => {
  filters.value.sortBy = sortBy
}

// 添加到购物车
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

// 查看商品详情
const viewProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 计算折扣价格
const calculateDiscountPrice = (price, discount) => {
  return (price * (discount || 1)).toFixed(2)
}

// 重置筛选条件
const resetFilters = () => {
  selectedBrands.value = []
  selectedPriceRange.value = [...filters.value.priceRange]
  filters.value.inStock = false
  filters.value.sortBy = 'default'
}

// 执行搜索
const doSearch = () => {
  if (!searchQuery.value.trim()) {
    return
  }
  
  router.push({
    path: '/category',
    query: { q: searchQuery.value.trim() }
  })
}

// 切换分页
const changePage = (page) => {
  currentPage.value = page
  window.scrollTo(0, 0)
}

// 初始化
onMounted(async () => {
  await loadCategories()
  getCategoryAndSearchFromRoute()
  await loadProducts()
})

// 监听路由变化，重新加载数据
watch(() => route.params.id, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    getCategoryAndSearchFromRoute()
    loadProducts()
    currentPage.value = 1
  }
})

watch(() => route.query.q, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    getCategoryAndSearchFromRoute()
    loadProducts()
    currentPage.value = 1
  }
})
</script>

<template>
  <div class="category-container container">
    <div class="page-header">
      <h1 v-if="currentCategory">{{ currentCategory.name }}</h1>
      <h1 v-else-if="searchQuery">搜索结果: {{ searchQuery }}</h1>
      <h1 v-else>所有商品</h1>
      
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索商品"
          @keyup.enter="doSearch"
          clearable
        >
          <template #append>
            <el-button @click="doSearch" :icon="Search"></el-button>
          </template>
        </el-input>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else class="category-content">
      <!-- 筛选侧边栏 -->
      <div class="filter-sidebar">
        <div class="filter-header">
          <h3><el-icon><Filter /></el-icon> 筛选条件</h3>
          <el-button text @click="resetFilters">重置</el-button>
        </div>
        
        <!-- 分类列表 -->
        <div class="filter-section">
          <h4>商品分类</h4>
          <ul class="category-list">
            <li 
              v-for="category in categories" 
              :key="category.id"
              :class="{ active: currentCategory && currentCategory.id === category.id }"
              @click="router.push(`/category/${category.id}`)"
            >
              <span>{{ category.name }}</span>
            </li>
          </ul>
        </div>
        
        <!-- 价格范围 -->
        <div class="filter-section">
          <h4>价格范围</h4>
          <div class="price-range">
            <el-slider
              v-model="selectedPriceRange"
              range
              :min="filters.priceRange[0]"
              :max="filters.priceRange[1]"
              :step="10"
            />
            <div class="price-inputs">
              <el-input-number
                v-model="selectedPriceRange[0]"
                :min="filters.priceRange[0]"
                :max="selectedPriceRange[1]"
                size="small"
                controls-position="right"
              ></el-input-number>
              <span>-</span>
              <el-input-number
                v-model="selectedPriceRange[1]"
                :min="selectedPriceRange[0]"
                :max="filters.priceRange[1]"
                size="small"
                controls-position="right"
              ></el-input-number>
            </div>
          </div>
        </div>
        
        <!-- 品牌 -->
        <div class="filter-section" v-if="availableBrands.length > 0">
          <h4>品牌</h4>
          <el-checkbox-group v-model="selectedBrands">
            <el-checkbox 
              v-for="brand in availableBrands" 
              :key="brand" 
              :label="brand"
            >
              {{ brand }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        
        <!-- 库存状态 -->
        <div class="filter-section">
          <h4>库存状态</h4>
          <el-checkbox v-model="filters.inStock">只显示有库存商品</el-checkbox>
        </div>
      </div>
      
      <!-- 商品列表 -->
      <div class="product-list-container">
        <!-- 排序工具栏 -->
        <div class="sort-toolbar">
          <div class="product-count">
            共找到 <span>{{ filteredProducts.length }}</span> 件商品
          </div>
          
          <div class="sort-options">
            <span>排序: </span>
            <el-radio-group v-model="filters.sortBy" size="small">
              <el-radio-button label="default">默认</el-radio-button>
              <el-radio-button label="price-asc">价格 <el-icon><ArrowUp /></el-icon></el-radio-button>
              <el-radio-button label="price-desc">价格 <el-icon><ArrowDown /></el-icon></el-radio-button>
              <el-radio-button label="newest">最新</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        
        <!-- 无商品提示 -->
        <div v-if="filteredProducts.length === 0" class="empty-products">
          <el-empty description="暂无相关商品">
            <el-button type="primary" @click="resetFilters">重置筛选条件</el-button>
          </el-empty>
        </div>
        
        <!-- 商品列表 -->
        <div v-else class="product-list">
          <el-row :gutter="20">
            <el-col 
              :xs="12" 
              :sm="8" 
              :md="6" 
              :lg="6" 
              v-for="product in currentPageProducts" 
              :key="product.id"
              class="product-col"
            >
              <div class="product-card">
                <div class="product-image" @click="viewProductDetail(product.id)">
                  <el-image 
                    :src="getProxyImageUrl(product.imgUrl)" 
                    fit="cover"
                  >
                    <template #error>
                      <div class="image-placeholder">加载失败</div>
                    </template>
                  </el-image>
                  <div v-if="product.discount && product.discount < 1" class="discount-badge">
                    {{ (product.discount * 10).toFixed(1) }}折
                  </div>
                </div>
                
                <div class="product-info">
                  <div class="product-brand" v-if="product.brand">{{ product.brand }}</div>
                  <h3 class="product-title" @click="viewProductDetail(product.id)">{{ product.name }}</h3>
                  <div class="product-price">
                    <span class="current-price">¥{{ calculateDiscountPrice(product.price, product.discount) }}</span>
                    <span v-if="product.discount && product.discount < 1" class="original-price">¥{{ product.price.toFixed(2) }}</span>
                  </div>
                  
                  <div class="product-stock" :class="{ 'out-of-stock': product.stock <= 0 }">
                    {{ product.stock > 0 ? `库存: ${product.stock}` : '暂时缺货' }}
                  </div>
                  
                  <div class="product-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      :icon="ShoppingCart" 
                      @click="addToCart(product)"
                      :disabled="product.stock <= 0"
                    >
                      加入购物车
                    </el-button>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="totalPages > 1">
          <el-pagination
            layout="prev, pager, next"
            :total="filteredProducts.length"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="changePage"
            background
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.search-box {
  width: 250px;
}

.loading-container {
  margin: 40px 0;
}

.category-content {
  display: flex;
  gap: 20px;
}

/* 筛选侧边栏 */
.filter-sidebar {
  width: 250px;
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 5px;
}

.filter-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-section:last-child {
  border-bottom: none;
}

.filter-section h4 {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px 0;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-list li {
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  font-size: 14px;
}

.category-list li:hover {
  color: #409EFF;
}

.category-list li.active {
  color: #409EFF;
  font-weight: bold;
}

.price-range {
  margin-top: 15px;
}

.price-inputs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}

.price-inputs span {
  color: #999;
}

/* 商品列表区域 */
.product-list-container {
  flex: 1;
}

.sort-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-count {
  color: #666;
  font-size: 14px;
}

.product-count span {
  color: #409EFF;
  font-weight: bold;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-options span {
  color: #666;
  font-size: 14px;
}

.product-list {
  margin-bottom: 20px;
}

.product-col {
  margin-bottom: 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  position: relative;
  cursor: pointer;
}

.el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 14px;
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #f56c6c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.product-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-brand {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.product-title {
  font-size: 16px;
  color: #333;
  margin: 0 0 10px 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.4;
  height: 45px;
}

.product-title:hover {
  color: #409EFF;
}

.product-price {
  margin-bottom: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 8px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.product-stock {
  font-size: 13px;
  color: #67c23a;
  margin-bottom: 15px;
}

.out-of-stock {
  color: #f56c6c;
}

.product-actions {
  margin-top: auto;
}

/* 空商品提示样式 */
.empty-products {
  text-align: center;
  padding: 60px 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 分页容器 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .category-content {
    flex-direction: column;
  }
  
  .filter-sidebar {
    width: 100%;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .search-box {
    width: 100%;
  }
  
  .sort-toolbar {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .product-count {
    margin-bottom: 10px;
  }
}

@media (max-width: 576px) {
  .sort-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    width: 100%;
  }
  
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
}
</style> 