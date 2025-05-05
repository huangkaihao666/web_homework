import axios from 'axios'
import { ElMessage } from 'element-plus'
import request from './index'

// 保留原有API方法
const originalCartAPI = {
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

/**
 * 购物车相关的API接口
 */
const cartApi = {
  /**
   * 获取购物车商品列表
   * @returns {Promise} 购物车商品列表
   */
  async getCartItems() {
    try {
      // 先尝试调用原始API方法
      try {
        const result = await originalCartAPI.getCartItems()
        if (result) {
          return result
        }
      } catch (e) {
        console.log('原始购物车API调用失败，使用本地存储')
      }
      
      // 从localStorage获取购物车数据
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
      return cartItems
    } catch (error) {
      console.error('获取购物车列表失败:', error)
      ElMessage.error('获取购物车列表失败，请稍后重试')
      return []
    }
  },
  
  /**
   * 添加商品到购物车
   * @param {Object} params - 商品信息
   * @param {number|string} params.productId - 商品ID
   * @param {number} params.quantity - 商品数量
   * @returns {Promise} 添加结果
   */
  async addToCart(params) {
    try {
      // 先尝试调用原始API方法
      try {
        const result = await originalCartAPI.addToCart(params)
        if (result) {
          return result
        }
      } catch (e) {
        console.log('原始购物车添加API调用失败，使用本地存储')
      }
      
      // 模拟添加到购物车
      const { productId, quantity } = params
      
      // 从localStorage获取购物车数据
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
      
      // 查找购物车中是否已存在该商品
      const existingItem = cartItems.find(item => item.productId?.toString() === productId?.toString())
      
      if (existingItem) {
        // 如果已存在，增加数量
        existingItem.quantity += quantity
      } else {
        // 如果不存在，添加新商品
        cartItems.push({
          productId,
          quantity
        })
      }
      
      // 保存到localStorage
      localStorage.setItem('cartItems', JSON.stringify(cartItems))
      
      return { success: true }
    } catch (error) {
      console.error('添加商品到购物车失败:', error)
      ElMessage.error('添加商品到购物车失败，请稍后重试')
      return { success: false }
    }
  },
  
  /**
   * 更新购物车商品数量
   * @param {number|string} productId - 商品ID
   * @param {number} quantity - 新的商品数量
   * @returns {Promise} 更新结果
   */
  async updateCartItemQuantity(productId, quantity) {
    try {
      // 先尝试调用原始API方法
      try {
        const result = await originalCartAPI.updateCartItem(productId, { quantity })
        if (result) {
          return result
        }
      } catch (e) {
        console.log('原始购物车更新API调用失败，使用本地存储')
      }
      
      // 从localStorage获取购物车数据
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
      
      // 查找购物车中的商品
      const existingItem = cartItems.find(item => item.productId?.toString() === productId?.toString())
      
      if (existingItem) {
        // 更新数量
        existingItem.quantity = quantity
        
        // 保存到localStorage
        localStorage.setItem('cartItems', JSON.stringify(cartItems))
        
        return { success: true }
      } else {
        ElMessage.warning('购物车中不存在该商品')
        return { success: false }
      }
    } catch (error) {
      console.error('更新购物车商品数量失败:', error)
      ElMessage.error('更新购物车商品数量失败，请稍后重试')
      return { success: false }
    }
  },
  
  /**
   * 从购物车中移除商品
   * @param {number|string} productId - 商品ID
   * @returns {Promise} 移除结果
   */
  async removeFromCart(productId) {
    try {
      // 先尝试调用原始API方法
      try {
        const result = await originalCartAPI.removeCartItem(productId)
        if (result) {
          return result
        }
      } catch (e) {
        console.log('原始购物车移除API调用失败，使用本地存储')
      }
      
      // 从localStorage获取购物车数据
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]')
      
      // 过滤掉要移除的商品
      const updatedCartItems = cartItems.filter(item => item.productId?.toString() !== productId?.toString())
      
      // 保存到localStorage
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems))
      
      return { success: true }
    } catch (error) {
      console.error('从购物车移除商品失败:', error)
      ElMessage.error('从购物车移除商品失败，请稍后重试')
      return { success: false }
    }
  },
  
  /**
   * 清空购物车
   * @returns {Promise} 清空结果
   */
  async clearCart() {
    try {
      // 先尝试调用原始API方法
      try {
        const result = await originalCartAPI.clearCart()
        if (result) {
          return result
        }
      } catch (e) {
        console.log('原始购物车清空API调用失败，使用本地存储')
      }
      
      // 清空localStorage中的购物车数据
      localStorage.setItem('cartItems', '[]')
      
      return { success: true }
    } catch (error) {
      console.error('清空购物车失败:', error)
      ElMessage.error('清空购物车失败，请稍后重试')
      return { success: false }
    }
  }
}

// 将原始方法添加到新API中以确保兼容性
cartApi.removeCartItem = originalCartAPI.removeCartItem
cartApi.updateCartItem = originalCartAPI.updateCartItem

// 合并并导出API
export default {
  ...originalCartAPI,
  ...cartApi
}