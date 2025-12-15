import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 判断是否在浏览器环境
const isBrowser = typeof window !== 'undefined'

// 基础配置
const baseConfig: AxiosRequestConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}

// 创建axios实例
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    ...baseConfig,
    baseURL: isBrowser ? '/api' : process.env.SERVER_URL
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 在浏览器环境中可以添加token等
      if (isBrowser) {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error) => {
      // 统一错误处理
      if (error.response?.status === 401) {
        if (isBrowser) {
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )

  return instance
}

// 创建实例
const axiosInstance = createAxiosInstance()

export default axiosInstance
