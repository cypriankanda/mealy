import { useAuth } from '../context/AuthContext'

// Helper function to trigger global refresh when order status changes
export const triggerOrderStatusUpdate = (triggerRefresh) => {
  if (triggerRefresh) {
    // Trigger immediate refresh
    triggerRefresh()
    
    // Also trigger a delayed refresh to ensure all components are updated
    setTimeout(() => {
      triggerRefresh()
    }, 2000)
  }
}

// Helper function to handle order status updates with optimistic updates
export const handleOrderStatusUpdate = async (
  orderId, 
  newStatus, 
  apiCall, 
  setOrders, 
  triggerRefresh,
  onSuccess = null,
  onError = null
) => {
  try {
    // Make the API call
    await apiCall(orderId, newStatus)
    
    // Optimistic update
    setOrders(prevOrders =>
      prevOrders.map((order) =>
        order.order_id === orderId ? { ...order, status: newStatus } : order
      )
    )
    
    // Trigger global refresh
    triggerOrderStatusUpdate(triggerRefresh)
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess()
    }
  } catch (error) {
    console.error("Error updating order status:", error)
    
    // Revert optimistic update on error
    if (triggerRefresh) {
      triggerRefresh()
    }
    
    // Call error callback if provided
    if (onError) {
      onError(error)
    }
  }
}

// Helper function to handle order creation with global refresh
export const handleOrderCreation = async (
  orderData,
  apiCall,
  setCurrentOrder,
  triggerRefresh,
  onSuccess = null,
  onError = null
) => {
  try {
    // Make the API call
    await apiCall(orderData)
    
    // Fetch updated current order
    const orderRes = await fetch('/api/orders/current')
    const orderData = await orderRes.json()
    setCurrentOrder(orderData)
    
    // Trigger global refresh
    triggerOrderStatusUpdate(triggerRefresh)
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess()
    }
  } catch (error) {
    console.error("Error creating order:", error)
    
    // Call error callback if provided
    if (onError) {
      onError(error)
    }
  }
}

// Helper function to handle order cancellation with global refresh
export const handleOrderCancellation = async (
  orderId,
  apiCall,
  setCurrentOrder,
  triggerRefresh,
  onSuccess = null,
  onError = null
) => {
  try {
    // Make the API call
    await apiCall(orderId)
    
    // Clear current order
    setCurrentOrder(null)
    
    // Trigger global refresh
    triggerOrderStatusUpdate(triggerRefresh)
    
    // Call success callback if provided
    if (onSuccess) {
      onSuccess()
    }
  } catch (error) {
    console.error("Error cancelling order:", error)
    
    // Call error callback if provided
    if (onError) {
      onError(error)
    }
  }
} 