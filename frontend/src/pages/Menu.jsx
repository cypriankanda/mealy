import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import MenuItem from '../components/customer/MenuItem'

const Menu = () => {
  const { date } = useParams()
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const url = date ? `/menu/${date}` : '/menu/today'
        const response = await api.get(url)
        setMenu(response.data.meals)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load menu')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [date])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {date ? `Menu for ${new Date(date).toLocaleDateString()}` : "Today's Menu"}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((meal) => (
            <MenuItem 
              key={meal.id} 
              meal={meal} 
              showDetails={true}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Menu