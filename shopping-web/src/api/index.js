import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // 后端API的基础URL
  timeout: 5000
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('userToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response && error.response.status === 401) {
      // 未授权，跳转到登录页
      localStorage.removeItem('userToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api 