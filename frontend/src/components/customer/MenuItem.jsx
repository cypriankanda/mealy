import { ShoppingCartIcon } from '@heroicons/react/24/outline'

const MenuItem = ({ meal, onOrder, disabled, showDetails = false }) => {
  // Removed unused isHovered state

  return (
    <div 
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="font-medium text-gray-900">{meal.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{meal.description}</p>
          
          {showDetails && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Price: KSh {meal.price}</p>
            </div>
          )}
        </div>
        
        {onOrder && (
          <div className="mt-4">
            <button
              onClick={() => onOrder(meal.id)}
              disabled={disabled}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                disabled ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
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

export default MenuItem