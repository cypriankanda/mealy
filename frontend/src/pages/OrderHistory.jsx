import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import OrderCard from '../components/customer/OrderCard'
import Pagination from '../components/shared/Pagination'

const OrderHistory = () => {
  useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 1
  })

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const response = await api.get(`/orders/history?page=${pagination.page}&per_page=${pagination.per_page}`)
        setOrders(response.data.data)
        setPagination({
          page: response.data.pagination.page,
          per_page: response.data.pagination.per_page,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        })
      } catch (error) {
        console.error('Error fetching order history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderHistory()
  }, [pagination.page])

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">You have no order history</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {orders.map((order) => (
                <OrderCard 
                  key={order.order_id} 
                  order={order} 
                  showStatus={true}
                />
              ))}
            </div>
            
            <Pagination 
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default OrderHistory