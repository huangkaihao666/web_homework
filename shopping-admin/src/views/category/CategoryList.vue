<template>
  <div class="category-list-container">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="handleAddCategory">添加分类</el-button>
    </div>
    
    <el-card class="category-table" v-loading="loading">
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        
        <el-table-column label="图标" width="100">
          <template #default="scope">
            <el-icon size="24" :color="scope.row.iconColor">
              <component :is="scope.row.icon"></component>
            </el-icon>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="分类名称" width="180"></el-table-column>
        
        <el-table-column prop="description" label="分类描述"></el-table-column>
        
        <el-table-column prop="productCount" label="商品数量" width="120" sortable></el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
        
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" type="primary" @click="handleEditCategory(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteCategory(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 添加/编辑分类对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑分类' : '添加分类'" 
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form 
        :model="categoryForm" 
        :rules="rules" 
        ref="categoryFormRef" 
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        
        <el-form-item label="分类图标" prop="icon">
          <div class="icon-selector">
            <el-radio-group v-model="categoryForm.icon">
              <el-radio-button label="ShoppingBag">
                <el-icon><ShoppingBag /></el-icon>
              </el-radio-button>
              <el-radio-button label="Apple">
                <el-icon><Apple /></el-icon>
              </el-radio-button>
              <el-radio-button label="Cherry">
                <el-icon><Cherry /></el-icon>
              </el-radio-button>
              <el-radio-button label="Chicken">
                <el-icon><Chicken /></el-icon>
              </el-radio-button>
              <el-radio-button label="Food">
                <el-icon><Food /></el-icon>
              </el-radio-button>
              <el-radio-button label="Mug">
                <el-icon><Mug /></el-icon>
              </el-radio-button>
              <el-radio-button label="Football">
                <el-icon><Football /></el-icon>
              </el-radio-button>
              <el-radio-button label="Suitcase">
                <el-icon><Suitcase /></el-icon>
              </el-radio-button>
              <el-radio-button label="Basketball">
                <el-icon><Basketball /></el-icon>
              </el-radio-button>
              <el-radio-button label="Watch">
                <el-icon><Watch /></el-icon>
              </el-radio-button>
            </el-radio-group>
          </div>
        </el-form-item>
        
        <el-form-item label="图标颜色" prop="iconColor">
          <el-color-picker v-model="categoryForm.iconColor"></el-color-picker>
        </el-form-item>
        
        <el-form-item label="分类描述" prop="description">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入分类描述"
          ></el-input>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ShoppingBag,
  Apple,
  Cherry,
  Chicken,
  Food,
  Mug,
  Football,
  Suitcase,
  Basketball,
  Watch
} from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const isEdit = ref(false)
const categoryFormRef = ref(null)

const categoryForm = reactive({
  id: null,
  name: '',
  icon: 'ShoppingBag',
  iconColor: '#409EFF',
  description: ''
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请选择分类图标', trigger: 'change' }
  ],
  description: [
    { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
  ]
}

// 加载分类数据
const loadCategories = () => {
  loading.value = true
  
  // 实际项目中应该从API获取数据
  // 这里使用模拟数据
  setTimeout(() => {
    const mockData = [
      {
        id: 1,
        name: '电子产品',
        icon: 'ShoppingBag',
        iconColor: '#409EFF',
        description: '包括手机、电脑、平板等电子设备',
        productCount: 120,
        createdAt: '2024-01-05 10:00:00'
      },
      {
        id: 2,
        name: '服装鞋帽',
        icon: 'Suitcase',
        iconColor: '#67C23A',
        description: '男装、女装、童装、内衣、鞋帽配饰等',
        productCount: 98,
        createdAt: '2024-01-10 14:30:20'
      },
      {
        id: 3,
        name: '食品生鲜',
        icon: 'Food',
        iconColor: '#E6A23C',
        description: '生鲜水果、零食饮料、粮油调味等',
        productCount: 75,
        createdAt: '2024-01-12 09:40:15'
      },
      {
        id: 4,
        name: '美妆个护',
        icon: 'Cherry',
        iconColor: '#F56C6C',
        description: '护肤彩妆、洗护用品、个人护理等',
        productCount: 62,
        createdAt: '2024-01-15 16:20:30'
      },
      {
        id: 5,
        name: '家居家装',
        icon: 'Mug',
        iconColor: '#909399',
        description: '家具、家饰、厨房用品、清洁工具等',
        productCount: 45,
        createdAt: '2024-02-01 11:30:00'
      },
      {
        id: 6,
        name: '运动户外',
        icon: 'Basketball',
        iconColor: '#FF9900',
        description: '运动服饰、户外装备、健身器材等',
        productCount: 38,
        createdAt: '2024-02-10 15:10:25'
      }
    ]
    
    total.value = mockData.length
    
    // 模拟分页
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    tableData.value = mockData.slice(start, end)
    
    loading.value = false
  }, 500)
}

// 切换页码
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadCategories()
}

// 切换每页显示数量
const handleSizeChange = (val) => {
  pageSize.value = val
  loadCategories()
}

// 添加分类
const handleAddCategory = () => {
  isEdit.value = false
  categoryForm.id = null
  categoryForm.name = ''
  categoryForm.icon = 'ShoppingBag'
  categoryForm.iconColor = '#409EFF'
  categoryForm.description = ''
  
  dialogVisible.value = true
}

// 编辑分类
const handleEditCategory = (row) => {
  isEdit.value = true
  categoryForm.id = row.id
  categoryForm.name = row.name
  categoryForm.icon = row.icon
  categoryForm.iconColor = row.iconColor
  categoryForm.description = row.description
  
  dialogVisible.value = true
}

// 删除分类
const handleDeleteCategory = (row) => {
  ElMessageBox.confirm(
    `确定要删除分类 ${row.name} 吗？删除后不可恢复，且会影响相关商品的分类。`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中应该调用API删除分类
    
    // 模拟删除操作
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      total.value--
    }
    
    ElMessage.success(`分类 ${row.name} 已删除`)
  }).catch(() => {
    // 取消操作
  })
}

// 提交分类表单
const submitCategoryForm = () => {
  if (!categoryFormRef.value) return
  
  categoryFormRef.value.validate((valid) => {
    if (valid) {
      if (isEdit.value) {
        // 编辑分类
        // 实际项目中应该调用API更新分类
        
        // 模拟更新操作
        const index = tableData.value.findIndex(item => item.id === categoryForm.id)
        if (index > -1) {
          tableData.value[index] = {
            ...tableData.value[index],
            name: categoryForm.name,
            icon: categoryForm.icon,
            iconColor: categoryForm.iconColor,
            description: categoryForm.description
          }
        }
        
        ElMessage.success('分类更新成功')
      } else {
        // 添加分类
        // 实际项目中应该调用API添加分类
        
        // 模拟添加操作
        const newId = Math.max(...tableData.value.map(item => item.id)) + 1
        const newCategory = {
          id: newId,
          name: categoryForm.name,
          icon: categoryForm.icon,
          iconColor: categoryForm.iconColor,
          description: categoryForm.description,
          productCount: 0,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
        
        tableData.value.unshift(newCategory)
        total.value++
        
        ElMessage.success('分类添加成功')
      }
      
      dialogVisible.value = false
    } else {
      return false
    }
  })
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-list-container {
  padding: 20px;
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

.category-table {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.icon-selector {
  margin-bottom: 10px;
}

/* 自定义图标选择器样式 */
.icon-selector .el-radio-button__inner {
  padding: 8px 12px;
}
</style> 