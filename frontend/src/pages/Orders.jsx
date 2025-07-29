import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Assuming this path is correct
import api from '../services/api'; // Assuming this path is correct
import OrderCard from '../components/customer/OrderCard'; // Assuming this component exists and is styled appropriately
import { ChevronRightIcon } from '@heroicons/react/24/outline'; // Importing for the "Browse Menu" button

const Orders = () => {
  useAuth(); // Ensure auth context is used
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true); // Set loading true before fetch
        setError(null); // Clear previous errors
        const response = await api.get('/orders/history');
        setOrders(response.data.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please check your connection or try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    // Implement a confirmation dialog here instead of alert/confirm
    // For this example, we'll proceed directly but in a real app, a modal would be used.
    if (!window.confirm("Are you sure you want to cancel this order?")) { // Use a custom modal in production
      return;
    }

    try {
      // Optimistic update
      const originalOrders = [...orders];
      setOrders(orders.filter(order => order.order_id !== orderId));
      
      await api.delete(`/orders/${orderId}`);
      // If successful, no further action needed for optimistic update
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again.');
      // Revert if API call fails
      setOrders(originalOrders);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mx-auto max-w-4xl w-full animate-fade-in-up">
        <div className="relative flex justify-center items-center mb-6">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-orange-500"></div>
          <div className="absolute rounded-full h-20 w-20 border-t-4 border-b-4 border-green-500 animate-spin-reverse"></div>
        </div>
        <p className="mt-6 text-2xl font-semibold text-gray-700 animate-pulse-slow">
          <span className="bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
            Preparing your order list...
          </span>
        </p>
        <p className="text-md text-gray-500 mt-2">Just a moment while we fetch your delicious history.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-red-50/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 mx-auto max-w-4xl w-full text-red-700 animate-shake animate-fade-in-up">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-2xl font-bold mb-2">{error}</p>
        <p className="text-lg text-gray-600">It looks like we ran into a problem.</p>
        <button 
          onClick={() => window.location.reload()} // Simple refresh, consider more sophisticated retry logic in production
          className="mt-6 inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300 transition-all duration-300 transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-inter animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-green-700 bg-clip-text text-transparent mb-10 text-center md:text-left">
          Your Culinary Journey
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center animate-fade-in-up">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-gray-300 mb-8 animate-bounce-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-3xl font-bold text-gray-700 mb-4">No Orders Found Yet!</p>
            <p className="text-xl text-gray-500 mb-8 max-w-lg">
              It looks like your order history is empty. Let's fill it with some delicious meals!
            </p>
            <a href="/customer" className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105">
              Explore Our Menu
              <ChevronRightIcon className="ml-3 h-6 w-6" aria-hidden="true" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orders.map((order, index) => (
              <div key={order.order_id} className={`animate-fade-in-up animation-delay-${index * 100}`}>
                <OrderCard 
                  order={order} 
                  onCancel={handleCancelOrder} 
                  showActions={true}
                />
              </div>
            ))}
          </div>
        )}
      </div>
       {/* Tailwind CSS Custom Styles (for animations) - Duplicated for self-containment */}
       <style jsx>{`
        @keyframes fadeInScaleUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInScaleUp 0.6s ease-out forwards;
        }

        /* Staggered animation delays for cards */
        .animation-delay-0 { animation-delay: 0s; }
        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-600 { animation-delay: 0.6s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-900 { animation-delay: 0.9s; }
        .animation-delay-1000 { animation-delay: 1s; }


        @keyframes spinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spinReverse 1s linear infinite;
        }

        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s infinite ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounceSlow 2s infinite ease-in-out;
        }

        /* Inter Font Import */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Orders;
