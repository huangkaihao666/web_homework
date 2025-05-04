<template>
  <div class="product-list-container">
    <div class="page-header">
      <h2>产品列表</h2>
      <el-button type="primary" @click="handleAddProduct">
        <el-icon><Plus /></el-icon> 添加商品
      </el-button>
    </div>
    
    <!-- 搜索区域 -->
    <el-card class="search-area">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="searchForm.categoryId" placeholder="选择分类" clearable>
            <el-option 
              v-for="category in categoryOptions" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="价格区间">
          <el-input-number 
            v-model="searchForm.minPrice" 
            :min="0" 
            :precision="2" 
            placeholder="最低价"
            style="width: 120px"
          ></el-input-number>
          <span class="separator">至</span>
          <el-input-number 
            v-model="searchForm.maxPrice" 
            :min="0" 
            :precision="2" 
            placeholder="最高价"
            style="width: 120px"
          ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 表格区域 -->
    <el-card class="table-area" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image 
              :src="productImage" 
              :preview-src-list="[productImage]"
              fit="cover"
              style="width: 60px; height: 60px;"
            ></el-image>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="商品名称" min-width="200"></el-table-column>
        
        <el-table-column prop="categoryName" label="分类" width="120"></el-table-column>
        
        <el-table-column prop="price" label="售价" width="100">
          <template #default="scope">
            ¥{{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="scope">
            <span :class="{ 'low-stock': scope.row.stock < 10 }">{{ scope.row.stock }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="sales" label="销量" width="100"></el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ scope.row.status === 'ACTIVE' ? '上架中' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEditProduct(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === 'ACTIVE' ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === 'ACTIVE' ? '下架' : '上架' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteProduct(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑商品对话框 -->
    <el-dialog 
      v-model="productDialogVisible" 
      :title="isEditMode ? '编辑商品' : '添加商品'" 
      width="700px"
    >
      <el-form 
        ref="productFormRef" 
        :model="productForm" 
        :rules="productRules" 
        label-width="100px"
        style="max-height: 500px; overflow-y: auto;"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="请选择商品分类" style="width: 100%;">
            <el-option 
              v-for="category in categoryOptions" 
              :key="category.id" 
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品图片">
          <div class="upload-demo">
            <el-image 
              :src="productImage" 
              style="width: 100px; height: 100px; margin-bottom: 10px;"
            ></el-image>
            <el-upload
              class="upload-demo"
              action="/api/upload"
              :show-file-list="false"
              :before-upload="beforeUpload"
            >
              <el-button type="primary">点击上传</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  *仅支持jpg/png文件，最大不超过5MB
                </div>
              </template>
            </el-upload>
          </div>
        </el-form-item>
        
        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="productForm.price" 
            :min="0.01" 
            :precision="2" 
            :step="1"
            style="width: 100%;"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="商品库存" prop="stock">
          <el-input-number 
            v-model="productForm.stock" 
            :min="0" 
            :precision="0" 
            :step="1"
            style="width: 100%;"
          ></el-input-number>
        </el-form-item>
        
        <el-form-item label="商品描述" prop="description">
          <el-input 
            v-model="productForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入商品描述"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="商品规格">
          <div 
            v-for="(spec, index) in productForm.specifications" 
            :key="index" 
            class="spec-item"
          >
            <el-input v-model="spec.name" placeholder="规格名称" style="width: 200px;"></el-input>
            <el-input v-model="spec.value" placeholder="规格值" style="width: 200px; margin-left: 10px;"></el-input>
            <el-button 
              type="danger" 
              icon="Delete" 
              circle 
              size="small" 
              @click="removeSpec(index)"
              style="margin-left: 10px;"
            ></el-button>
          </div>
          <el-button type="primary" size="small" @click="addSpec" style="margin-top: 10px;">
            <el-icon><Plus /></el-icon> 添加规格
          </el-button>
        </el-form-item>
        
        <el-form-item label="上架状态" prop="status">
          <el-switch
            v-model="productStatusSwitch"
            active-text="上架"
            inactive-text="下架"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="productDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProductForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import productApi from '@/api/product'
import categoryApi from '@/api/category'

// 统一使用的图片地址
const productImage = 'https://gd-hbimg.huaban.com/1dfba91dd19657eb9d088e1be15e7319a46d5d6b8e0af-0vC9Ym_fw480webp';

// 基础数据
const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const categoryOptions = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  categoryId: '',
  minPrice: '',
  maxPrice: ''
})

// 商品表单相关
const productDialogVisible = ref(false)
const isEditMode = ref(false)
const productFormRef = ref(null)
const productForm = reactive({
  id: null,
  name: '',
  categoryId: '',
  image: '',
  price: 0,
  stock: 0,
  description: '',
  specifications: [],
  status: 'ACTIVE'
})

const productStatusSwitch = computed({
  get: () => productForm.status === 'ACTIVE',
  set: (val) => {
    productForm.status = val ? 'ACTIVE' : 'INACTIVE'
  }
})

// 表单验证规则
const productRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }]
}

