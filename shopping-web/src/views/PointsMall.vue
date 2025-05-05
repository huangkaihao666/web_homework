<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(true)
const activeCategory = ref('all')
const userPoints = ref(8500) // 模拟用户当前积分

// 积分商品分类
const categories = ref([
  { id: 'all', name: '全部商品' },
  { id: 'digital', name: '数码电子' },
  { id: 'daily', name: '日用百货' },
  { id: 'food', name: '零食饮料' },
  { id: 'beauty', name: '美妆个护' },
  { id: 'coupon', name: '优惠券' }
])

// 模拟积分商品数据
const pointsProducts = ref([
  {
    id: 1,
    name: '无线蓝牙耳机',
    image: 'https://via.placeholder.com/200x200?text=Headphones',
    originalPrice: 299,
    points: 3000,
    category: 'digital',
    stock: 99,
    exchanged: 120,
    description: '高音质立体声，降噪通话，长续航，舒适佩戴'
  },
  {
    id: 2,
    name: '便携式移动电源',
    image: 'https://via.placeholder.com/200x200?text=PowerBank',
    originalPrice: 159,
    points: 1500,
    category: 'digital',
    stock: 75,
    exchanged: 236,
    description: '20000mAh大容量，双向快充，多设备兼容'
  },
  {
    id: 3,
    name: '智能手环',
    image: 'https://via.placeholder.com/200x200?text=SmartBand',
    originalPrice: 199,
    points: 2000,
    category: 'digital',
    stock: 50,
    exchanged: 95,
    description: '心率监测，睡眠分析，运动记录，防水设计'
  },
  {
    id: 4,
    name: '保温杯',
    image: 'https://via.placeholder.com/200x200?text=ThermosCup',
    originalPrice: 89,
    points: 800,
    category: 'daily',
    stock: 120,
    exchanged: 358,
    description: '304不锈钢内胆，双层真空，24小时保温保冷'
  },
  {
    id: 5,
    name: '多功能厨房剪刀',
    image: 'https://via.placeholder.com/200x200?text=KitchenScissors',
    originalPrice: 39,
    points: 400,
    category: 'daily',
    stock: 200,
    exchanged: 412,
    description: '不锈钢材质，锋利耐用，多功能设计'
  },
  {
    id: 6,
    name: '进口巧克力礼盒',
    image: 'https://via.placeholder.com/200x200?text=Chocolate',
    originalPrice: 68,
    points: 700,
    category: 'food',
    stock: 85,
    exchanged: 275,
    description: '精选可可豆，多种口味，精美包装'
  },
  {
    id: 7,
    name: '坚果零食大礼包',
    image: 'https://via.placeholder.com/200x200?text=Nuts',
    originalPrice: 78,
    points: 800,
    category: 'food',
    stock: 65,
    exchanged: 189,
    description: '多种坚果混合，无添加，健康美味'
  },
  {
    id: 8,
    name: '面部护理套装',
    image: 'https://via.placeholder.com/200x200?text=SkinCare',
    originalPrice: 199,
    points: 2000,
    category: 'beauty',
    stock: 45,
    exchanged: 132,
    description: '温和不刺激，深层清洁，补水保湿'
  },
  {
    id: 9,
    name: '洗发护发套装',
    image: 'https://via.placeholder.com/200x200?text=Shampoo',
    originalPrice: 138,
    points: 1400,
    category: 'beauty',
    stock: 60,
    exchanged: 157,
    description: '植物萃取，修复受损，滋养发丝'
  },
  {
    id: 10,
    name: '¥50元无门槛优惠券',
    image: 'https://via.placeholder.com/200x200?text=Coupon50',
    originalPrice: 50,
    points: 500,
    category: 'coupon',
    stock: 500,
    exchanged: 623,
    description: '全场通用，无金额限制，有效期30天'
  },
  {
    id: 11,
    name: '¥100元满500减优惠券',
    image: 'https://via.placeholder.com/200x200?text=Coupon100',
    originalPrice: 100,
    points: 800,
    category: 'coupon',
    stock: 300,
    exchanged: 452,
    description: '订单满500元可用，有效期15天'
  },
  {
    id: 12,
    name: '¥200元满1000减优惠券',
    image: 'https://via.placeholder.com/200x200?text=Coupon200',
    originalPrice: 200,
    points: 1500,
    category: 'coupon',
    stock: 200,
    exchanged: 318,
    description: '订单满1000元可用，有效期15天'
  }
])

