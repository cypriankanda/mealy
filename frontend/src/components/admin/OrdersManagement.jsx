import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

const OrdersManagement = () => {
  useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
  try {
    let params = {};
    if (activeTab === "pending") {
      params.status = ["confirmed", "preparing", "ready"];
    }

    const response = await api.get("/admin/orders", { params });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const calculateTodaysRevenue = () => {
    return orders
      .filter(
        (o) =>
          new Date(o.created_at).toDateString() === new Date().toDateString() &&
          o.status !== "cancelled"
      )
      .reduce((sum, o) => sum + o.price, 0);
  };

  // Calculate total revenue excluding canceled orders
  const calculateTotalRevenue = () => {
    return orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.price, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">
          Orders Management
        </h1>
        <p className="text-gray-600 mb-6">View and manage customer orders</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Today's Orders"
            value={
              orders.filter(
                (o) =>
                  new Date(o.created_at).toDateString() ===
                  new Date().toDateString()
              ).length
            }
            icon={<ShoppingBagIcon className="h-6 w-6 text-primary-500" />}
          />
          <StatCard
            title="Pending Orders"
            value={
              orders.filter((o) =>
                ["confirmed", "preparing", "ready"].includes(o.status)
              ).length
            }
            icon={<ClockIcon className="h-6 w-6 text-yellow-500" />}
          />
          <StatCard
            title="Today's Revenue"
            value={`KSh ${calculateTodaysRevenue().toLocaleString("en-KE")}`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-green-500" />}
          />
          <StatCard
            title="Total Revenue"
            value={`KSh ${calculateTotalRevenue().toLocaleString("en-KE")}`}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-blue-500" />}
          />
        </div>

        <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("pending")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-primary-500 text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Orders
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "all"
                  ? "border-primary-500 text-orange-500"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Orders
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            {activeTab === "pending" ? "Pending Orders" : "All Orders"}
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="rounded-lg p-3 bg-gray-100">{icon}</div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ order, onStatusUpdate }) => {
  const statusColors = {
    confirmed: "bg-yellow-100 text-yellow-800",
    preparing: "bg-blue-100 text-blue-800",
    ready: "bg-gray-100 text-gray-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusActions = {
    confirmed: [
      {
        label: "Start Preparing",
        status: "preparing",
        color: "blue",
        class: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      },
      {
        label: "Cancel",
        status: "cancelled",
        color: "red",
        class: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      },
    ],
    preparing: [
      {
        label: "Mark Ready",
        status: "ready",
        color: "green",
        class: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      },
      {
        label: "Cancel",
        status: "cancelled",
        color: "red",
        class: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      },
    ],
    ready: [
      {
        label: "Mark Delivered",
        status: "delivered",
        color: "green",
        class: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      },
      {
        label: "Cancel",
        status: "cancelled",
        color: "red",
        class: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                statusColors[order.status]
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              Order #{order.order_id}
            </h3>
            <p className="text-sm text-gray-500 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
              {order.customer_email}
            </p>
            <div className="mt-2">
              <p className="text-sm text-gray-900">{order.meal_name}</p>
              <p className="text-sm text-gray-500">
                {new Date(order.menu_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">
            KSh {Number(order.price).toLocaleString("en-KE")}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleTimeString("en-KE", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Africa/Nairobi",
            })}
          </p>
        </div>
      </div>

      {statusActions[order.status] && (
        <div className="mt-4 flex space-x-2">
          {statusActions[order.status].map((action) => (
            <button
              key={action.status}
              onClick={() => onStatusUpdate(order.order_id, action.status)}
              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white ${action.class} focus:outline-none focus:ring-2 focus:ring-offset-2`}
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
