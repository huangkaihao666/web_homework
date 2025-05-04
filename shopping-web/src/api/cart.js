import api from './index'

export default {
  // 获取购物车商品列表
  getCartItems() {
    return api.get('/cart')
  },
  
  // 添加商品到购物车
  addToCart(productData) {
    return api.post('/cart', productData)
  },
  
  // 更新购物车商品数量
  updateCartItem(itemId, updateData) {
    return api.patch(`/cart/${itemId}`, updateData)
  },
  
  // 从购物车移除商品
  removeCartItem(itemId) {
    return api.delete(`/cart/${itemId}`)
  },
  
  // 清空购物车
  clearCart() {
    return api.delete('/cart')
  }
}