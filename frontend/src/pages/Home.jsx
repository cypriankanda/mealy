import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { useRealTimeUpdates } from '../utils/useRealTimeUpdates'
import { ShoppingBagIcon, ClockIcon } from '@heroicons/react/24/outline'
import MenuItem from '../components/customer/MenuItem'
import OrderCard from '../components/customer/OrderCard'

const Home = () => {
  const { triggerRefresh } = useAuth()
  const [menu, setMenu] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, orderRes] = await Promise.all([
        api.get('/menu/today'),
        api.get('/orders/current')
      ])
      setMenu(menuRes.data.meals)
      setCurrentOrder(orderRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Use real-time updates with 20-second polling
  const { refresh } = useRealTimeUpdates(fetchData, [], 20000)

  const handlePlaceOrder = async (mealId) => {
    try {
      await api.post('/orders', {meal_id: mealId});
      const orderRes = await api.get('/orders/current');
      setCurrentOrder(orderRes.data);
      // Trigger global refresh to update other components
      triggerRefresh();
    } catch (error) {
      console.error('Error placing order:', error);
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`)
      setCurrentOrder(null)
      // Trigger global refresh to update other components
      triggerRefresh();
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

  const isValidOrder = (order) => order && order.order_id;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-orange-500">Today's Menu</h1>
          <button
            onClick={refresh}
            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-lg shadow-lg hover:from-orange-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {isValidOrder(currentOrder) && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Current Order</h2>
            <OrderCard 
              order={currentOrder} 
              onCancel={handleCancelOrder} 
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((meal) => (
            <MenuItem 
              key={meal.id} 
              meal={meal} 
              onOrder={handlePlaceOrder} 
              disabled={isValidOrder(currentOrder)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home