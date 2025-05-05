<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(true)

// 活动数据
const flashSaleActivities = ref([])
const groupBuyActivities = ref([])
const newUserActivities = ref([])
const promotionActivities = ref([])

// 获取秒杀活动
const fetchFlashSales = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟数据
    flashSaleActivities.value = [
      {
        id: 1,
        title: '每日限时秒杀',
        subTitle: '每天10点、14点、20点准时开抢',
        imageUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        status: 'ongoing',
        endTime: new Date(Date.now() + 3600000).toISOString(), // 一小时后
        products: [
          { id: 101, name: '智能手表', originalPrice: 899, salePrice: 599, stock: 30, sold: 70 },
          { id: 102, name: '无线耳机', originalPrice: 299, salePrice: 199, stock: 15, sold: 85 },
          { id: 103, name: '蓝牙音箱', originalPrice: 499, salePrice: 299, stock: 50, sold: 50 }
        ]
      }
    ]
  } catch (error) {
    console.error('获取秒杀活动失败:', error)
    ElMessage.error('获取秒杀活动失败')
  }
}

// 获取拼团活动
const fetchGroupBuys = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟数据
    groupBuyActivities.value = [
      {
        id: 2,
        title: '超值拼团',
        subTitle: '邀请好友拼团，享受更多优惠',
        imageUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        status: 'ongoing',
        groups: [
          { id: 201, productName: '家用榨汁机', originalPrice: 399, groupPrice: 299, minMembers: 3, joined: 2 },
          { id: 202, productName: '手持吸尘器', originalPrice: 599, groupPrice: 449, minMembers: 5, joined: 3 }
        ]
      }
    ]
  } catch (error) {
    console.error('获取拼团活动失败:', error)
    ElMessage.error('获取拼团活动失败')
  }
}

// 获取新人专享
const fetchNewUserActivities = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟数据
    newUserActivities.value = [
      {
        id: 3,
        title: '新人专享礼包',
        subTitle: '新用户专属优惠，错过不再有',
        imageUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        status: 'ongoing',
        benefits: [
          { id: 301, type: 'coupon', name: '满100减15优惠券', value: 15 },
          { id: 302, type: 'coupon', name: '满200减30优惠券', value: 30 },
          { id: 303, type: 'gift', name: '新人专享礼品', desc: '随机精美小礼品一份' }
        ]
      }
    ]
  } catch (error) {
    console.error('获取新人活动失败:', error)
    ElMessage.error('获取新人活动失败')
  }
}

// 获取优惠专场
const fetchPromotions = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟数据
    promotionActivities.value = [
      {
        id: 4,
        title: '夏季清凉特惠',
        subTitle: '精选夏季商品，低至5折',
        imageUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        status: 'ongoing',
        endTime: new Date(Date.now() + 7 * 24 * 3600000).toISOString(), // 七天后
        link: '/promotion/summer'
      },
      {
        id: 5,
        title: '数码产品专场',
        subTitle: '精选数码好物，满减优惠',
        imageUrl: 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp',
        status: 'upcoming',
        startTime: new Date(Date.now() + 2 * 24 * 3600000).toISOString(), // 两天后
        link: '/promotion/digital'
      }
    ]
  } catch (error) {
    console.error('获取优惠专场失败:', error)
    ElMessage.error('获取优惠专场失败')
  }
}

// 跳转到活动详情
const goToActivity = (type, id) => {
  router.push(`/activity/${type}/${id}`)
}

// 跳转到商品详情
const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 加载所有活动数据
const loadAllActivities = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchFlashSales(),
      fetchGroupBuys(),
      fetchNewUserActivities(),
      fetchPromotions()
    ])
  } catch (error) {
    console.error('加载活动数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  loadAllActivities()
})
</script>

