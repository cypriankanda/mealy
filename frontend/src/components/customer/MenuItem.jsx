import React from 'react';
import PropTypes from 'prop-types';
import { ShoppingCartIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const MenuItem = ({ meal, onOrder, disabled, showDetails = false }) => {
  // Placeholder image URL with a food theme
  const imageUrl = meal.imageUrl || `https://placehold.co/400x250/FF9800/FFFFFF?text=${encodeURIComponent(meal.name || 'Delicious Meal')}`;

  return (
    <div
      className="relative bg-white/70 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden
                 transform hover:scale-[1.02] transition-all duration-300 ease-in-out
                 flex flex-col h-full font-inter"
    >
      {/* Meal Image */}
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={meal.name || 'Meal'}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x250/FF9800/FFFFFF?text=Image+Not+Found`; }}
        />
        {/* Price Overlay */}
        <div className="absolute bottom-0 right-0 bg-gradient-to-tr from-orange-500 to-red-600 text-white px-4 py-2 rounded-tl-xl text-lg font-bold shadow-lg">
          KSh {meal.price !== undefined ? meal.price.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow p-6 flex flex-col">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
          {meal.name || 'Meal Name'}
        </h3>
        <p className="text-sm text-gray-600 flex-grow mb-4">
          {meal.description || 'A delightful dish prepared with fresh ingredients and a touch of culinary magic.'}
        </p>

        {showDetails && (
          <div className="mb-4 text-sm text-gray-700 border-t border-gray-200 pt-4">
            <p className="font-semibold mb-1">Nutritional Info:</p>
            <ul className="list-disc list-inside text-xs text-gray-500">
              <li>Calories: 500 kcal</li>
              <li>Protein: 25g</li>
              <li>Carbs: 60g</li>
            </ul>
            <button className="mt-3 inline-flex items-center text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors duration-200">
              Full Details <ChevronRightIcon className="ml-1 h-4 w-4" />
            </button>
          </div>
        )}

        {onOrder && (
          <div className="mt-auto pt-4"> {/* mt-auto pushes button to bottom */}
            <button
              onClick={() => onOrder(meal.id)}
              disabled={disabled}
              className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white
                ${disabled
                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 focus:ring-4 focus:ring-orange-300'
                } transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-95`}
            >
              <ShoppingCartIcon className="h-6 w-6 mr-3" />
              {disabled ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

MenuItem.propTypes = {
  meal: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    imageUrl: PropTypes.string, // Added for potential image URL
  }).isRequired,
  onOrder: PropTypes.func,
  disabled: PropTypes.bool,
  showDetails: PropTypes.bool,
};

export default MenuItem;
