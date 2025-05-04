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
  const statusMap = {
    'PENDING_PAYMENT': '待付款',
    'PENDING_SHIPMENT': '待发货',
    'SHIPPED': '已发货',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

// 获取订单状态标签类型
const getOrderStatusType = (status) => {
  const typeMap = {
    'PENDING_PAYMENT': 'warning',
    'PENDING_SHIPMENT': 'info',
    'SHIPPED': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  }
  return typeMap[status] || ''
}

// 加载订单数据
const loadOrders = () => {
  loading.value = true
  // 实际项目中应该从API获取数据
  // 这里使用模拟数据
  setTimeout(() => {
    orders.value = [
      {
        id: 100001,
        userId: 2,
        totalAmount: 697,
        status: 'COMPLETED',
        createdAt: '2024-05-01 14:23:12',
        shippingAddress: '北京市海淀区清华大学计算机科学与技术系',
        contactPhone: '13812345678'
      },
      {
        id: 100002,
        userId: 2,
        totalAmount: 599,
        status: 'SHIPPED',
        createdAt: '2024-05-02 09:45:30',
        shippingAddress: '上海市浦东新区张江高科技园区',
        contactPhone: '13912345678'
      },
      {
        id: 100003,
        userId: 2,
        totalAmount: 997,
        status: 'PENDING_PAYMENT',
        createdAt: '2024-05-02 16:12:08',
        shippingAddress: '广州市天河区',
        contactPhone: '13712345678'
      },
      {
        id: 100004,
        userId: 3,
        totalAmount: 299,
        status: 'PENDING_SHIPMENT',
        createdAt: '2024-05-03 10:23:45',
        shippingAddress: '深圳市南山区科技园',
        contactPhone: '13612345678'
      },
      {
        id: 100005,
        userId: 4,
        totalAmount: 899,
        status: 'PENDING_SHIPMENT',
        createdAt: '2024-05-03 14:34:56',
        shippingAddress: '杭州市西湖区',
        contactPhone: '13512345678'
      }
    ]
    
    // 设置分页数据
    total.value = 100 // 假设总数为100
    
    loading.value = false
  }, 500)
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
const confirmShip = () => {
  if (!shipForm.company || !shipForm.trackingNumber) {
    ElMessage.warning('请填写物流公司和物流单号')
    return
  }
  
  // 实际项目中应该调用API更新订单状态
  const index = orders.value.findIndex(o => o.id === currentOrderId.value)
  if (index !== -1) {
    orders.value[index].status = 'SHIPPED'
    ElMessage.success('订单发货成功')
    shipDialogVisible.value = false
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