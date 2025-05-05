import request from './index'

/**
 * 获取当前用户信息
 * @returns {Promise<Object>} - 用户信息
 */
export const getUserInfo = () => {
  return request({
    url: '/users/info',
    method: 'get'
  })
}

/**
 * 更新用户信息
 * @param {Object} userData - 用户信息
 * @returns {Promise<Object>} - 更新后的用户信息
 */
export const updateUserInfo = (userData) => {
  return request({
    url: '/users/info',
    method: 'put',
    data: userData
  })
}

/**
 * 获取用户的收货地址列表
 * @returns {Promise<Array>} - 地址列表
 */
export const getUserAddresses = () => {
  return request({
    url: '/users/addresses',
    method: 'get'
  })
}

/**
 * 添加新的收货地址
 * @param {Object} addressData - 地址信息
 * @returns {Promise<Object>} - 添加的地址信息
 */
export const addUserAddress = (addressData) => {
  return request({
    url: '/users/addresses',
    method: 'post',
    data: addressData
  })
}

/**
 * 更新收货地址
 * @param {string|number} addressId - 地址ID
 * @param {Object} addressData - 地址信息
 * @returns {Promise<Object>} - 更新后的地址信息
 */
export const updateUserAddress = (addressId, addressData) => {
  return request({
    url: `/users/addresses/${addressId}`,
    method: 'put',
    data: addressData
  })
}

/**
 * 删除收货地址
 * @param {string|number} addressId - 地址ID
 * @returns {Promise<Object>} - 操作结果
 */
export const deleteUserAddress = (addressId) => {
  return request({
    url: `/users/addresses/${addressId}`,
    method: 'delete'
  })
}

/**
 * 获取用户的订单列表
 * @returns {Promise<Array>} - 订单列表
 */
export const getUserOrders = () => {
  return request({
    url: '/users/orders',
    method: 'get'
  })
}

export default {
  getUserInfo,
  updateUserInfo,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserOrders
} 