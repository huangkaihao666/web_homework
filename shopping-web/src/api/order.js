import request from './index'

/**
 * 创建新订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} - 创建的订单信息
 */
export const createOrder = (orderData) => {
  return request({
    url: '/orders',
    method: 'post',
    data: orderData
  })
}

/**
 * 获取订单详情
 * @param {string|number} orderId - 订单ID
 * @returns {Promise<Object>} - 订单详情
 */
export const getOrder = (orderId) => {
  return request({
    url: `/orders/${orderId}`,
    method: 'get'
  })
}

/**
 * 获取当前用户的所有订单
 * @returns {Promise<Array>} - 订单列表
 */
export const getUserOrders = () => {
  console.log('获取用户ID=1的所有订单')
  // 这里固定用户ID为1，实际应用需要从用户会话中获取
  return request({
    url: '/orders/user/1',
    method: 'get'
  })
}

/**
 * 取消订单
 * @param {string|number} orderId - 订单ID
 * @returns {Promise<Object>} - 操作结果
 */
export const cancelOrder = (orderId) => {
  return request({
    url: `/orders/${orderId}/cancel`,
    method: 'put'
  })
}

/**
 * 支付订单
 * @param {string|number} orderId - 订单ID
 * @param {Object} paymentData - 支付信息
 * @returns {Promise<Object>} - 操作结果
 */
export const payOrder = (orderId, paymentData) => {
  return request({
    url: `/orders/${orderId}/pay`,
    method: 'put',
    data: paymentData
  })
}

export default {
  createOrder,
  getOrder,
  getUserOrders,
  cancelOrder,
  payOrder
} 