// 积分兑换记录
const exchangeRecords = ref([
  {
    id: 1001,
    productName: '无线蓝牙耳机',
    points: 3000,
    status: '待发货',
    exchangeTime: '2023-07-10 15:30:45'
  },
  {
    id: 1002,
    productName: '¥50元无门槛优惠券',
    points: 500,
    status: '已发放',
    exchangeTime: '2023-07-05 09:25:12'
  },
  {
    id: 1003,
    productName: '保温杯',
    points: 800,
    status: '已完成',
    exchangeTime: '2023-06-28 14:18:36'
  }
])

// 筛选商品
const filteredProducts = computed(() => {
  if (activeCategory.value === 'all') {
    return pointsProducts.value
  } else {
    return pointsProducts.value.filter(product => product.category === activeCategory.value)
  }
})

// 兑换商品
const exchangeProduct = (product) => {
  if (userPoints.value < product.points) {
    ElMessage.error('积分不足，无法兑换该商品')
    return
  }
  
  if (product.stock <= 0) {
    ElMessage.error('该商品库存不足，请选择其他商品')
    return
  }
  
  // 模拟兑换逻辑
  ElMessage.success(`已成功兑换商品：${product.name}`)
  userPoints.value -= product.points
  
  // 实际项目中这里会调用API进行兑换
  // 并更新兑换记录和商品库存
}

