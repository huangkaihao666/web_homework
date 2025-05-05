import request from './index'

export default {
  // 获取购物车商品列表
  getCartItems() {
    return request({
      url: '/cart',
      method: 'get'
    })
  },
  
  // 添加商品到购物车
  addToCart(data) {
    return request({
      url: '/cart',
      method: 'post',
      data
    })
  },
  
  // 更新购物车商品
  updateCartItem(id, data) {
    return request({
      url: `/cart/${id}`,
      method: 'put',
      data
    })
  },
  
  // 从购物车移除商品
  removeCartItem(id) {
    return request({
      url: `/cart/${id}`,
      method: 'delete'
    })
  },
  
  // 清空购物车
  clearCart() {
    return request({
      url: '/cart',
      method: 'delete'
    })
  }
}