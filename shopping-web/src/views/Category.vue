<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const categoryData = ref([])
const subcategories = ref([])
const currentCategory = ref(null)
const products = ref([])
const totalProducts = ref(0)

// 分页参数
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 筛选条件
const filters = ref({
  priceRange: [0, 10000],
  brands: [],
  attributes: {},
  sort: 'default', // default, price-asc, price-desc, sales-desc, rating-desc
})

// 视图模式
const viewMode = ref('grid') // grid / list

// 获取当前分类ID
const categoryId = computed(() => {
  return route.params.id || route.query.id || null
})

// 监听分类ID变化
watch(categoryId, (newId) => {
  if (newId) {
    fetchCategoryData(newId)
  }
})

// 获取分类数据
const fetchCategoryData = async (id) => {
  loading.value = true
  try {
    const response = await axios.get(`/api/categories/${id}`)
    currentCategory.value = response.data
    
    // 获取子分类
    fetchSubcategories(id)
    
    // 获取分类下的商品
    fetchCategoryProducts()
  } catch (error) {
    console.error('获取分类数据失败:', error)
    ElMessage.error('获取分类数据失败')
    
    // 使用模拟数据
    useMockCategoryData(id)
  } finally {
    loading.value = false
  }
}

// 获取子分类
const fetchSubcategories = async (parentId) => {
  try {
    const response = await axios.get(`/api/categories?parentId=${parentId}`)
    subcategories.value = response.data
  } catch (error) {
    console.error('获取子分类失败:', error)
    
    // 使用模拟子分类数据
    useMockSubcategories(parentId)
  }
}

// 获取分类下的商品
const fetchCategoryProducts = async () => {
  loading.value = true
  
  // 构建查询参数
  const params = {
    page: pagination.value.page,
    limit: pagination.value.pageSize,
    sort: filters.value.sort,
    minPrice: filters.value.priceRange[0],
    maxPrice: filters.value.priceRange[1],
    categoryId: categoryId.value
  }
  
  // 添加品牌筛选
  if (filters.value.brands && filters.value.brands.length > 0) {
    params.brands = filters.value.brands.join(',')
  }
  
  // 添加其他属性筛选
  for (const [key, value] of Object.entries(filters.value.attributes)) {
    if (value) {
      params[`attr_${key}`] = Array.isArray(value) ? value.join(',') : value
    }
  }
  
  try {
    const response = await axios.get('/api/products', { params })
    products.value = response.data.items
    pagination.value.total = response.data.total
    totalProducts.value = response.data.total
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    
    // 使用模拟商品数据
    useMockProductsData()
  } finally {
    loading.value = false
  }
}

// 切换排序方式
const changeSorting = (sort) => {
  filters.value.sort = sort
  pagination.value.page = 1
  fetchCategoryProducts()
}

// 应用价格筛选
const applyPriceFilter = () => {
  pagination.value.page = 1
  fetchCategoryProducts()
}

// 应用品牌筛选
const applyBrandFilter = () => {
  pagination.value.page = 1
  fetchCategoryProducts()
}

// 应用属性筛选
const applyAttributeFilter = () => {
  pagination.value.page = 1
  fetchCategoryProducts()
}

// 切换视图模式
const toggleViewMode = (mode) => {
  viewMode.value = mode
}

// 跳转到商品详情
const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

// 添加到购物车
const addToCart = (product) => {
  try {
    // 这里可以调用添加到购物车的API
    // ...
    
    ElMessage.success('已添加到购物车')
  } catch (error) {
    console.error('添加到购物车失败:', error)
    ElMessage.error('添加到购物车失败')
  }
}

// 使用模拟分类数据
const useMockCategoryData = (id) => {
  const mockCategories = [
    { id: '1', name: '电子产品', parentId: null, level: 1, description: '各类电子产品' },
    { id: '2', name: '服装', parentId: null, level: 1, description: '时尚服装' },
    { id: '3', name: '家居', parentId: null, level: 1, description: '家居用品' },
    { id: '4', name: '食品', parentId: null, level: 1, description: '各类食品饮料' },
    { id: '5', name: '图书', parentId: null, level: 1, description: '图书与读物' }
  ]
  
  currentCategory.value = mockCategories.find(c => c.id === id) || mockCategories[0]
}