// 加载商品分类
const loadCategories = async () => {
  try {
    const res = await categoryApi.getCategories()
    categoryOptions.value = res.data
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
    
    // 如果API调用失败，使用默认数据
    categoryOptions.value = [
      { id: 1, name: '手机数码' },
      { id: 2, name: '电脑办公' },
      { id: 3, name: '家用电器' },
      { id: 4, name: '服装鞋包' },
      { id: 5, name: '食品生鲜' }
    ]
  }
}

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      name: searchForm.name || undefined,
      categoryId: searchForm.categoryId || undefined,
      minPrice: searchForm.minPrice || undefined,
      maxPrice: searchForm.maxPrice || undefined
    }
    
    const res = await productApi.getProducts(params)
    
    // 替换所有产品图片为统一图片
    tableData.value = res.data.map(product => ({
      ...product,
      image: productImage
    }))
    
    total.value = res.total
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    
    // 如果API调用失败，使用默认数据
    const mockData = [
      {
        id: 1,
        name: '高端智能手机',
        categoryId: 1,
        categoryName: '手机数码',
        image: productImage,
        price: 4999,
        stock: 100,
        sales: 50,
        status: 'ACTIVE'
      },
      {
        id: 2,
        name: '超薄笔记本电脑',
        categoryId: 2,
        categoryName: '电脑办公',
        image: productImage,
        price: 6999,
        stock: 80,
        sales: 30,
        status: 'ACTIVE'
      },
      {
        id: 3,
        name: '智能家用空调',
        categoryId: 3,
        categoryName: '家用电器',
        image: productImage,
        price: 3299,
        stock: 50,
        sales: 20,
        status: 'ACTIVE'
      },
      {
        id: 4,
        name: '时尚休闲男装',
        categoryId: 4,
        categoryName: '服装鞋包',
        image: productImage,
        price: 299,
        stock: 200,
        sales: 100,
        status: 'ACTIVE'
      },
      {
        id: 5,
        name: '有机新鲜水果',
        categoryId: 5,
        categoryName: '食品生鲜',
        image: productImage,
        price: 99,
        stock: 5,
        sales: 80,
        status: 'ACTIVE'
      }
    ]
    
    // 模拟筛选逻辑
    let filteredData = [...mockData]
    
    if (searchForm.name) {
      filteredData = filteredData.filter(item => 
        item.name.toLowerCase().includes(searchForm.name.toLowerCase())
      )
    }
    
    if (searchForm.categoryId) {
      filteredData = filteredData.filter(item => 
        item.categoryId === searchForm.categoryId
      )
    }
    
    if (searchForm.minPrice) {
      filteredData = filteredData.filter(item => 
        item.price >= searchForm.minPrice
      )
    }
    
    if (searchForm.maxPrice) {
      filteredData = filteredData.filter(item => 
        item.price <= searchForm.maxPrice
      )
    }
    
    tableData.value = filteredData
    total.value = filteredData.length
  } finally {
    loading.value = false
  }
}

// 查询商品
const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.name = ''
  searchForm.categoryId = ''
  searchForm.minPrice = ''
  searchForm.maxPrice = ''
  handleSearch()
}

