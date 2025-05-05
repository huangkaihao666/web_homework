<template>
  <div class="product-form-container">
    <div class="page-header">
      <h2>{{ isEdit ? '编辑商品' : '添加商品' }}</h2>
      <el-button @click="goBack">返回</el-button>
    </div>
    
    <el-form 
      ref="formRef" 
      :model="form" 
      :rules="rules" 
      label-width="120px" 
      class="product-form"
      v-loading="loading"
    >
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入商品名称"></el-input>
      </el-form-item>
      
      <el-form-item label="商品分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择商品分类">
          <el-option 
            v-for="category in categories" 
            :key="category.id" 
            :label="category.name" 
            :value="category.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="商品价格" prop="price">
        <el-input-number v-model="form.price" :min="0" :precision="2" :step="10"></el-input-number>
      </el-form-item>
      
      <el-form-item label="商品库存" prop="stock">
        <el-input-number v-model="form.stock" :min="0" :step="1"></el-input-number>
      </el-form-item>
      
      <el-form-item label="商品图片" prop="imgUrl">
        <el-upload
          class="product-image-uploader"
          action="#"
          :http-request="uploadImage"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-success="handleImageSuccess"
        >
          <img v-if="form.imgUrl" :src="form.imgUrl" class="product-image" />
          <el-icon v-else class="product-image-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="image-tip">建议上传尺寸: 500×500像素，大小不超过2MB</div>
      </el-form-item>
      
      <el-form-item label="商品状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">上架</el-radio>
          <el-radio :label="0">下架</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="商品详情" prop="description">
        <el-input 
          v-model="form.description" 
          type="textarea" 
          :rows="4" 
          placeholder="请输入商品详情描述"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="submitForm">{{ isEdit ? '保存修改' : '添加商品' }}</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import productApi from '@/api/product'
import categoryApi from '@/api/category'

// 统一使用的图片地址
const DEFAULT_IMAGE = 'https://gd-hbimg.huaban.com/b28f3a92ab819aec999d9fcd044b67083e612cac8efad8-qmD6XC_fw480webp';

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const categories = ref([])

// 判断是编辑还是新增
const isEdit = computed(() => {
  return route.name === 'EditProduct'
})

// 如果是编辑，获取商品ID
const productId = computed(() => {
  return isEdit.value ? parseInt(route.params.id) : null
})

// 表单数据
const form = reactive({
  name: '',
  categoryId: '',
  price: 0,
  stock: 0,
  imgUrl: '',
  status: 1,
  description: ''
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 50, message: '商品名称长度在2-50个字符之间', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入商品库存', trigger: 'blur' }
  ],
  imgUrl: [
    { required: true, message: '请上传商品图片', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入商品详情', trigger: 'blur' }
  ]
}

// 加载分类数据
const loadCategories = async () => {
  try {
    const res = await categoryApi.getCategories()
    categories.value = res
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ElMessage.error('获取分类列表失败')
    
    // 如果API调用失败，使用默认数据
    categories.value = [
      { id: 1, name: '电子产品' },
      { id: 2, name: '手机' },
      { id: 3, name: '服装' },
      { id: 4, name: '食品' },
      { id: 5, name: '礼品' },
      { id: 6, name: '运动' }
    ]
  }
}

// 加载商品数据(如果是编辑模式)
const loadProductData = async () => {
  if (!isEdit.value) return
  
  loading.value = true
  try {
    const res = await productApi.getProduct(productId.value)
    
    // 更新表单数据
    Object.keys(form).forEach(key => {
      if (key in res) {
        form[key] = res[key]
      }
    })
    
    // 替换图片URL
    form.imgUrl = DEFAULT_IMAGE
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
    
    // 如果API调用失败，使用模拟数据
    const productData = {
      id: productId.value,
      name: `商品${productId.value}`,
      categoryId: (productId.value % 6) + 1,
      price: 299 + productId.value * 100,
      stock: 100,
      imgUrl: DEFAULT_IMAGE,
      status: 1,
      description: '这是一段商品详情描述。这款商品具有很多优点，例如质量好、价格实惠等。'
    }
    
    // 更新表单数据
    Object.keys(form).forEach(key => {
      if (key in productData) {
        form[key] = productData[key]
      }
    })
  } finally {
    loading.value = false
  }
}

// 上传图片前的检查
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  
  return true
}

// 上传图片
const uploadImage = async (options) => {
  try {
    // 实际项目中应该调用API上传图片
    // const formData = new FormData()
    // formData.append('file', options.file)
    // const res = await productApi.uploadImage(formData)
    // form.imgUrl = res.url
    
    // 这里直接使用指定图片
    form.imgUrl = DEFAULT_IMAGE
    options.onSuccess()
  } catch (error) {
    console.error('上传图片失败:', error)
    ElMessage.error('上传图片失败')
    options.onError()
  }
}

// 图片上传成功
const handleImageSuccess = () => {
  ElMessage.success('图片上传成功')
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    loading.value = true
    if (isEdit.value) {
      // 编辑商品
      await productApi.updateProduct(productId.value, form)
      ElMessage.success('商品编辑成功')
    } else {
      // 添加商品
      await productApi.createProduct(form)
      ElMessage.success('商品添加成功')
    }
    
    router.push('/products')
  } catch (error) {
    if (error !== false) {
      console.error('保存商品失败:', error)
      ElMessage.error('保存商品失败')
    }
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  
  if (isEdit.value) {
    // 如果是编辑，重新加载原始数据
    loadProductData()
  } else {
    // 如果是新增，清空表单
    formRef.value.resetFields()
  }
}

// 返回
const goBack = () => {
  router.push('/products')
}

onMounted(() => {
  loadCategories()
  loadProductData()
})
</script>

<style scoped>
.product-form-container {
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

.product-form {
  max-width: 800px;
}

.product-image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image-uploader:hover {
  border-color: #409eff;
}

.product-image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style> 