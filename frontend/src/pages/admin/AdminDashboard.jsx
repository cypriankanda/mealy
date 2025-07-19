import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = 'https://mealy-production.up.railway.app/api/admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          axios.get(`${API_URL}/dashboard`),
          axios.get(`${API_URL}/orders`),
        ]);
        setStats(statsRes.data);
        setOrders(ordersRes.data.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      setOrders(orders.map(order => 
        order.order_id === orderId ? { ...order, status } : order
      ));
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} logout={logout} admin />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Overview of your catering business</p>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Today's Orders</h3>
              <p className="mt-2 text-3xl font-bold">{stats.total_orders}</p>
              <p className="text-sm text-gray-500">+2 from yesterday</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Today's Revenue</h3>
              <p className="mt-2 text-3xl font-bold">KSh {stats.total_revenue}</p>
              <p className="text-sm text-gray-500">+125 from yesterday</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Orders</h3>
              <p className="mt-2 text-3xl font-bold">15</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
              <p className="mt-2 text-3xl font-bold">KSh 6,750</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Orders Management</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">
                    Pending Orders
                  </button>
                  <button className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-sm">
                    All Orders
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Order #{order.order_id}</h3>
                      <p className="text-sm text-gray-500">{order.status}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{order.customer_email}</p>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Meal</p>
                        <p>{order.meal_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date</p>
                        <p>{new Date(order.menu_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'preparing')}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.order_id, 'ready')}
                          className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                        >
                          Mark Ready
                        </button>
                      )}
                      <button
                        onClick={() => updateOrderStatus(order.order_id, 'cancelled')}
                        className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Most Popular Meal</h2>
              <p className="text-sm font-medium text-gray-500">Top selling item this week</p>
              <h3 className="mt-2 text-lg font-medium">Beef Stew with Rice</h3>
              <p className="text-sm text-gray-500">Average order value: KSh 425</p>
              <p className="mt-2 text-sm font-medium">8 orders</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Summary</h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Orders Received</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenue Generated</p>
                  <p className="text-2xl font-bold">KSh 3,200</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Average Order</p>
                  <p className="text-2xl font-bold">KSh 400</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;