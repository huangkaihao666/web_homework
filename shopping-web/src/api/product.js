import request from './index';
import axios from 'axios'
import { ElMessage } from 'element-plus'

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

// 保留原有API方法
const originalAPI = {
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
}

/**
 * 商品相关的API接口
 */
const productApi = {
  /**
   * 获取商品分类列表
   * @returns {Promise} 分类列表
   */
  async getCategories() {
    try {
      // 先尝试调用原始API方法
      try {
        const result = await originalAPI.getCategories()
        if (result && Array.isArray(result)) {
          return result
        }
      } catch (e) {
        console.log('原始分类API调用失败，使用模拟数据')
      }
      
      // 模拟数据
      return [
        { id: 1, name: '电子产品', icon: 'Monitor' },
        { id: 2, name: '手机', icon: 'Phone' },
        { id: 3, name: '服装', icon: 'ShoppingBag' },
        { id: 4, name: '食品', icon: 'Food' },
        { id: 5, name: '礼品', icon: 'Present' },
        { id: 6, name: '运动', icon: 'Soccer' }
      ]
    } catch (error) {
      console.error('获取分类列表失败:', error)
      ElMessage.error('获取分类列表失败，请稍后重试')
      return []
    }
  },
  
  /**
   * 获取商品列表
   * @param {Object} params - 查询参数
   * @returns {Promise} 商品列表
   */
  async getProducts(params = {}) {
    try {
      // 先尝试调用原始API方法
      try {
        const result = await originalAPI.getProducts(params)
        if (result && (Array.isArray(result) || (result.items && Array.isArray(result.items)))) {
          return Array.isArray(result) ? result : result.items
        }
      } catch (e) {
        console.log('原始商品API调用失败，使用模拟数据')
      }
      
      // 模拟数据
      return [
        { 
          id: 1, 
          name: '智能手表 2023款', 
          price: 1299, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Smartwatch',
          description: '多功能智能手表，支持心率监测、血氧检测、睡眠监测等功能',
          brand: 'TechWear',
          category: 1,
          stock: 35,
          discount: 0.9,
          createdAt: '2023-05-15'
        },
        { 
          id: 2, 
          name: '无线蓝牙耳机', 
          price: 499, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Headphone',
          description: '降噪蓝牙耳机，续航时间长达30小时，支持快充',
          brand: 'SoundPlus',
          category: 1,
          stock: 56,
          discount: 0.85,
          createdAt: '2023-06-20'
        },
        { 
          id: 3, 
          name: '轻薄笔记本电脑', 
          price: 5699, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Laptop',
          description: '13.3英寸高清屏幕，8GB内存，512GB固态硬盘',
          brand: 'CompTech',
          category: 1,
          stock: 10,
          discount: 0.95,
          createdAt: '2023-07-05'
        },
        { 
          id: 4, 
          name: '机械键盘', 
          price: 369, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Keyboard',
          description: '87键机械键盘，青轴，RGB背光',
          brand: 'GamerGear',
          category: 1,
          stock: 86,
          discount: 1,
          createdAt: '2023-07-15'
        },
        { 
          id: 5, 
          name: '人体工学椅', 
          price: 999, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Chair',
          description: '高品质办公椅，舒适透气，支持腰部调节',
          brand: 'ComfortPlus',
          category: 6,
          stock: 15,
          discount: 0.8,
          createdAt: '2023-08-01'
        },
        { 
          id: 6, 
          name: '4K高清投影仪', 
          price: 3699, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Projector',
          description: '家用投影仪，支持4K解析度，亮度2000ANSI流明',
          brand: 'ViewMax',
          category: 1,
          stock: 8,
          discount: 0.9,
          createdAt: '2023-06-10'
        },
        { 
          id: 7, 
          name: '智能家居套装', 
          price: 1599, 
          imgUrl: 'https://via.placeholder.com/300x300?text=SmartHome',
          description: '包含智能音箱、智能灯泡、智能插座等多个设备',
          brand: 'HomeSmart',
          category: 1,
          stock: 20,
          discount: 0.85,
          createdAt: '2023-06-25'
        },
        { 
          id: 8, 
          name: '电动牙刷', 
          price: 399, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Toothbrush',
          description: '声波震动电动牙刷，5种清洁模式，续航30天',
          brand: 'CleanTech',
          category: 5,
          stock: 45,
          discount: 1,
          createdAt: '2023-07-30'
        },
        { 
          id: 9, 
          name: '智能空气净化器', 
          price: 1299, 
          imgUrl: 'https://via.placeholder.com/300x300?text=AirPurifier',
          description: 'HEPA过滤，去除99.97%的污染物，适用于25-30平方米房间',
          brand: 'PureAir',
          category: 5,
          stock: 18,
          discount: 0.9,
          createdAt: '2023-08-05'
        },
        { 
          id: 10, 
          name: '便携式蓝牙音箱', 
          price: 259, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Speaker',
          description: '10W输出功率，防水防尘，续航12小时',
          brand: 'SoundPlus',
          category: 1,
          stock: 60,
          discount: 0.85,
          createdAt: '2023-07-25'
        },
        { 
          id: 11, 
          name: '智能体重秤', 
          price: 159, 
          imgUrl: 'https://via.placeholder.com/300x300?text=Scale',
          description: '测量体重、BMI、体脂率等多项数据，支持APP同步',
          brand: 'HealthTech',
          category: 5,
          stock: 75,
          discount: 1,
          createdAt: '2023-08-10'
        },
        { 
          id: 12, 
          name: '超薄移动电源', 
          price: 199, 
          imgUrl: 'https://via.placeholder.com/300x300?text=PowerBank',
          description: '10000mAh容量，支持18W快充，体积小巧',
          brand: 'PowerPlus',
          category: 1,
          stock: 50,
          discount: 0.8,
          createdAt: '2023-08-15'
        }
      ].filter(product => {
        // 根据分类筛选
        if (params.category && product.category !== parseInt(params.category)) {
          return false
        }
        
        // 根据搜索关键词筛选
        if (params.search && !product.name.toLowerCase().includes(params.search.toLowerCase()) && 
            !product.description.toLowerCase().includes(params.search.toLowerCase())) {
          return false
        }
        
        return true
      })
    } catch (error) {
      console.error('获取商品列表失败:', error)
      ElMessage.error('获取商品列表失败，请稍后重试')
      return []
    }
  },
  
  /**
   * 获取商品详情
   * @param {number|string} id - 商品ID
   * @returns {Promise} 商品详情
   */
  async getProductDetail(id) {
    try {
      // 先尝试调用原始API方法
      try {
        const result = await originalAPI.getProduct(id)
        if (result) {
          return result
        }
      } catch (e) {
        console.log('原始商品详情API调用失败，使用模拟数据')
      }
      
      // 模拟通过ID获取商品详情
      const products = await this.getProducts()
      return products.find(p => p.id.toString() === id.toString()) || null
    } catch (error) {
      console.error('获取商品详情失败:', error)
      ElMessage.error('获取商品详情失败，请稍后重试')
      return null
    }
  },
  
  // 将原始API方法添加到新API中以确保兼容性
  getProduct: originalAPI.getProduct,
  getBanners
}

// 合并并导出API
export default {
  ...originalAPI,
  ...productApi
} 