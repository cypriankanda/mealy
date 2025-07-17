import { useEffect, useState } from 'react'
import api from '../services/api'
import { ShoppingBagIcon, ClockIcon } from '@heroicons/react/24/outline'
import MenuItem from '../components/customer/MenuItem'
import OrderCard from '../components/customer/OrderCard'

const Home = () => {
  const [menu, setMenu] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
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
    }

    fetchData()
  }, [])

  const handlePlaceOrder = async (mealId) => {
    try {
      const response = await api.post('/orders', { meal_id: mealId })
      setCurrentOrder(response.data)
    } catch (error) {
      console.error('Error placing order:', error)
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`)
      setCurrentOrder(null)
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Today's Menu</h1>
        
        {currentOrder && (
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
              disabled={!!currentOrder}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home