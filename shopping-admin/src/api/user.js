import api from './index'

export default {
  // 获取用户列表
  getUsers(params) {
    return api.get('/users', { params })
  },
  
  // 获取单个用户信息
  getUser(id) {
    return api.get(`/users/${id}`)
  },
  
  // 获取用户订单
  getUserOrders(userId) {
    return api.get(`/users/${userId}/orders`)
  },
  
  // 更新用户状态
  updateUserStatus(userId, status) {
    return api.patch(`/users/${userId}/status`, { status })
  },
  
  // 创建用户
  createUser(userData) {
    return api.post('/users', userData)
  },
  
  // 更新用户信息
  updateUser(userId, userData) {
    return api.put(`/users/${userId}`, userData)
  },
  
  // 删除用户
  deleteUser(userId) {
    return api.delete(`/users/${userId}`)
  }
}