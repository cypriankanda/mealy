import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const OrderHistory = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = 'https://mealy-production.up.railway.app/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/history`);
        setOrders(res.data.data);
        
        const stats = {
          total_orders: res.data.pagination.total,
          total_spent: res.data.data.reduce((sum, order) => sum + order.price, 0)
        };
        setStats(stats);
      } catch (err) {
        setError('Failed to fetch order history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} logout={logout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
            <p className="mt-1 text-gray-600">Track all your previous meal orders</p>
          </div>
          {stats && (
            <div className="mt-4 md:mt-0 flex space-x-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total_orders}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold">KSh {stats.total_spent}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            {error && <div className="mb-4 text-red-500">{error}</div>}
            
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.order_id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-medium">{order.meal_name}</h3>
                    <p className="text-lg font-medium text-gray-900">KSh {order.price}</p>
                  </div>
                  
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <p>{new Date(order.menu_date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p>Order #{order.order_id}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;