import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

const OrdersManagement = () => {
  useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api.get("/admin/orders");
        setOrders(response.data.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders(
        orders.map((order) =>
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const calculateTodaysRevenue = () => {
    return orders
      .filter(
        (o) =>
          new Date(o.created_at).toDateString() === new Date().toDateString() &&
          o.status === "delivered" // Only count delivered orders for today's revenue
      )
      .reduce((sum, o) => sum + o.price, 0);
  };

  // const calculateTotalRevenue = () => {
  //   return orders
  //     .filter((o) => o.status === "delivered") // Only count delivered orders for total revenue
  //     .reduce((sum, o) => sum + o.price, 0);
  // };

  const calculateTodaysOrders = () => {
    return orders.filter(
      (o) =>
        new Date(o.created_at).toDateString() === new Date().toDateString() &&
        o.status === "delivered" // Only count delivered orders for today's count
    ).length;
  };

  const calculateTodaysCancelledOrders = () => {
    return orders.filter(
      (o) =>
        new Date(o.created_at).toDateString() === new Date().toDateString() &&
        o.status === "cancelled"
    ).length;
  };

  const getFilteredOrders = () => {
    if (activeTab === "pending") {
      return orders.filter((order) =>
        ["confirmed", "preparing", "ready"].includes(order.status)
      );
    } else if (activeTab === "cancelled") {
      return orders.filter((order) => order.status === "cancelled");
    }
    return orders;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
        {/* Loading animation remains the same */}
      </div>
    );
  }

  const displayedOrders = getFilteredOrders();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
      {/* Background elements remain the same */}
      <div className="relative z-10 space-y-8 p-4 sm:p-6 lg:p-8 animate-fade-in">
        {/* Header Section */}
        <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Orders Management
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Efficiently manage all customer orders, update statuses, and track revenue.
          </p>
        </div>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Today's Orders"
            value={calculateTodaysOrders()}
            icon={<ShoppingBagIcon className="h-7 w-7" />}
            gradient="from-orange-400 to-orange-600"
            delay="0"
          />
          <StatCard
            title="Pending Orders"
            value={
              orders.filter((o) =>
                ["confirmed", "preparing", "ready"].includes(o.status)
              ).length
            }
            icon={<ClockIcon className="h-7 w-7" />}
            gradient="from-yellow-400 to-yellow-600"
            delay="100"
          />
          <StatCard
            title="Today's Revenue"
            value={`KSh ${calculateTodaysRevenue().toLocaleString("en-KE")}`}
            icon={<CurrencyDollarIcon className="h-7 w-7" />}
            gradient="from-green-400 to-green-600"
            delay="200"
          />
          <StatCard
            title="Cancelled Today"
            value={calculateTodaysCancelledOrders()}
            icon={<XCircleIcon className="h-7 w-7" />}
            gradient="from-red-400 to-red-600"
            delay="300"
          />
        </div>

        {/* Tabs and Order List */}
        <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-4 sm:p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="mb-4 border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-x-6 sm:gap-x-8 gap-y-2">
              <TabButton
                label="Pending Orders"
                isActive={activeTab === "pending"}
                onClick={() => setActiveTab("pending")}
              />
              <TabButton
                label="Cancelled Orders"
                isActive={activeTab === "cancelled"}
                onClick={() => setActiveTab("cancelled")}
              />
              <TabButton
                label="All Orders"
                isActive={activeTab === "all"}
                onClick={() => setActiveTab("all")}
              />
            </nav>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-4">
            {activeTab === "pending" ? "Active Orders" : 
             activeTab === "cancelled" ? "Cancelled Orders" : "All Customer Orders"}
          </h2>

          <div className="space-y-4">
            {displayedOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No {activeTab === "pending" ? "pending" : activeTab === "cancelled" ? "cancelled" : ""} orders found</h3>
                <p className="text-gray-400">Looks like it's quiet here. Check back later!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {displayedOrders.map((order, index) => (
                  <OrderCard
                    key={order.order_id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    delay={`${500 + index * 50}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tailwind CSS Animations (copy from dashboard or define in a global CSS file) */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Reusable StatCard component (copied from dashboard for consistency)
const StatCard = ({ title, value, icon, gradient, delay }) => {
  return (
    <div
      className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-5 sm:p-6 hover:scale-105 hover:shadow-3xl transition-all duration-300 animate-slide-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`rounded-2xl p-3 sm:p-4 bg-gradient-to-r ${gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{value}</p>
      </div>
    </div>
  );
};

// Reusable TabButton component for cleaner tab navigation
const TabButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors duration-200
      ${isActive
        ? "border-orange-500 text-orange-600 font-semibold"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
  >
    {label}
  </button>
);

// OrderCard component with improved styling and responsiveness
const OrderCard = ({ order, onStatusUpdate, delay }) => {
  const getStatusPillConfig = (status) => {
    const configs = {
      delivered: {
        gradient: "from-green-400 to-green-600",
        icon: <CheckCircleIcon className="h-4 w-4" />
      },
      cancelled: {
        gradient: "from-red-400 to-red-600",
        icon: <XCircleIcon className="h-4 w-4" />
      },
      ready: {
        gradient: "from-blue-400 to-blue-600",
        icon: <CheckCircleIcon className="h-4 w-4" />
      },
      preparing: {
        gradient: "from-yellow-400 to-yellow-600",
        icon: <CogIcon className="h-4 w-4 animate-spin" />
      },
      confirmed: { // Renamed from 'pending' to 'confirmed' for consistency
        gradient: "from-orange-400 to-orange-600",
        icon: <ClockIcon className="h-4 w-4" />
      }
    };
    return configs[status] || configs.confirmed; // Default to confirmed
  };

  const statusPillConfig = getStatusPillConfig(order.status);

  const statusActions = {
    confirmed: [
      { label: "Start Preparing", status: "preparing", gradient: "from-blue-500 to-blue-700" },
      { label: "Cancel", status: "cancelled", gradient: "from-red-500 to-red-700" },
    ],
    preparing: [
      { label: "Mark Ready", status: "ready", gradient: "from-green-500 to-green-700" },
      { label: "Cancel", status: "cancelled", gradient: "from-red-500 to-red-700" },
    ],
    ready: [
      { label: "Mark Delivered", status: "delivered", gradient: "from-green-500 to-green-700" },
      { label: "Cancel", status: "cancelled", gradient: "from-red-500 to-red-700" },
    ],
  };

  return (
    <div
      className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-xl rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-300 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-3">
        {/* Status Pill */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-md bg-gradient-to-r ${statusPillConfig.gradient}`}>
          {statusPillConfig.icon}
          <span className="ml-1 capitalize">{order.status}</span>
        </div>
        <p className="font-semibold text-lg text-gray-900">
          KSh {Number(order.price).toLocaleString("en-KE")}
        </p>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
        {order.meal_name}
      </h3>
      <p className="text-sm text-gray-600 mb-3 truncate">
        Order from: <span className="font-medium text-gray-800">{order.customer_email}</span>
      </p>

      <div className="flex items-center text-sm text-gray-500 mb-4">
        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
        <span>
          Ordered on:{" "}
          {new Date(order.created_at).toLocaleDateString("en-KE", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </span>
      </div>

      {statusActions[order.status] && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
          {statusActions[order.status].map((action) => (
            <button
              key={action.status}
              onClick={() => onStatusUpdate(order.order_id, action.status)}
              className={`inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white transition-all duration-200
                bg-gradient-to-r ${action.gradient}
                hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-75`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;