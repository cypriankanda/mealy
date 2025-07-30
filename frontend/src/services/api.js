import axios from 'axios'

// Determine the correct base URL
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return '/api'
  }
  
  // In production, use the environment variable or default
  const apiUrl = import.meta.env.VITE_API_URL || 'https://mealy-production.up.railway.app/api'
  
  // Ensure the URL doesn't have port 80 explicitly for HTTPS
  const cleanUrl = apiUrl.replace(':80/', '/').replace(':80', '')
  
  // Debug logging
  console.log('API Configuration:', {
    isDev: import.meta.env.DEV,
    viteApiUrl: import.meta.env.VITE_API_URL,
    originalUrl: apiUrl,
    cleanUrl: cleanUrl
  })
  
  return cleanUrl
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // Debug logging for API calls
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullUrl: `${config.baseURL}${config.url}`
    })
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api