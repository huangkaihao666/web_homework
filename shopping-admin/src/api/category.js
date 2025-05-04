import api from './index'

export default {
  // 获取分类列表
  getCategories(params) {
    return api.get('/categories', { params })
  },
  
  // 获取单个分类详情
  getCategory(id) {
    return api.get(`/categories/${id}`)
  },
  
  // 创建分类
  createCategory(categoryData) {
    return api.post('/categories', categoryData)
  },
  
  // 更新分类信息
  updateCategory(id, categoryData) {
    return api.put(`/categories/${id}`, categoryData)
  },
  
  // 删除分类
  deleteCategory(id) {
    return api.delete(`/categories/${id}`)
  }
}