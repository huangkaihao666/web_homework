<template>
  <div class="product-list-container">
    <div class="page-header">
      <h2>商品列表</h2>
      <el-button type="primary" @click="addProduct">添加商品</el-button>
    </div>
    
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="输入商品名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="searchForm.category" placeholder="选择分类" clearable>
            <el-option 
              v-for="category in categories" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table
      v-loading="loading"
      :data="products"
      style="width: 100%"
      border
    >
      <el-table-column type="index" width="50" />
      <el-table-column prop="id" label="商品ID" width="80" />
      <el-table-column label="商品图片" width="120">
        <template #default="scope">
          <el-image 
            :src="scope.row.imgUrl" 
            :preview-src-list="[scope.row.imgUrl]"
            style="width: 60px; height: 60px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="categoryName" label="分类" width="120" />
      <el-table-column prop="price" label="价格" width="120">
        <template #default="scope">
          ¥{{ scope.row.price.toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(scope.row)"
            active-text="上架"
            inactive-text="下架"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editProduct(scope.row.id)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="deleteProduct(scope.row.id)">
            删除
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const products = ref([])
const categories = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  name: '',
  category: ''
})

// 加载商品数据
const loadProducts = () => {
  loading.value = true
  // 实际项目中应该从API获取数据
  // 这里使用模拟数据
  setTimeout(() => {
    products.value = [
      {
        id: 1,
        name: '商品1',
        categoryId: 1,
        categoryName: '电子产品',
        price: 299,
        stock: 100,
        imgUrl: 'https://via.placeholder.com/200x200?text=Product+1',
        status: 1
      },
      {
        id: 2,
        name: '商品2',
        categoryId: 2,
        categoryName: '手机',
        price: 599,
        stock: 50,
        imgUrl: 'https://via.placeholder.com/200x200?text=Product+2',
        status: 1
      },
      {
        id: 3,
        name: '商品3',
        categoryId: 3,
        categoryName: '服装',
        price: 99,
        stock: 200,
        imgUrl: 'https://via.placeholder.com/200x200?text=Product+3',
        status: 0
      },
      {
        id: 4,
        name: '商品4',
        categoryId: 4,
        categoryName: '食品',
        price: 29,
        stock: 500,
        imgUrl: 'https://via.placeholder.com/200x200?text=Product+4',
        status: 1
      },
      {
        id: 5,
        name: '商品5',
        categoryId: 5,
        categoryName: '礼品',
        price: 199,
        stock: 30,
        imgUrl: 'https://via.placeholder.com/200x200?text=Product+5',
        status: 1
      }
    ]
    
    // 设置分页数据
    total.value = 100 // 假设总数为100
    
    loading.value = false
  }, 500)
}

// 加载分类数据
const loadCategories = () => {
  // 实际项目中应该从API获取数据
  categories.value = [
    { id: 1, name: '电子产品' },
    { id: 2, name: '手机' },
    { id: 3, name: '服装' },
    { id: 4, name: '食品' },
    { id: 5, name: '礼品' },
    { id: 6, name: '运动' }
  ]
}

// 搜索商品
const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.category = ''
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  currentPage.value = page
  loadProducts()
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadProducts()
}

// 添加商品
const addProduct = () => {
  router.push('/products/add')
}

// 编辑商品
const editProduct = (id) => {
  router.push(`/products/edit/${id}`)
}

// 删除商品
const deleteProduct = (id) => {
  ElMessageBox.confirm(
    '确认删除该商品吗？删除后不可恢复。',
    '警告',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 实际项目中应该调用API删除商品
      ElMessage.success('删除成功')
      loadProducts()
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 商品上下架状态变更
const handleStatusChange = (row) => {
  const statusText = row.status === 1 ? '上架' : '下架'
  // 实际项目中应该调用API更新商品状态
  ElMessage.success(`商品已${statusText}`)
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.product-list-container {
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