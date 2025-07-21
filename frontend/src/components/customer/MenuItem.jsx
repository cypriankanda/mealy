import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

const MenuItem = ({ meal, onOrder, disabled, showDetails = false }) => {
  // Removed unused isHovered state

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="font-medium text-gray-900">{meal.name || 'Meal'}</h3>
          <p className="text-sm text-gray-500 mt-1">{meal.description || 'No description'}</p>
          
          {showDetails && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Price: KSh {meal.price !== undefined ? meal.price : 'N/A'}</p>
            </div>
          )}
        </div>
        
        {onOrder && (
          <div className="mt-4">
            <button
              onClick={() => onOrder(meal.id)}
              disabled={disabled}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white ${
                disabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
              } transition-colors duration-200`}
            >
              <ShoppingCartIcon className="h-5 w-5 mr-2" />
              {disabled ? 'Already Ordered' : 'Order Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

MenuItem.propTypes = {
  meal: PropTypes.object.isRequired,
  onOrder: PropTypes.func,
  disabled: PropTypes.bool,
  showDetails: PropTypes.bool,
}

export default MenuItem