
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==================================
// REQUEST INTERCEPTOR
// ==================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ==================================
// RESPONSE INTERCEPTOR
// AUTOMATIC TOKEN REFRESH
// ==================================

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('auth/token/refresh/')
    ) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return API(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = localStorage.getItem('refresh')

        if (!refreshToken) {
          throw new Error('Refresh token not found')
        }

        const response = await axios.post(
          'http://127.0.0.1:8000/api/auth/token/refresh/',
          {
            refresh: refreshToken,
          }
        )

        const newAccessToken = response.data.access

        localStorage.setItem('access', newAccessToken)

        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return API(originalRequest)

      } catch (refreshError) {

        processQueue(refreshError, null)

        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('username')
        localStorage.removeItem('role')

        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
      }
    }

    if (error.response) {
      console.error(
        'API Error:',
        error.response.status,
        error.response.data
      )
    } else {
      console.error('Network Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default API;
