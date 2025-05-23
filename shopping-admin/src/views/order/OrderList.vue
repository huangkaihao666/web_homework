<template>
  <div class="order-list-container">
    <div class="page-header">
      <h2>订单列表</h2>
    </div>
    
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderId" placeholder="输入订单编号" clearable></el-input>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option 
              v-for="item in orderStatuses" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table
      v-loading="loading"
      :data="orders"
      style="width: 100%"
      border
    >
      <el-table-column prop="id" label="订单编号" width="180" />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="totalAmount" label="订单金额" width="120">
        <template #default="scope">
          ¥{{ scope.row.totalAmount.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="120">
        <template #default="scope">
          <el-tag :type="getOrderStatusType(scope.row.status)">
            {{ getOrderStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="下单时间" width="180" />
      <el-table-column prop="contactPhone" label="联系电话" width="140" />
      <el-table-column prop="shippingAddress" label="收货地址" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewOrderDetail(scope.row.id)">
            查看
          </el-button>
          <el-button 
            v-if="scope.row.status === 'PENDING_SHIPMENT'"
            type="success" 
            size="small" 
            @click="shipOrder(scope.row.id)"
          >
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="pagination-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    
    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="物流公司">
          <el-select v-model="shipForm.company" placeholder="请选择物流公司">
            <el-option label="顺丰速运" value="shunfeng"></el-option>
            <el-option label="中通快递" value="zhongtong"></el-option>
            <el-option label="圆通速递" value="yuantong"></el-option>
            <el-option label="韵达快递" value="yunda"></el-option>
            <el-option label="申通快递" value="shentong"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="shipForm.trackingNumber" placeholder="请输入物流单号"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="shipForm.remark" type="textarea" placeholder="可选"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="shipDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmShip">确认发货</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import orderApi from '@/api/order'

const router = useRouter()
const loading = ref(false)
const orders = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const shipDialogVisible = ref(false)
const currentOrderId = ref(null)

const orderStatuses = [
  { value: 'PENDING_PAYMENT', label: '待付款' },
  { value: 'PENDING_SHIPMENT', label: '待发货' },
  { value: 'SHIPPED', label: '已发货' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'CANCELLED', label: '已取消' }
]

const searchForm = reactive({
  orderId: '',
  status: '',
  dateRange: []
})

const shipForm = reactive({
  company: '',
  trackingNumber: '',
  remark: ''
})

// 获取订单状态文本
const getOrderStatusText = (status) => {
  // 处理后端返回的中文状态
  if (status === '待付款') return '待付款';
  if (status === '已付款') return '已付款';
  if (status === '待发货') return '待发货';
  if (status === '已发货') return '已发货';
  if (status === '已完成') return '已完成';
  if (status === '已取消') return '已取消';
  
  // 处理前端定义的英文状态
  const statusMap = {
    'PENDING_PAYMENT': '待付款',
    'PAID': '已付款', 
    'PENDING_SHIPMENT': '待发货',
    'SHIPPED': '已发货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态标签类型
const getOrderStatusType = (status) => {
  // 直接处理中文状态
  if (status === '待付款') return 'warning';
  if (status === '已付款') return 'info';
  if (status === '待发货') return 'info';
  if (status === '已发货') return 'primary';
  if (status === '已完成') return 'success';
  if (status === '已取消') return 'danger';
  
  // 处理前端定义的英文状态
  const typeMap = {
    'PENDING_PAYMENT': 'warning',
    'PAID': 'info',
    'PENDING_SHIPMENT': 'info',
    'SHIPPED': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  }
  return typeMap[status] || ''
}

// 加载订单数据
const loadOrders = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      orderId: searchForm.orderId || undefined,
      status: searchForm.status || undefined,
      startDate: searchForm.dateRange?.[0] || undefined,
      endDate: searchForm.dateRange?.[1] || undefined
    }
    
    const res = await orderApi.getOrders(params)
    orders.value = res
    total.value = Array.isArray(res) ? res.length : 0
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索订单
const handleSearch = () => {
  currentPage.value = 1
  loadOrders()
}

// 重置搜索
const resetSearch = () => {
  searchForm.orderId = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  loadOrders()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadOrders()
}

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`)
}

// 发货对话框
const shipOrder = (orderId) => {
  currentOrderId.value = orderId
  shipForm.company = ''
  shipForm.trackingNumber = ''
  shipForm.remark = ''
  shipDialogVisible.value = true
}

// 确认发货
const confirmShip = async () => {
  if (!shipForm.company || !shipForm.trackingNumber) {
    ElMessage.warning('请填写物流公司和物流单号')
    return
  }
  
  try {
    await orderApi.shipOrder(currentOrderId.value, {
      company: shipForm.company,
      trackingNumber: shipForm.trackingNumber,
      remark: shipForm.remark
    })
    
    ElMessage.success('订单发货成功')
    shipDialogVisible.value = false
    loadOrders() // 重新加载订单列表
  } catch (error) {
    console.error('订单发货失败:', error)
    ElMessage.error('订单发货失败')
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-list-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 18px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 