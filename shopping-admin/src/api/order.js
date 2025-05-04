import api from './index';

export default {
  // 获取订单列表
  getOrders(params) {
    return api.get('/orders', { params });
  },
  // 获取订单详情
  getOrder(id) {
    return api.get(`/orders/${id}`);
  },
  // 更新订单状态
  updateOrderStatus(id, data) {
    return api.patch(`/orders/${id}/status`, data);
  },
  // 发货
  shipOrder(id, data) {
    return api.post(`/orders/${id}/ship`, data);
  }
}; 