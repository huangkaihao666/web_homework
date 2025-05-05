<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, ShoppingCart, Share, Star, Grid, List as ListIcon } from '@element-plus/icons-vue'
import { getProxyImageUrl, DEFAULT_PRODUCT_IMAGE } from '@/utils/image'

const router = useRouter()
const loading = ref(true)
const viewMode = ref('grid') // 'grid' 或 'list'
const activeTab = ref('favorites') // 'favorites' 或 'wishlist'
const searchQuery = ref('')

// 用户收藏的商品
const favorites = ref([
  {
    id: 1,
    productId: 101,
    name: '智能手表 2023款',
    price: 1299,
    imgUrl: 'https://via.placeholder.com/300x300?text=Smartwatch',
    description: '多功能智能手表，支持心率监测、血氧检测、睡眠监测等功能',
    addTime: '2023-05-15',
    stock: 35,
    discount: 0.9
  },
  {
    id: 2,
    productId: 102,
    name: '无线蓝牙耳机',
    price: 499,
    imgUrl: 'https://via.placeholder.com/300x300?text=Headphone',
    description: '降噪蓝牙耳机，续航时间长达30小时，支持快充',
    addTime: '2023-06-20',
    stock: 56,
    discount: 0.85
  },
  {
    id: 3,
    productId: 103,
    name: '轻薄笔记本电脑',
    price: 5699,
    imgUrl: 'https://via.placeholder.com/300x300?text=Laptop',
    description: '13.3英寸高清屏幕，8GB内存，512GB固态硬盘',
    addTime: '2023-07-05',
    stock: 10,
    discount: 0.95
  },
  {
    id: 4,
    productId: 104,
    name: '机械键盘',
    price: 369,
    imgUrl: 'https://via.placeholder.com/300x300?text=Keyboard',
    description: '87键机械键盘，青轴，RGB背光',
    addTime: '2023-07-15',
    stock: 86,
    discount: 1
  },
  {
    id: 5,
    productId: 105,
    name: '人体工学椅',
    price: 999,
    imgUrl: 'https://via.placeholder.com/300x300?text=Chair',
    description: '高品质办公椅，舒适透气，支持腰部调节',
    addTime: '2023-08-01',
    stock: 15,
    discount: 0.8
  }
])

// 心愿单商品
const wishlist = ref([
  {
    id: 6,
    productId: 201,
    name: '4K高清投影仪',
    price: 3699,
    imgUrl: 'https://via.placeholder.com/300x300?text=Projector',
    description: '家用投影仪，支持4K解析度，亮度2000ANSI流明',
    addTime: '2023-06-10',
    stock: 8,
    discount: 0.9
  },
  {
    id: 7,
    productId: 202,
    name: '智能家居套装',
    price: 1599,
    imgUrl: 'https://via.placeholder.com/300x300?text=SmartHome',
    description: '包含智能音箱、智能灯泡、智能插座等多个设备',
    addTime: '2023-06-25',
    stock: 20,
    discount: 0.85
  },
  {
    id: 8,
    productId: 203,
    name: '电动牙刷',
    price: 399,
    imgUrl: 'https://via.placeholder.com/300x300?text=Toothbrush',
    description: '声波震动电动牙刷，5种清洁模式，续航30天',
    addTime: '2023-07-30',
    stock: 45,
    discount: 1
  }
])

// 根据当前标签页获取要显示的商品列表
const displayProducts = computed(() => {
  const list = activeTab.value === 'favorites' ? favorites.value : wishlist.value
  
  if (!searchQuery.value) {
    return list
  }
  
  const query = searchQuery.value.toLowerCase()
  return list.filter(item => 
    item.name.toLowerCase().includes(query) || 
    item.description.toLowerCase().includes(query)
  )
})

// 计算实际价格（考虑折扣）
const calculatePrice = (originalPrice, discount) => {
  return (originalPrice * discount).toFixed(2)
}

// 切换视图模式
const changeViewMode = (mode) => {
  viewMode.value = mode
}

// 切换标签页
const changeTab = (tab) => {
  activeTab.value = tab
}

