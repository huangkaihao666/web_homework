import request from './index';

/**
 * 获取轮播图列表
 * @returns {Promise<Array>} - 轮播图列表
 */
export const getBanners = () => {
  return request({
    url: '/products/banners',
    method: 'get'
  })
}

export default {
  // 获取产品列表
  getProducts(params) {
    return request({
      url: '/products',
      method: 'get',
      params
    });
  },
  
  // 获取产品详情
  getProduct(id) {
    return request({
      url: `/products/${id}`,
      method: 'get'
    });
  },
  
  // 获取产品分类
  getCategories() {
    return request({
      url: '/categories',
      method: 'get'
    });
  },

  getBanners
}; 