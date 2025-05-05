import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // 后端API的基础URL
  timeout: 5000
})

// 请求拦截器 - 添加token和调试信息
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('userToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 调试信息
    console.log(`API请求: ${config.method.toUpperCase()} ${config.url}`, config.params || config.data || {})
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误和数据提取
api.interceptors.response.use(
  response => {
    // 调试信息
    console.log(`API响应: ${response.config.url}`, response.data)
    
    // 检查是否有数据
    if (response.data === undefined || response.data === null) {
      console.warn('API返回了空数据:', response.config.url)
    }
    
    // 直接返回响应数据，不需要再次访问.data
    return response.data
  },
  error => {
    // 详细记录错误信息
    console.error('API错误:', error.message)
    if (error.response) {
      console.error('错误状态:', error.response.status)
      console.error('错误数据:', error.response.data)
      console.error('请求配置:', error.config)
      console.error('请求URL:', error.config.url)
      console.error('请求方法:', error.config.method)
      if (error.config.data) {
        try {
          console.error('请求数据:', JSON.parse(error.config.data))
        } catch (e) {
          console.error('请求数据(原始):', error.config.data)
        }
      }
    } else if (error.request) {
      console.error('没有收到响应:', error.request)
    } else {
      console.error('请求配置错误:', error.config)
    }
    
    // 处理特定错误
    if (error.response && error.response.status === 401) {
      console.log('用户未授权，跳转到登录页')
      localStorage.removeItem('userToken')
      
      // 使用延时跳转，避免在处理中途跳转导致问题
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    } else {
      // 显示错误消息
      const errorMessage = error.response?.data?.message || 
                           (error.message === 'Network Error' ? '网络错误，请检查服务器连接' : '服务器错误，请稍后重试')
      
      ElMessage.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)

export default api 