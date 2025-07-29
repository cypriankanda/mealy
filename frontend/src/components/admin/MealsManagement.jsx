import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import MealForm from './MealForm'

const MealsManagement = () => {
  useAuth()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await api.get('/admin/meals')
        setMeals(response.data)
      } catch (error) {
        console.error('Error fetching meals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMeals()
  }, [])

  const handleCreateMeal = async (mealData) => {
    try {
      const response = await api.post('/admin/meals', mealData)
      setMeals([response.data, ...meals])
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error creating meal:', error)
      throw error.response?.data?.message || 'Failed to create meal'
    }
  }

  const handleUpdateMeal = async (mealId, mealData) => {
    try {
      const response = await api.put(`/admin/meals/${mealId}`, mealData)
      setMeals(meals.map(meal => 
        meal.id === mealId ? response.data : meal
      ))
      setEditingMeal(null)
    } catch (error) {
      console.error('Error updating meal:', error)
      throw error.response?.data?.message || 'Failed to update meal'
    }
  }

  const handleDeleteMeal = async (mealId) => {
    try {
      await api.delete(`/admin/meals/${mealId}`)
      setMeals(meals.filter(meal => meal.id !== mealId))
    } catch (error) {
      console.error('Error marking meal as unavailable:', error)
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Meals</h1>
        <p className="text-gray-600 mb-6">Add and manage your meal offerings</p>
        
        <button
          onClick={() => {
            setEditingMeal(null)
            setIsFormOpen(true)
          }}
          className="mb-6 cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Add Meal
        </button>
        
        <div className="space-y-4">
          {meals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No meals found. Add your first meal!</p>
            </div>
          ) : (
            meals.map((meal) => (
              <MealItem 
                key={meal.id} 
                meal={meal} 
                onEdit={() => {
                  setEditingMeal(meal)
                  setIsFormOpen(true)
                }}
                onDelete={() => handleDeleteMeal(meal.id)}
              />
            ))
          )}
        </div>
      </div>
      
      <MealForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingMeal(null)
        }}
        onSubmit={editingMeal ? 
          (data) => handleUpdateMeal(editingMeal.id, data) : 
          handleCreateMeal
        }
        initialData={editingMeal || null}
      />
    </div>
  )
}

const MealItem = ({ meal, onEdit, onDelete }) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-100 ${meal.is_active === false ? 'opacity-50' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900">{meal.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{meal.description}</p>
          <p className="text-sm font-medium text-gray-900 mt-2">KSh {meal.price.toLocaleString('en-KE')}</p>
          {meal.is_active === false && (
            <span className="text-xs text-red-500 font-semibold">Unavailable</span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MealsManagement