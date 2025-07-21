import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import PropTypes from 'prop-types'

const OrderCard = ({ order, onCancel, showActions = false, showStatus = false }) => {
  const statusIcons = {
    confirmed: <ClockIcon className="h-5 w-5 text-yellow-500" />,
    preparing: <ClockIcon className="h-5 w-5 text-blue-500" />,
    ready: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
    delivered: <CheckCircleIcon className="h-5 w-5 text-gray-500" />,
    cancelled: <XCircleIcon className="h-5 w-5 text-red-500" />,
  }

  const statusText = {
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready for Pickup',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {showStatus && statusIcons[order.status]}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {order.meal_name || 'Meal'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
            {order.created_at
  ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  : 'N/A'}
            </p>
            {showStatus && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'ready' ? 'bg-green-100 text-green-800' :
                  order.status === 'delivered' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {statusText[order.status]}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">KSh {order.price !== undefined ? Number(order.price).toLocaleString() : 'N/A'}</p>
          <p className="text-sm text-gray-500">
            {order.created_at
              ? new Date(order.created_at).toLocaleTimeString('en-KE', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'Africa/Nairobi'
                })
              : 'N/A'}
          </p>
        </div>
      </div>
      
      {showActions && ['confirmed', 'preparing'].includes(order.status) && (
        <div className="mt-4">
          <button
            onClick={() => onCancel(order.order_id)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  )
}

OrderCard.propTypes = {
  order: PropTypes.object.isRequired,
  onCancel: PropTypes.func,
  showActions: PropTypes.bool,
  showStatus: PropTypes.bool,
}

export default OrderCard