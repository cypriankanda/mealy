import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const AdminMeals = () => {
  const { user, logout } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeal, setNewMeal] = useState({ name: '', description: '', price: '' });
  const navigate = useNavigate();
  const API_URL = 'https://mealy-production.up.railway.app/api/admin';

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get(`${API_URL}/meals`);
        setMeals(res.data);
      } catch (err) {
        setError('Failed to fetch meals');
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  const handleAddMeal = async () => {
    try {
      const res = await axios.post(`${API_URL}/meals`, newMeal);
      setMeals([...meals, res.data]);
      setShowAddForm(false);
      setNewMeal({ name: '', description: '', price: '' });
    } catch (err) {
      setError('Failed to add meal');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await axios.delete(`${API_URL}/meals/${mealId}`);
      setMeals(meals.filter(meal => meal.id !== mealId));
    } catch (err) {
      setError('Failed to delete meal');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar user={user} logout={logout} admin />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Meals</h1>
          <p className="mt-1 text-gray-600">Add and manage your meal offerings</p>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            {error && <div className="mb-4 text-red-500">{error}</div>}
            
            {meals.map((meal) => (
              <div key={meal.id} className="border-b border-gray-200 py-4">
                <h3 className="text-lg font-medium">{meal.name}</h3>
                <p className="mt-1 text-gray-600">{meal.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-gray-900">KSh {meal.price}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin/meals/${meal.id}/edit`)}
                      className="text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-sm text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {showAddForm ? (
              <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newMeal.description}
                      onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newMeal.price}
                      onChange={(e) => setNewMeal({ ...newMeal, price: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMeal}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Meal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-6 w-full flex justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                + Add Meal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMeals;