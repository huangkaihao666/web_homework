<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="(item, index) in statisticsData" :key="index">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <el-icon><component :is="item.icon"></component></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近7天销售额</span>
            </div>
          </template>
          <div class="chart-container" ref="salesChartRef"></div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>商品类别分布</span>
            </div>
          </template>
          <div class="chart-container" ref="categoryChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row>
      <el-col :span="24">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近订单</span>
              <el-button type="primary" size="small" @click="goToOrders">查看全部</el-button>
            </div>
          </template>
          <el-table :data="recentOrders" style="width: 100%">
            <el-table-column prop="id" label="订单号" width="100" />
            <el-table-column prop="user" label="客户名称" width="120" />
            <el-table-column prop="amount" label="订单金额">
              <template #default="scope">
                ¥{{ scope.row.amount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="date" label="下单时间" width="180" />
            <el-table-column prop="status" label="订单状态" width="120">
              <template #default="scope">
                <el-tag :type="getOrderStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="viewOrderDetail(scope.row.id)"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ShoppingCart,
  User,
  Goods,
  Money
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import OrderAPI from '@/api/order'
import { ElMessage } from 'element-plus'

const router = useRouter()
const salesChartRef = ref(null)
const categoryChartRef = ref(null)
let salesChart = null
let categoryChart = null

// 统计数据
const statisticsData = ref([
  { title: '订单总数', value: 0, icon: 'ShoppingCart', color: '#409eff' },
  { title: '用户总数', value: 0, icon: 'User', color: '#67c23a' },
  { title: '商品总数', value: 0, icon: 'Goods', color: '#e6a23c' },
  { title: '销售总额', value: '¥0', icon: 'Money', color: '#f56c6c' }
])

// 最近订单
const recentOrders = ref([])

// 最近7天销售额数据
const salesData = ref({
  dates: [],
  values: []
})

// 商品类别分布数据
const categoryData = ref([])

const getOrderStatusType = (status) => {
  const statusMap = {
    '已完成': 'success',
    '已发货': 'info',
    '已付款': 'primary',
    '待付款': 'warning',
    '已取消': 'danger'
  }
  return statusMap[status] || 'info'
}

const goToOrders = () => {
  router.push('/orders')
}

const viewOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`)
}

// 初始化销售额折线图
const initSalesChart = () => {
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br/>销售额: ¥{c}'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: salesData.value.dates
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      series: [
        {
          name: '销售额',
          type: 'line',
          smooth: true,
          data: salesData.value.values,
          itemStyle: {
            color: '#409eff'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.7)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ])
          }
        }
      ]
    }
    
    salesChart.setOption(option)
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      salesChart && salesChart.resize()
    })
  }
}

// 初始化商品类别分布饼图
const initCategoryChart = () => {
  if (categoryChartRef.value) {
    categoryChart = echarts.init(categoryChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: categoryData.value.map(item => item.name)
      },
      series: [
        {
          name: '商品类别',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: categoryData.value
        }
      ]
    }
    
    categoryChart.setOption(option)
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
      categoryChart && categoryChart.resize()
    })
  }
}

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 获取统计数据
    const statsRes = await OrderAPI.getDashboardStats()
    console.log('statsRes', statsRes)
    if (statsRes) {
      statisticsData.value[0].value = statsRes.totalOrders || 0
      statisticsData.value[1].value = statsRes.totalUsers || 0
      statisticsData.value[2].value = statsRes.totalProducts || 0
      statisticsData.value[3].value = `¥${(statsRes.totalSales || 0).toLocaleString()}`
    }
    
    // 获取最近7天销售数据
    const salesRes = await OrderAPI.getRecentSales()
    console.log('salesRes', salesRes)
    if (salesRes) {
      salesData.value.dates = salesRes.map(item => item.date)
      salesData.value.values = salesRes.map(item => item.amount)
      
      // 更新图表
      if (salesChart) {
        salesChart.setOption({
          xAxis: { data: salesData.value.dates },
          series: [{ data: salesData.value.values }]
        })
      }
    }
    
    // 获取商品类别分布
    const categoryRes = await OrderAPI.getCategoryDistribution()
    if (categoryRes) {
      categoryData.value = categoryRes
      
      // 更新图表
      if (categoryChart) {
        categoryChart.setOption({
          legend: { data: categoryData.value.map(item => item.name) },
          series: [{ data: categoryData.value }]
        })
      }
    }
    
    // 获取最近订单
    const ordersRes = await OrderAPI.getRecentOrders()
    if (ordersRes) {
      recentOrders.value = ordersRes
    }
  } catch (error) {
    console.error('获取仪表盘数据失败', error)
    ElMessage.error('获取数据失败，请稍后重试')
    
    // 使用模拟数据
    useMockData()
  }
}

// 使用模拟数据
const useMockData = () => {
  // 统计数据
  statisticsData.value = [
    { title: '订单总数', value: 5298, icon: 'ShoppingCart', color: '#409eff' },
    { title: '用户总数', value: 3720, icon: 'User', color: '#67c23a' },
    { title: '商品总数', value: 1862, icon: 'Goods', color: '#e6a23c' },
    { title: '销售总额', value: '¥296,253', icon: 'Money', color: '#f56c6c' }
  ]
  
  // 最近订单
  recentOrders.value = [
    { id: 100001, user: '张三', amount: 198.50, date: '2024-05-01 14:23:12', status: '已完成' },
    { id: 100002, user: '李四', amount: 598.00, date: '2024-05-02 09:45:30', status: '已发货' },
    { id: 100003, user: '王五', amount: 1299.00, date: '2024-05-02 16:12:08', status: '待付款' },
    { id: 100004, user: '赵六', amount: 399.00, date: '2024-05-03 11:24:56', status: '已付款' },
    { id: 100005, user: '钱七', amount: 799.50, date: '2024-05-03 18:35:42', status: '已完成' }
  ]
  
  // 最近7天销售额数据
  salesData.value = {
    dates: ['5月1日', '5月2日', '5月3日', '5月4日', '5月5日', '5月6日', '5月7日'],
    values: [3500, 4200, 3800, 5100, 4600, 5800, 6200]
  }
  
  // 商品类别分布数据
  categoryData.value = [
    { value: 335, name: '电子产品' },
    { value: 310, name: '服装' },
    { value: 234, name: '食品' },
    { value: 135, name: '书籍' },
    { value: 248, name: '其他' }
  ]
}

onMounted(async () => {
  // 初始化图表
  initSalesChart()
  initCategoryChart()
  
  // 获取数据
  await fetchDashboardData()
})

onUnmounted(() => {
  // 销毁图表实例，避免内存泄漏
  if (salesChart) {
    salesChart.dispose()
    salesChart = null
  }
  
  if (categoryChart) {
    categoryChart.dispose()
    categoryChart = null
  }
  
  // 移除事件监听
  window.removeEventListener('resize', () => {
    salesChart && salesChart.resize()
    categoryChart && categoryChart.resize()
  })
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px 0;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 15px;
  color: #fff;
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-title {
  color: #666;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card, .table-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 350px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 