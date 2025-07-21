import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { ChartBarIcon, CurrencyDollarIcon, ShoppingBagIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

const Dashboard = () => {
  useAuth()
  const [stats, setStats] = useState(null)
  const [yesterdayStats, setYesterdayStats] = useState(null)
  const [topMeal, setTopMeal] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayFormatted = yesterday.toISOString().split('T')[0];
        
        const [statsRes, yesterdayRes, ordersRes, topMealRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get(`/admin/dashboard?date=${yesterdayFormatted}`),
          api.get('/admin/orders?per_page=5'),
          api.get('/admin/meals/top') // You'll need to create this endpoint
        ])
        
        setStats(statsRes.data)
        setYesterdayStats(yesterdayRes.data)
        setRecentOrders(ordersRes.data.data)
        setTopMeal(topMealRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate changes from yesterday
  const calculateChange = (todayValue, yesterdayValue) => {
    if (!yesterdayStats || yesterdayValue === 0) return '+0';
    const change = todayValue - yesterdayValue;
    return `${change >= 0 ? '+' : ''}${change}`;
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
        <h1 className="text-2xl font-bold text-orange-500 mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-6">Overview of your catering business</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Today's Orders" 
            value={stats?.total_orders} 
            change={`${calculateChange(stats?.total_orders, yesterdayStats?.total_orders)} from yesterday`}
            icon={<ShoppingBagIcon className="h-6 w-6 text-primary-500" />}
            color="primary"
          />
          <StatCard 
            title="Today's Revenue" 
            value={`KSh ${stats?.total_revenue?.toLocaleString()}`} 
            change={`${calculateChange(stats?.total_revenue, yesterdayStats?.total_revenue)} from yesterday`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-green-500" />}
            color="green"
          />
          <StatCard 
            title="Total Orders" 
            value={stats?.total_orders} 
            change="This month"
            icon={<ShoppingBagIcon className="h-6 w-6 text-blue-500" />}
            color="blue"
          />
          <StatCard 
            title="Total Revenue" 
            value={`KSh ${stats?.total_revenue?.toLocaleString()}`} 
            change="This month"
            icon={<CurrencyDollarIcon className="h-6 w-6 text-purple-500" />}
            color="purple"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-orange-500 mb-4">Recent Orders</h2>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <OrderItem key={order.order_id} order={order} />
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-orange-500 mb-4">Today's Summary</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Orders Received</span>
                  <span className="font-medium">{stats?.total_orders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenue Generated</span>
                  <span className="font-medium">KSh {stats?.total_revenue?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Average Order</span>
                  <span className="font-medium">
                    KSh {stats?.total_orders ? (stats.total_revenue / stats.total_orders).toFixed(2) : 0}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-orange-500 mb-4">Most Popular Meal</h2>
              {topMeal ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
                    <ChartBarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{topMeal.meal_name}</h3>
                    <p className="text-sm text-gray-500">Top selling item this week</p>
                    <p className="text-sm text-gray-500 mt-1">Average order value: KSh {topMeal.average_price?.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{topMeal.order_count} orders</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


const StatCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <div className="flex items-center justify-end text-sm text-gray-500">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span>{change}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const OrderItem = ({ order }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
          <ShoppingBagIcon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{order.meal_name}</h3>
          <p className="text-sm text-gray-500">{order.customer_email}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">KSh {order.price}</p>
        <p className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export default Dashboard