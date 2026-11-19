
import axios from 'axios'

const API = axios.create({
  baseURL: 'https://mentormatch-backend-w23v.onrender.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Get token from either storage
const getToken = (key) => {
  return (
    localStorage.getItem(key) ||
    sessionStorage.getItem(key)
  )
}

// Save token in the storage where refresh token exists
const saveToken = (key, value) => {
  if (localStorage.getItem('refresh')) {
    localStorage.setItem(key, value)
  } else {
    sessionStorage.setItem(key, value)
  }
}

// ==================================
// REQUEST INTERCEPTOR
// ==================================

API.interceptors.request.use(
  (config) => {
    const token = getToken('access')

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
      !originalRequest.url?.includes('auth/login/') &&
      !originalRequest.url?.includes('auth/register/') &&
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

      const refreshToken = getToken('refresh')

      if (!refreshToken) {
        return Promise.reject(error)
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const response = await axios.post(
          'https://mentormatch-backend-w23v.onrender.com/api/auth/token/refresh/',
          {
            refresh: refreshToken,
          }
        )

        const newAccessToken = response.data.access

        saveToken('access', newAccessToken)

        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return API(originalRequest)

      } catch (refreshError) {

        processQueue(refreshError, null)

        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        sessionStorage.removeItem('access')
        sessionStorage.removeItem('refresh')

        localStorage.removeItem('username')
        localStorage.removeItem('role')
        sessionStorage.removeItem('username')
        sessionStorage.removeItem('role')

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

export default API