// 切换分类
const changeCategory = (categoryId) => {
  activeCategory.value = categoryId
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 初始化
onMounted(() => {
  // 实际项目中这里会调用API获取用户积分和商品数据
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<template>
  <div class="points-mall-container container">
    <div class="page-header">
      <h1>积分商城</h1>
      <el-button @click="goHome" plain>返回首页</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>
    
    <div v-else>
      <!-- 积分信息 -->
      <div class="user-points-info">
        <div class="points-card">
          <div class="points-title">我的积分</div>
          <div class="points-value">{{ userPoints }}</div>
          <div class="points-tips">
            <router-link to="/member/points">
              <span>查看积分明细</span>
              <i class="el-icon-arrow-right"></i>
            </router-link>
          </div>
        </div>
        
        <div class="points-card">
          <div class="points-title">兑换记录</div>
          <div class="exchange-records">
            <div v-if="exchangeRecords.length === 0" class="no-records">
              暂无兑换记录
            </div>
            <div v-else class="record-list">
              <div v-for="record in exchangeRecords" :key="record.id" class="record-item">
                <div class="record-product">{{ record.productName }}</div>
                <div class="record-info">
                  <span class="record-points">{{ record.points }}积分</span>
                  <span class="record-time">{{ record.exchangeTime }}</span>
                </div>
                <div class="record-status" :class="'status-' + record.status.toLowerCase()">
                  {{ record.status }}
                </div>
              </div>
            </div>
          </div>
          <div class="points-tips">
            <router-link to="/member/exchange-records">
              <span>查看所有记录</span>
              <i class="el-icon-arrow-right"></i>
            </router-link>
          </div>
        </div>
        
        <div class="points-card">
          <div class="points-title">获取更多积分</div>
          <div class="get-points-ways">
            <div class="way-item">
              <i class="el-icon-shopping-cart-full"></i>
              <div class="way-title">购物消费</div>
              <div class="way-desc">每消费1元获得1积分</div>
            </div>
            <div class="way-item">
              <i class="el-icon-chat-dot-square"></i>
              <div class="way-title">评价商品</div>
              <div class="way-desc">每次评价获得5-10积分</div>
            </div>
            <div class="way-item">
              <i class="el-icon-medal"></i>
              <div class="way-title">参与活动</div>
              <div class="way-desc">参与指定活动获取额外积分</div>
            </div>
          </div>
          <div class="points-tips">
            <router-link to="/help-center/points">
              <span>了解积分规则</span>
              <i class="el-icon-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- 积分商品区域 -->
      <div class="points-products-section">
        <div class="section-header">
          <h2>积分兑换</h2>
        </div>
        
        <!-- 分类选项卡 -->
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
        
        <!-- 商品列表 -->
        <div class="products-grid">
          <div 
            v-for="product in filteredProducts" 
            :key="product.id"
            class="product-card"
          >
            <div class="product-image">
              <img :src="product.image" :alt="product.name">
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-description">{{ product.description }}</div>
              <div class="product-details">
                <div class="product-points">
                  <span class="points-value">{{ product.points }}</span>
                  <span class="points-label">积分</span>
                </div>
                <div class="product-price">
                  <span class="price-label">单价: </span>
                  <span class="price-value">¥{{ product.originalPrice }}</span>
                </div>
              </div>
              <div class="product-exchange-info">
                <div class="product-stock">
                  <span>库存: {{ product.stock }}</span>
                  <span class="exchange-count">已兑换: {{ product.exchanged }}</span>
                </div>
                <el-button 
                  type="primary" 
                  size="small" 
                  :disabled="userPoints < product.points || product.stock <= 0"
                  @click="exchangeProduct(product)"
                >
                  立即兑换
                </el-button>
              </div>
            </div>
          </div>
          
          <div v-if="filteredProducts.length === 0" class="no-products">
            <el-empty description="暂无相关商品" />
          </div>
        </div>
      </div>
      
      <!-- 积分商城说明 -->
      <div class="points-mall-description">
        <div class="description-header">
          <h3>积分商城说明</h3>
        </div>
        <div class="description-content">
          <p>1. 积分兑换商品，仅消耗积分，无需额外支付费用</p>
          <p>2. 积分兑换后不可取消或退还积分</p>
          <p>3. 实物商品将在5个工作日内发货，优惠券将立即发放到账户中</p>
          <p>4. 如有疑问，请联系客服400-123-4567</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.points-mall-container {
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

/* 积分信息卡片区域 */
.user-points-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.points-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
}

.points-title {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.points-value {
  font-size: 36px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 15px;
}

.points-tips {
  margin-top: 15px;
  text-align: right;
}

.points-tips a {
  color: #909399;
  font-size: 14px;
  text-decoration: none;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.points-tips a:hover {
  color: #409eff;
}

.points-tips i {
  margin-left: 5px;
}

/* 兑换记录 */
.exchange-records {
  height: 150px;
  overflow-y: auto;
}

.no-records {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.record-product {
  font-weight: 500;
  color: #303133;
}

.record-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
}

.record-status {
  font-size: 12px;
  font-weight: 500;
}

.status-待发货 {
  color: #e6a23c;
}

.status-已发放 {
  color: #409eff;
}

.status-已完成 {
  color: #67c23a;
}

/* 获取积分的方式 */
.get-points-ways {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.way-item {
  text-align: center;
  padding: 15px 0;
}

.way-item i {
  font-size: 24px;
  color: #409eff;
  margin-bottom: 10px;
}

.way-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.way-desc {
  font-size: 12px;
  color: #606266;
}

/* 积分商品区域 */
.points-products-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

/* 分类选项卡 */
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

/* 商品列表 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
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
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-name {
  margin: 0 0 10px 0;
  font-size: 16px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.product-description {
  color: #606266;
  font-size: 12px;
  margin-bottom: 10px;
  height: 36px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.product-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 15px;
}

.product-points {
  display: flex;
  flex-direction: column;
}

.points-value {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
  line-height: 1;
}

.points-label {
  font-size: 12px;
  color: #909399;
}

.product-price {
  font-size: 12px;
  color: #909399;
}

.product-exchange-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-stock {
  font-size: 12px;
  color: #909399;
}

.exchange-count {
  margin-left: 10px;
}

.no-products {
  grid-column: 1 / -1;
  padding: 40px 0;
}

/* 商城说明 */
.points-mall-description {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.description-header {
  margin-bottom: 15px;
}

.description-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.description-content {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.description-content p {
  margin: 5px 0;
}

@media (max-width: 992px) {
  .user-points-info {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .get-points-ways {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .user-points-info {
    grid-template-columns: 1fr;
  }
  
  .exchange-records {
    height: auto;
    max-height: 150px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style> 