// 使用模拟子分类数据
const useMockSubcategories = (parentId) => {
  const mockSubcategories = {
    '1': [
      { id: '11', name: '手机', parentId: '1', level: 2 },
      { id: '12', name: '电脑', parentId: '1', level: 2 },
      { id: '13', name: '相机', parentId: '1', level: 2 },
      { id: '14', name: '耳机', parentId: '1', level: 2 },
      { id: '15', name: '智能设备', parentId: '1', level: 2 }
    ],
    '2': [
      { id: '21', name: '男装', parentId: '2', level: 2 },
      { id: '22', name: '女装', parentId: '2', level: 2 },
      { id: '23', name: '童装', parentId: '2', level: 2 },
      { id: '24', name: '运动装', parentId: '2', level: 2 }
    ],
    '3': [
      { id: '31', name: '客厅', parentId: '3', level: 2 },
      { id: '32', name: '卧室', parentId: '3', level: 2 },
      { id: '33', name: '厨房', parentId: '3', level: 2 },
      { id: '34', name: '卫浴', parentId: '3', level: 2 }
    ]
  }
  
  subcategories.value = mockSubcategories[parentId] || []
}

// 使用模拟商品数据
const useMockProductsData = () => {
  // 生成模拟商品数据
  const mockProducts = []
  const categories = {
    '1': '电子产品',
    '2': '服装',
    '3': '家居',
    '4': '食品',
    '5': '图书'
  }
  
  for (let i = 1; i <= 20; i++) {
    mockProducts.push({
      id: i,
      name: `商品 ${i}`,
      price: Math.floor(Math.random() * 1000) + 100,
      originalPrice: Math.floor(Math.random() * 1500) + 200,
      categoryId: categoryId.value || '1',
      categoryName: categories[categoryId.value] || '电子产品',
      sales: Math.floor(Math.random() * 1000),
      rating: (Math.random() * 5).toFixed(1),
      reviewCount: Math.floor(Math.random() * 200),
      stock: Math.floor(Math.random() * 100) + 10,
      imgUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
      description: '这是一个商品描述，可以包含商品的特点、用途等详细信息。'
    })
  }
  
  products.value = mockProducts
  pagination.value.total = 100
  totalProducts.value = 100
}

// 页面加载时获取数据
onMounted(() => {
  if (categoryId.value) {
    fetchCategoryData(categoryId.value)
  } else {
    // 没有分类ID，获取所有商品或首级分类
    fetchCategoryProducts()
  }
})
</script>

