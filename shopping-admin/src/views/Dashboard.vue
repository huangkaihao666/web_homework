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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ShoppingCart,
  User,
  Goods,
  Money
} from '@element-plus/icons-vue'

const router = useRouter()

// 统计数据
const statisticsData = ref([
  { title: '订单总数', value: 5298, icon: 'ShoppingCart', color: '#409eff' },
  { title: '用户总数', value: 3720, icon: 'User', color: '#67c23a' },
  { title: '商品总数', value: 1862, icon: 'Goods', color: '#e6a23c' },
  { title: '销售总额', value: '¥296,253', icon: 'Money', color: '#f56c6c' }
])

// 最近订单
const recentOrders = ref([
  { id: 100001, user: '张三', amount: 198.50, date: '2024-05-01 14:23:12', status: '已完成' },
  { id: 100002, user: '李四', amount: 598.00, date: '2024-05-02 09:45:30', status: '已发货' },
  { id: 100003, user: '王五', amount: 1299.00, date: '2024-05-02 16:12:08', status: '待付款' },
  { id: 100004, user: '赵六', amount: 399.00, date: '2024-05-03 11:24:56', status: '已付款' },
  { id: 100005, user: '钱七', amount: 799.50, date: '2024-05-03 18:35:42', status: '已完成' }
])

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

onMounted(() => {
  // 这里可以通过API获取真实的数据
  console.log('Dashboard组件已挂载，可以调用API获取数据')
  
  // 实际项目中，这里应该引入图表库（如ECharts）来绘制图表
  // 下面是示例代码，需要引入相应的库才能工作
  /*
  const salesChart = echarts.init(salesChartRef.value);
  salesChart.setOption({
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    series: [{ data: [150, 230, 224, 218, 135, 147, 260], type: 'line' }]
  });
  
  const categoryChart = echarts.init(categoryChartRef.value);
  categoryChart.setOption({
    series: [{
      type: 'pie',
      radius: '70%',
      data: [
        { value: 335, name: '电子产品' },
        { value: 310, name: '服装' },
        { value: 234, name: '食品' },
        { value: 135, name: '书籍' },
        { value: 1548, name: '其他' }
      ]
    }]
  });
  */
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