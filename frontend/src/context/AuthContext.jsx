import { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token)
      setUser(decoded.user)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token, user } = response.data
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(user)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/')
    } catch (error) {
      throw error.response?.data?.message || 'Login failed'
    }
  }

  const register = async (email, password, role, caterer_id = null) => {
    try {
      const response = await api.post('/auth/register', { email, password, role, caterer_id })
      const { access_token, user } = response.data
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(user)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/')
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed'
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete api.defaults.headers.common['Authorization']
    navigate('/login')
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);