<template>
  <div class="activity-container container">
    <div class="page-header">
      <h1>活动中心</h1>
      <el-button @click="goHome" plain>返回首页</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>
    
    <div v-else class="activity-content">
      <!-- 秒杀活动 -->
      <div class="activity-section">
        <div class="section-header">
          <h2>限时秒杀</h2>
          <el-button type="text" @click="goToActivity('flash-sale', 0)">查看更多</el-button>
        </div>
        
        <div v-if="flashSaleActivities.length === 0" class="empty-section">
          <el-empty description="暂无秒杀活动" />
        </div>
        
        <div v-else class="flash-sale-cards">
          <div 
            v-for="activity in flashSaleActivities" 
            :key="activity.id" 
            class="activity-card"
          >
            <div class="card-image">
              <el-image :src="activity.imageUrl" fit="cover">
                <template #error>
                  <div class="image-placeholder">活动图片</div>
                </template>
              </el-image>
            </div>
            <div class="card-content">
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.subTitle }}</p>
              <div class="countdown">
                <span>距结束: 01:45:30</span>
              </div>
              
              <div class="product-slider">
                <div 
                  v-for="product in activity.products" 
                  :key="product.id" 
                  class="product-item"
                  @click="goToProduct(product.id)"
                >
                  <div class="product-image">
                    <el-image src="https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp" fit="cover">
                      <template #error>
                        <div class="image-placeholder">商品图片</div>
                      </template>
                    </el-image>
                  </div>
                  <div class="product-info">
                    <div class="product-name">{{ product.name }}</div>
                    <div class="product-price">
                      <span class="sale-price">¥{{ product.salePrice }}</span>
                      <span class="original-price">¥{{ product.originalPrice }}</span>
                    </div>
                    <el-progress 
                      :percentage="Math.round(product.sold / (product.stock + product.sold) * 100)" 
                      :format="() => `已抢${product.sold}件`"
                      status="success"
                    />
                    <el-button type="danger" size="small">立即抢购</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 拼团活动 -->
      <div class="activity-section">
        <div class="section-header">
          <h2>超值拼团</h2>
          <el-button type="text" @click="goToActivity('group-buy', 0)">查看更多</el-button>
        </div>
        
        <div v-if="groupBuyActivities.length === 0" class="empty-section">
          <el-empty description="暂无拼团活动" />
        </div>
        
        <div v-else class="group-buy-cards">
          <div 
            v-for="activity in groupBuyActivities" 
            :key="activity.id" 
            class="activity-card"
          >
            <div class="card-image">
              <el-image :src="activity.imageUrl" fit="cover">
                <template #error>
                  <div class="image-placeholder">活动图片</div>
                </template>
              </el-image>
            </div>
            <div class="card-content">
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.subTitle }}</p>
              
              <div class="group-list">
                <div 
                  v-for="group in activity.groups" 
                  :key="group.id" 
                  class="group-item"
                >
                  <div class="group-product">{{ group.productName }}</div>
                  <div class="group-price">
                    <span class="group-price-value">¥{{ group.groupPrice }}</span>
                    <span class="original-price">¥{{ group.originalPrice }}</span>
                  </div>
                  <div class="group-status">
                    已有{{ group.joined }}人，还差{{ group.minMembers - group.joined }}人成团
                  </div>
                  <el-button type="warning" size="small">参加拼团</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 新人专享 -->
      <div class="activity-section">
        <div class="section-header">
          <h2>新人专享</h2>
        </div>
        
        <div v-if="newUserActivities.length === 0" class="empty-section">
          <el-empty description="暂无新人活动" />
        </div>
        
        <div v-else class="new-user-cards">
          <div 
            v-for="activity in newUserActivities" 
            :key="activity.id" 
            class="activity-card"
          >
            <div class="card-image">
              <el-image :src="activity.imageUrl" fit="cover">
                <template #error>
                  <div class="image-placeholder">活动图片</div>
                </template>
              </el-image>
            </div>
            <div class="card-content">
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.subTitle }}</p>
              
              <div class="benefit-list">
                <div 
                  v-for="benefit in activity.benefits" 
                  :key="benefit.id" 
                  class="benefit-item"
                >
                  <div class="benefit-name">{{ benefit.name }}</div>
                  <div class="benefit-desc" v-if="benefit.desc">{{ benefit.desc }}</div>
                  <el-button type="success" size="small">立即领取</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 优惠专场 -->
      <div class="activity-section">
        <div class="section-header">
          <h2>优惠专场</h2>
          <el-button type="text" @click="goToActivity('promotion', 0)">查看更多</el-button>
        </div>
        
        <div v-if="promotionActivities.length === 0" class="empty-section">
          <el-empty description="暂无优惠专场" />
        </div>
        
        <div v-else class="promotion-grid">
          <div 
            v-for="activity in promotionActivities" 
            :key="activity.id" 
            class="promotion-card"
            @click="router.push(activity.link)"
          >
            <div class="promotion-image">
              <el-image :src="activity.imageUrl" fit="cover">
                <template #error>
                  <div class="image-placeholder">专场图片</div>
                </template>
              </el-image>
              <div class="promotion-status" :class="activity.status">
                {{ activity.status === 'ongoing' ? '进行中' : '即将开始' }}
              </div>
            </div>
            <div class="promotion-info">
              <h3>{{ activity.title }}</h3>
              <p>{{ activity.subTitle }}</p>
              <div class="promotion-time">
                {{ activity.status === 'ongoing' 
                   ? '结束时间: ' + new Date(activity.endTime).toLocaleDateString() 
                   : '开始时间: ' + new Date(activity.startTime).toLocaleDateString() }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-container {
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

.activity-section {
  margin-bottom: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.empty-section {
  padding: 40px 0;
  text-align: center;
}

.activity-card {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.activity-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 200px;
  height: 200px;
  overflow: hidden;
}

.card-content {
  flex: 1;
  padding: 15px;
}

.card-content h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.card-content p {
  color: #606266;
  margin-bottom: 15px;
}

.countdown {
  margin-bottom: 15px;
  color: #f56c6c;
  font-weight: bold;
}

.product-slider {
  display: flex;
  overflow-x: auto;
  gap: 15px;
  padding-bottom: 10px;
}

.product-item {
  width: 150px;
  cursor: pointer;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
  transition: all 0.3s;
}

.product-item:hover {
  border-color: #409eff;
}

.product-image {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
}

.product-name {
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  margin-bottom: 10px;
}

.sale-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
  margin-right: 5px;
}

.original-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 12px;
}

.group-list, .benefit-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.group-item, .benefit-item {
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.group-product, .benefit-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.group-price, .benefit-desc {
  margin-bottom: 10px;
}

.group-price-value {
  color: #ff9900;
  font-weight: bold;
  font-size: 16px;
  margin-right: 5px;
}

.group-status {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.promotion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.promotion-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
}

.promotion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.promotion-image {
  height: 180px;
  position: relative;
}

.promotion-status {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.promotion-status.ongoing {
  background-color: #67c23a;
}

.promotion-status.upcoming {
  background-color: #e6a23c;
}

.promotion-info {
  padding: 15px;
}

.promotion-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.promotion-info p {
  color: #606266;
  margin-bottom: 10px;
  font-size: 14px;
}

.promotion-time {
  color: #909399;
  font-size: 12px;
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

@media (max-width: 768px) {
  .activity-card {
    flex-direction: column;
  }
  
  .card-image {
    width: 100%;
    height: 150px;
  }
  
  .promotion-grid {
    grid-template-columns: 1fr;
  }
}
</style> 