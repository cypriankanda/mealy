import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import OrderCard from '../components/customer/OrderCard'

const Orders = () => {
  useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/history')
        setOrders(response.data.data)
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleCancelOrder = async (orderId) => {
    try {
      await api.delete(`/orders/${orderId}`)
      setOrders(orders.filter(order => order.order_id !== orderId))
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

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
        <h1 className="text-2xl font-bold text-orange-500 mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You have no active orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard 
                key={order.order_id} 
                order={order} 
                onCancel={handleCancelOrder} 
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders