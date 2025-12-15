import { useCallback, useRef, useState } from 'react'
import axiosInstance from './request'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// 请求状态接口
interface RequestState<T = any> {
  loading: boolean
  data: T | null
  error: string | null
}

// 请求选项接口
interface RequestOptions extends AxiosRequestConfig {
  debounceDelay?: number // 防抖延迟时间，默认300ms
}

// 浏览器端请求Hook
export function useHttpClient() {
  const [requestStates, setRequestStates] = useState<Record<string, RequestState>>({})
  const abortControllersRef = useRef<Record<string, AbortController>>({})

  // 生成请求key
  const generateRequestKey = useCallback((url: string, config?: RequestOptions) => {
    return `${config?.method || 'GET'}_${url}_${JSON.stringify(config?.params || {})}`
  }, [])

  // 更新请求状态
  const updateRequestState = useCallback((key: string, state: Partial<RequestState>) => {
    setRequestStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...state }
    }))
  }, [])

  // 取消请求
  const cancelRequest = useCallback((key: string) => {
    if (abortControllersRef.current[key]) {
      abortControllersRef.current[key].abort()
      delete abortControllersRef.current[key]
    }
  }, [])

  // 执行请求的核心函数
  const executeRequest = useCallback(
    async <T = any>(url: string, config: RequestOptions = {}): Promise<T> => {
      const requestKey = generateRequestKey(url, config)

      // 取消之前的请求
      cancelRequest(requestKey)

      // 创建新的AbortController
      const abortController = new AbortController()
      abortControllersRef.current[requestKey] = abortController

      // 设置loading状态
      updateRequestState(requestKey, {
        loading: true,
        error: null,
        data: requestStates[requestKey]?.data || null
      })

      try {
        const response: AxiosResponse<T> = await axiosInstance({
          ...config,
          url,
          signal: abortController.signal
        })

        const data = response.data
        updateRequestState(requestKey, {
          loading: false,
          data,
          error: null
        })

        return data
      } catch (error: any) {
        if (error.name === 'AbortError') {
          // 请求被取消，不更新状态
          return Promise.reject(error)
        }

        const errorMessage = error.response?.data?.message || error.message || '请求失败'
        updateRequestState(requestKey, {
          loading: false,
          error: errorMessage,
          data: null
        })

        throw error
      } finally {
        // 清理AbortController
        delete abortControllersRef.current[requestKey]
      }
    },
    [generateRequestKey, cancelRequest, updateRequestState, requestStates]
  )

  // 创建防抖请求函数
  const createDebouncedRequest = useCallback(
    <T = any>(url: string, config: RequestOptions = {}) => {
      const { debounceDelay = 300, ...axiosConfig } = config

      return debounce(() => executeRequest<T>(url, axiosConfig), debounceDelay)
    },
    [executeRequest]
  )

  // GET请求
  const get = useCallback(
    <T = any>(url: string, config: RequestOptions = {}) => {
      const requestKey = generateRequestKey(url, { ...config, method: 'GET' })
      const requestState = requestStates[requestKey] || { loading: false, data: null, error: null }

      const execute =
        config.debounceDelay !== undefined && config.debounceDelay > 0
          ? createDebouncedRequest<T>(url, { ...config, method: 'GET' })
          : () => executeRequest<T>(url, { ...config, method: 'GET' })

      return {
        ...requestState,
        execute,
        cancel: () => cancelRequest(requestKey)
      }
    },
    [generateRequestKey, requestStates, createDebouncedRequest, executeRequest, cancelRequest]
  )

  // POST请求
  const post = useCallback(
    <T = any>(url: string, data?: any, config: RequestOptions = {}) => {
      const requestKey = generateRequestKey(url, { ...config, method: 'POST' })
      const requestState = requestStates[requestKey] || { loading: false, data: null, error: null }

      const execute =
        config.debounceDelay !== undefined && config.debounceDelay > 0
          ? createDebouncedRequest<T>(url, { ...config, method: 'POST', data })
          : () => executeRequest<T>(url, { ...config, method: 'POST', data })

      return {
        ...requestState,
        execute,
        cancel: () => cancelRequest(requestKey)
      }
    },
    [generateRequestKey, requestStates, createDebouncedRequest, executeRequest, cancelRequest]
  )

  return {
    get,
    post
  }
}

// 默认导出Hook（仅在浏览器端使用）
export default useHttpClient