<template>
  <div class="category-container container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentCategory">{{ currentCategory.name }}</el-breadcrumb-item>
        <el-breadcrumb-item v-else>全部商品</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    
    <!-- 分类信息 -->
    <div class="category-info" v-if="currentCategory">
      <h1>{{ currentCategory.name }}</h1>
      <p v-if="currentCategory.description">{{ currentCategory.description }}</p>
      <p v-if="totalProducts > 0">共 {{ totalProducts }} 件商品</p>
    </div>
    
    <!-- 子分类导航 -->
    <div class="subcategories" v-if="subcategories.length > 0">
      <el-scrollbar>
        <div class="subcategory-list">
          <router-link 
            v-for="subcat in subcategories" 
            :key="subcat.id" 
            :to="`/category/${subcat.id}`"
            class="subcategory-item"
          >
            {{ subcat.name }}
          </router-link>
        </div>
      </el-scrollbar>
    </div>
    
    <!-- 商品筛选区 -->
    <div class="filter-container">
      <!-- 排序选项 -->
      <div class="sort-options">
        <span class="label">排序：</span>
        <el-radio-group v-model="filters.sort" @change="changeSorting">
          <el-radio-button label="default">默认</el-radio-button>
          <el-radio-button label="price-asc">价格从低到高</el-radio-button>
          <el-radio-button label="price-desc">价格从高到低</el-radio-button>
          <el-radio-button label="sales-desc">销量优先</el-radio-button>
          <el-radio-button label="rating-desc">好评优先</el-radio-button>
        </el-radio-group>
      </div>
      
      <!-- 价格筛选 -->
      <div class="price-filter">
        <span class="label">价格：</span>
        <el-slider
          v-model="filters.priceRange"
          range
          :min="0"
          :max="10000"
          :step="100"
          show-stops
        />
        <div class="price-inputs">
          <el-input-number v-model="filters.priceRange[0]" :min="0" :max="10000" size="small" />
          <span>-</span>
          <el-input-number v-model="filters.priceRange[1]" :min="0" :max="10000" size="small" />
          <el-button size="small" @click="applyPriceFilter">确定</el-button>
        </div>
      </div>
      
      <!-- 其他筛选条件可以根据需要添加 -->
    </div>
    
    <!-- 视图切换 -->
    <div class="view-controls">
      <div class="view-mode">
        <el-button 
          :type="viewMode === 'grid' ? 'primary' : 'default'" 
          size="small" 
          @click="toggleViewMode('grid')"
        >
          <i class="el-icon-s-grid"></i> 网格视图
        </el-button>
        <el-button 
          :type="viewMode === 'list' ? 'primary' : 'default'" 
          size="small" 
          @click="toggleViewMode('list')"
        >
          <i class="el-icon-menu"></i> 列表视图
        </el-button>
      </div>
      
      <div class="page-info">
        显示 {{ (pagination.page - 1) * pagination.pageSize + 1 }} - 
        {{ Math.min(pagination.page * pagination.pageSize, pagination.total) }} 
        共 {{ pagination.total }} 件商品
      </div>
    </div>
    
    <!-- 商品展示区 -->
    <div class="loading-container" v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else>
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="product-grid">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="product-card"
          @click="goToProduct(product.id)"
        >
          <div class="product-image">
            <el-image 
              :src="product.imgUrl" 
              fit="cover"
              :preview-src-list="[product.imgUrl]"
            >
              <template #error>
                <div class="image-placeholder">暂无图片</div>
              </template>
            </el-image>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-price">
              <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
              <span v-if="product.originalPrice > product.price" class="original-price">
                ¥{{ product.originalPrice.toFixed(2) }}
              </span>
            </div>
            <div class="product-meta">
              <span class="sales">销量 {{ product.sales }}</span>
              <span class="rating">
                <i class="el-icon-star-on"></i> {{ product.rating }}
              </span>
            </div>
            <el-button 
              type="primary" 
              size="small" 
              class="add-to-cart-btn"
              @click.stop="addToCart(product)"
            >
              加入购物车
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 列表视图 -->
      <div v-else class="product-list">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="product-list-item"
        >
          <div class="product-image" @click="goToProduct(product.id)">
            <el-image 
              :src="product.imgUrl" 
              fit="cover"
            >
              <template #error>
                <div class="image-placeholder">暂无图片</div>
              </template>
            </el-image>
          </div>
          <div class="product-details" @click="goToProduct(product.id)">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>
            <div class="product-meta">
              <span class="rating">
                <i class="el-icon-star-on"></i> {{ product.rating }}
              </span>
              <span class="reviews">{{ product.reviewCount }}条评价</span>
              <span class="sales">销量 {{ product.sales }}</span>
            </div>
          </div>
          <div class="product-actions">
            <div class="product-price">
              <span class="current-price">¥{{ product.price.toFixed(2) }}</span>
              <span v-if="product.originalPrice > product.price" class="original-price">
                ¥{{ product.originalPrice.toFixed(2) }}
              </span>
            </div>
            <div class="stock-info">库存: {{ product.stock }}件</div>
            <el-button 
              type="primary" 
              @click.stop="addToCart(product)"
            >
              加入购物车
            </el-button>
            <el-button 
              @click="goToProduct(product.id)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next, sizes, total"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          :current-page="pagination.page"
          :total="pagination.total"
          @size-change="size => { pagination.pageSize = size; pagination.page = 1; fetchCategoryProducts() }"
          @current-change="page => { pagination.page = page; fetchCategoryProducts() }"
        />
      </div>
      
      <!-- 无商品提示 -->
      <div v-if="products.length === 0" class="no-products">
        <el-empty description="暂无商品" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-container {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.category-info {
  margin-bottom: 20px;
}

.category-info h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.subcategories {
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  padding: 15px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.subcategory-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.subcategory-item {
  display: inline-block;
  padding: 5px 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  text-decoration: none;
  color: #606266;
  background-color: #fff;
  transition: all 0.3s;
}

.subcategory-item:hover {
  border-color: #409eff;
  color: #409eff;
}

.filter-container {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
}

.sort-options {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.price-filter {
  margin-bottom: 15px;
}

.label {
  margin-right: 10px;
  font-weight: bold;
}

.price-inputs {
  display: flex;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
  background-color: #fff;
  cursor: pointer;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 14px;
}

.product-info {
  padding: 15px;
}

.product-name {
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
  margin-bottom: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
  margin-left: 5px;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  color: #606266;
  font-size: 12px;
  margin-bottom: 10px;
}

.add-to-cart-btn {
  width: 100%;
}

.product-list {
  margin-bottom: 30px;
}

.product-list-item {
  display: flex;
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fff;
}

.product-list-item .product-image {
  width: 180px;
  height: 180px;
  margin-right: 20px;
  cursor: pointer;
}

.product-list-item .product-details {
  flex: 1;
  padding-right: 20px;
  cursor: pointer;
}

.product-list-item .product-name {
  font-size: 18px;
  margin-bottom: 10px;
  height: auto;
}

.product-list-item .product-description {
  margin-bottom: 15px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.product-list-item .product-meta {
  display: flex;
  gap: 15px;
}

.product-list-item .product-actions {
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
}

.product-list-item .product-price {
  text-align: right;
}

.product-list-item .current-price {
  font-size: 22px;
}

.stock-info {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.no-products {
  padding: 40px;
  text-align: center;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .product-list-item {
    flex-direction: column;
  }
  
  .product-list-item .product-image {
    width: 100%;
    height: 200px;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .product-list-item .product-details {
    padding-right: 0;
    margin-bottom: 15px;
  }
  
  .product-list-item .product-actions {
    width: 100%;
    align-items: flex-start;
  }
}
</style> 