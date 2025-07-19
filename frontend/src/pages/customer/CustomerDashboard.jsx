import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const navigate = useNavigate();
  const API_URL = 'https://mealy-production.up.railway.app/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, orderRes] = await Promise.all([
          axios.get(`${API_URL}/menu/today`),
          axios.get(`${API_URL}/orders/current`),
        ]);
        setMenu(menuRes.data.meals);
        setCurrentOrder(orderRes.data);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const placeOrder = async () => {
    if (!selectedMeal) return;
    try {
      const res = await axios.post(`${API_URL}/orders`, { meal_id: selectedMeal.id });
      setCurrentOrder(res.data);
    } catch (err) {
      setError('Failed to place order');
    }
  };

  const cancelOrder = async () => {
    try {
      await axios.delete(`${API_URL}/orders/${currentOrder.order_id}`);
      setCurrentOrder(null);
    } catch (err) {
      setError('Failed to cancel order');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} logout={logout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Today's Menu</h1>
            <p className="mt-1 text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            {currentOrder ? (
              <div className="mt-6 bg-green-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-green-800">Order confirmed!</h2>
                <p className="mt-1 text-green-700">Your meal for today has been ordered.</p>
                
                <div className="mt-4 border-t border-green-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {currentOrder.meal_name}
                  </h3>
                  <p className="mt-1 text-gray-600">
                    {menu.find(m => m.id === currentOrder.meal_id)?.description || ''}
                  </p>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={cancelOrder}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Change Order
                  </button>
                  <p className="text-lg font-medium text-gray-900">KSh {currentOrder.price}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  {menu.map((meal) => (
                    <div 
                      key={meal.id} 
                      className={`p-4 border rounded-lg cursor-pointer ${selectedMeal?.id === meal.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedMeal(meal)}
                    >
                      <h3 className="text-lg font-medium text-gray-900">{meal.name}</h3>
                      <p className="mt-1 text-gray-600">{meal.description}</p>
                      {selectedMeal?.id === meal.id && (
                        <p className="mt-2 text-sm text-indigo-600">Selected</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <p className="text-lg font-medium text-gray-900">
                    {selectedMeal ? `KSh ${selectedMeal.price}` : 'Select a meal'}
                  </p>
                  <button
                    onClick={placeOrder}
                    disabled={!selectedMeal}
                    className={`px-4 py-2 rounded-md text-sm font-medium text-white ${selectedMeal ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;