// 搜索商品
const searchItems = () => {
  // 已通过计算属性自动筛选
}

// 移除收藏/心愿单商品
const removeItem = (item) => {
  ElMessageBox.confirm(
    `确定要从${activeTab.value === 'favorites' ? '收藏夹' : '心愿单'}中移除 "${item.name}" 吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    if (activeTab.value === 'favorites') {
      favorites.value = favorites.value.filter(i => i.id !== item.id)
    } else {
      wishlist.value = wishlist.value.filter(i => i.id !== item.id)
    }
    ElMessage.success('移除成功')
  }).catch(() => {
    // 用户取消操作
  })
}

// 添加到购物车
const addToCart = (item) => {
  // 实际项目中这里会调用API添加到购物车
  ElMessage.success(`已将 ${item.name} 添加到购物车`)
}

// 查看商品详情
const viewProductDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 分享商品
const shareProduct = (item) => {
  // 实际项目中这里会实现分享功能
  ElMessage.success(`分享链接已复制到剪贴板`)
}

// 模拟数据加载
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 实际项目中这里会从API获取收藏和心愿单数据
    // favorites.value = await api.getFavorites()
    // wishlist.value = await api.getWishlist()
    
    loading.value = false
  } catch (error) {
    console.error('加载收藏数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
    loading.value = false
  }
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="favorites-container container">
    <div class="page-header">
      <h1>我的收藏</h1>
      <el-button @click="goHome" plain>返回首页</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else class="favorites-content">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="tabs">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'favorites' }"
            @click="changeTab('favorites')"
          >
            收藏夹 ({{ favorites.length }})
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'wishlist' }"
            @click="changeTab('wishlist')"
          >
            心愿单 ({{ wishlist.length }})
          </div>
        </div>
        
        <div class="tools">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索收藏商品"
              @keyup.enter="searchItems"
              clearable
            >
              <template #append>
                <el-button @click="searchItems">
                  搜索
                </el-button>
              </template>
            </el-input>
          </div>
          
          <div class="view-mode">
            <el-tooltip content="网格视图">
              <el-button 
                :type="viewMode === 'grid' ? 'primary' : ''" 
                :icon="Grid" 
                circle 
                @click="changeViewMode('grid')"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="列表视图">
              <el-button 
                :type="viewMode === 'list' ? 'primary' : ''" 
                :icon="ListIcon" 
                circle 
                @click="changeViewMode('list')"
              ></el-button>
            </el-tooltip>
          </div>
        </div>
      </div>
      
      <!-- 无商品提示 -->
      <div v-if="displayProducts.length === 0" class="empty-favorites">
        <el-empty :description="`您的${activeTab === 'favorites' ? '收藏夹' : '心愿单'}还没有商品`">
          <el-button type="primary" @click="router.push('/')">去购物</el-button>
        </el-empty>
      </div>
      
      <!-- 网格视图 -->
      <div v-else-if="viewMode === 'grid'" class="grid-view">
        <el-row :gutter="20">
          <el-col 
            :xs="12" 
            :sm="8" 
            :md="6" 
            :lg="6" 
            v-for="item in displayProducts" 
            :key="item.id"
            class="grid-item-col"
          >
            <div class="grid-item">
              <div class="item-image" @click="viewProductDetail(item.productId)">
                <el-image 
                  :src="getProxyImageUrl(item.imgUrl || DEFAULT_PRODUCT_IMAGE)" 
                  fit="cover"
                >
                  <template #error>
                    <div class="image-placeholder">加载失败</div>
                  </template>
                </el-image>
                <div v-if="item.discount < 1" class="discount-badge">
                  {{ (item.discount * 10).toFixed(1) }}折
                </div>
              </div>
              
              <div class="item-info">
                <h3 class="item-title" @click="viewProductDetail(item.productId)">{{ item.name }}</h3>
                <div class="item-price">
                  <span class="current-price">¥{{ calculatePrice(item.price, item.discount) }}</span>
                  <span v-if="item.discount < 1" class="original-price">¥{{ item.price.toFixed(2) }}</span>
                </div>
                <div class="item-stock" :class="{ 'low-stock': item.stock <= 10 }">
                  库存: {{ item.stock }}
                </div>
                <div class="item-actions">
                  <el-button type="primary" size="small" :icon="ShoppingCart" @click="addToCart(item)">
                    加入购物车
                  </el-button>
                  <el-button size="small" :icon="Delete" @click="removeItem(item)"></el-button>
                  <el-button size="small" :icon="Share" @click="shareProduct(item)"></el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 列表视图 -->
      <div v-else class="list-view">
        <div 
          v-for="item in displayProducts" 
          :key="item.id"
          class="list-item"
        >
          <div class="item-image" @click="viewProductDetail(item.productId)">
            <el-image 
              :src="getProxyImageUrl(item.imgUrl || DEFAULT_PRODUCT_IMAGE)" 
              fit="cover"
            >
              <template #error>
                <div class="image-placeholder">加载失败</div>
              </template>
            </el-image>
            <div v-if="item.discount < 1" class="discount-badge">
              {{ (item.discount * 10).toFixed(1) }}折
            </div>
          </div>
          
          <div class="item-content">
            <div class="item-header">
              <h3 class="item-title" @click="viewProductDetail(item.productId)">{{ item.name }}</h3>
              <div class="item-time">收藏于: {{ item.addTime }}</div>
            </div>
            
            <div class="item-desc">{{ item.description }}</div>
            
            <div class="item-footer">
              <div class="item-price-stock">
                <div class="item-price">
                  <span class="current-price">¥{{ calculatePrice(item.price, item.discount) }}</span>
                  <span v-if="item.discount < 1" class="original-price">¥{{ item.price.toFixed(2) }}</span>
                </div>
                <div class="item-stock" :class="{ 'low-stock': item.stock <= 10 }">
                  库存: {{ item.stock }}
                </div>
              </div>
              
              <div class="item-actions">
                <el-button type="primary" size="small" :icon="ShoppingCart" @click="addToCart(item)">
                  加入购物车
                </el-button>
                <el-button size="small" :icon="Delete" @click="removeItem(item)">移除</el-button>
                <el-button size="small" :icon="Share" @click="shareProduct(item)">分享</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-container {
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

.loading-container {
  margin: 40px 0;
}

.favorites-content {
  min-height: 400px;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.tabs {
  display: flex;
  gap: 20px;
}

.tab-item {
  cursor: pointer;
  padding: 5px 0;
  position: relative;
  font-size: 16px;
  color: #666;
}

.tab-item.active {
  color: #409EFF;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409EFF;
}

.tools {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-box {
  width: 250px;
}

.view-mode {
  display: flex;
  gap: 10px;
}

/* 网格视图样式 */
.grid-view {
  margin-top: 20px;
}

.grid-item-col {
  margin-bottom: 20px;
}

.grid-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.grid-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.item-image {
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

.item-info {
  padding: 15px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
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

.item-title:hover {
  color: #409EFF;
}

.item-price {
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

.item-stock {
  font-size: 13px;
  color: #67c23a;
  margin-bottom: 15px;
}

.low-stock {
  color: #e6a23c;
}

.item-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

/* 列表视图样式 */
.list-view {
  margin-top: 20px;
}

.list-item {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.list-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.list-item .item-image {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.list-item .item-title {
  font-size: 18px;
  height: auto;
  -webkit-line-clamp: 1;
  margin: 0;
}

.item-time {
  font-size: 13px;
  color: #999;
}

.item-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.5;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.item-price-stock {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.list-item .item-actions {
  margin-top: 0;
}

/* 空收藏提示样式 */
.empty-favorites {
  text-align: center;
  padding: 60px 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .list-item {
    flex-direction: column;
  }
  
  .list-item .item-image {
    width: 100%;
  }
  
  .item-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .item-price-stock {
    width: 100%;
  }
  
  .list-item .item-actions {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .tools {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  
  .search-box {
    width: 100%;
  }
  
  .view-mode {
    align-self: flex-end;
  }
}
</style> 