// 切换页码
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadProducts()
}

// 切换每页显示数量
const handleSizeChange = (val) => {
  pageSize.value = val
  loadProducts()
}

// 添加商品
const handleAddProduct = () => {
  isEditMode.value = false
  
  // 重置表单
  Object.assign(productForm, {
    id: null,
    name: '',
    categoryId: '',
    image: productImage,
    price: 0,
    stock: 0,
    description: '',
    specifications: [],
    status: 'ACTIVE'
  })
  
  productDialogVisible.value = true
}

// 编辑商品
const handleEditProduct = async (product) => {
  isEditMode.value = true
  
  try {
    loading.value = true
    
    // 加载商品详情
    const productDetail = await productApi.getProduct(product.id)
    
    Object.assign(productForm, {
      id: productDetail.data.id,
      name: productDetail.data.name,
      categoryId: productDetail.data.categoryId,
      image: productImage, // 使用统一的图片
      price: productDetail.data.price,
      stock: productDetail.data.stock,
      description: productDetail.data.description,
      specifications: productDetail.data.specifications || [],
      status: productDetail.data.status
    })
    
    productDialogVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
    
    // 如果API调用失败，使用表格中的数据
    Object.assign(productForm, {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      image: productImage,
      price: product.price,
      stock: product.stock,
      description: product.description || '商品详细描述',
      specifications: [
        { name: '品牌', value: '某品牌' },
        { name: '型号', value: 'ABC-123' }
      ],
      status: product.status
    })
    
    productDialogVisible.value = true
  } finally {
    loading.value = false
  }
}

// 提交商品表单
const submitProductForm = async () => {
  productFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      loading.value = true
      
      const formData = { ...productForm }
      
      if (isEditMode.value) {
        // 更新商品
        await productApi.updateProduct(formData.id, formData)
        ElMessage.success('商品更新成功')
      } else {
        // 创建商品
        await productApi.createProduct(formData)
        ElMessage.success('商品添加成功')
      }
      
      productDialogVisible.value = false
      loadProducts() // 重新加载商品列表
    } catch (error) {
      console.error('保存商品失败:', error)
      ElMessage.error('保存商品失败')
    } finally {
      loading.value = false
    }
  })
}

// 上传图片前的处理
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5
  
  if (!isImage) {
    ElMessage.error('上传文件只能是图片格式!')
    return false
  }
  
  if (!isLt5M) {
    ElMessage.error('上传图片大小不能超过 5MB!')
    return false
  }
  
  // 这里应该上传图片到服务器，获取返回的URL
  // 但现在我们只使用统一的图片URL
  productForm.image = productImage
  return false // 阻止自动上传
}

// 添加规格
const addSpec = () => {
  productForm.specifications.push({ name: '', value: '' })
}

// 删除规格
const removeSpec = (index) => {
  productForm.specifications.splice(index, 1)
}

// 切换商品状态
const handleToggleStatus = async (product) => {
  const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  const actionText = newStatus === 'ACTIVE' ? '上架' : '下架'
  
  try {
    await ElMessageBox.confirm(
      `确定要${actionText}商品 "${product.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用API更新商品状态
    await productApi.updateProductStatus(product.id, newStatus)
    
    // 更新本地状态
    product.status = newStatus
    ElMessage.success(`已${actionText}商品 "${product.name}"`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新商品状态失败:', error)
      ElMessage.error('更新商品状态失败')
    }
  }
}

// 删除商品
const handleDeleteProduct = async (product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品 "${product.name}" 吗？此操作不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用API删除商品
    await productApi.deleteProduct(product.id)
    
    ElMessage.success(`已删除商品 "${product.name}"`)
    loadProducts() // 重新加载商品列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }
}

onMounted(() => {
  loadCategories()
  loadProducts()
})
</script>

<style scoped>
.product-list-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0;
  font-size: 18px;
}

.search-area {
  margin-bottom: 20px;
}

.table-area {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.separator {
  margin: 0 10px;
}

.low-stock {
  color: #F56C6C;
  font-weight: bold;
}

/* 规格项样式 */
.spec-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style> 