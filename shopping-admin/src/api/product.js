import api from './index'

export default {
  // 获取商品列表
  getProducts(params) {
    return api.get('/products', { params })
  },
  
  // 获取单个商品详情
  getProduct(id) {
    return api.get(`/products/${id}`)
  },
  
  // 创建商品
  createProduct(productData) {
    return api.post('/products', productData)
  },
  
  // 更新商品信息
  updateProduct(id, productData) {
    return api.put(`/products/${id}`, productData)
  },
  
  // 更新商品状态
  updateProductStatus(id, status) {
    return api.patch(`/products/${id}/status`, { status })
  },
  
  // 删除商品
  deleteProduct(id) {
    return api.delete(`/products/${id}`)
  },
  
  // 上传商品图片
  uploadProductImage(formData) {
    return api.post('/upload/product-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}