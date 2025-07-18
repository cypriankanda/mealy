import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/shared/PrivateRoute'
import AdminRoute from './components/shared/AdminRoute'
import CustomerRoute from './components/shared/CustomerRoute'

// Layouts
import AdminLayout from './components/admin/AdminLayout'
import CustomerLayout from './components/customer/CustomerLayout'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Orders from './pages/Orders'
import OrderHistory from './pages/OrderHistory'
import Profile from './pages/Profile'

// Admin Pages
import AdminDashboard from './components/admin/Dashboard'
import AdminOrders from './components/admin/OrdersManagement'
import AdminMeals from './components/admin/MealsManagement'
import AdminProfile from './pages/Profile' // Reusing the same profile component

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Register />} />
          
          {/* Customer routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Home />} />
            <Route path="menu" element={<Menu />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/history" element={<OrderHistory />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="meals" element={<AdminMeals />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App