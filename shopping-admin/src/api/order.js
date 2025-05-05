import request from './index'

export default {
  // 获取订单列表
  getOrders(params) {
    return request({
      url: '/orders',
      method: 'get',
      params
    })
  },

  // 获取订单详情
  getOrder(id) {
    return request({
      url: `/orders/${id}`,
      method: 'get'
    })
  },

  // 更新订单状态
  updateOrderStatus(id, status) {
    return request({
      url: `/orders/${id}/status`,
      method: 'put',
      data: status
    })
  },

  // 获取仪表盘统计数据
  getDashboardStats() {
    return request({
      url: '/dashboard/stats',
      method: 'get'
    })
  },

  // 获取最近7天销售数据
  getRecentSales() {
    return request({
      url: '/dashboard/sales',
      method: 'get'
    })
  },

  // 获取商品类别分布数据
  getCategoryDistribution() {
    return request({
      url: '/dashboard/categories',
      method: 'get'
    })
  },

  // 获取最近订单
  getRecentOrders() {
    return request({
      url: '/dashboard/recent-orders',
      method: 'get'
    })
  }
} 