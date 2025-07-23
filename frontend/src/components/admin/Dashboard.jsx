import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/orders?per_page=5"),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateChange = (today, yesterday) => {
    if (yesterday === 0) return '+100%'; // Avoid division by zero
    const change = ((today - yesterday) / yesterday) * 100;
    const changeValue = Math.round(change);
    
    return (
      <span className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {change >= 0 ? (
          <ArrowUpIcon className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 mr-1" />
        )}
        {Math.abs(changeValue)}% from yesterday
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-orange-500 mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-6">Overview of your catering business</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Orders"
            value={stats?.today_orders || 0}
            change={calculateChange(stats?.today_orders || 0, stats?.yesterday_orders || 0)}
            icon={<ShoppingBagIcon className="h-6 w-6 text-primary-500" />}
            color="primary"
          />
          <StatCard
            title="Today's Revenue"
            value={`KSh ${(stats?.today_revenue || 0).toLocaleString("en-KE")}`}
            change={calculateChange(stats?.today_revenue || 0, stats?.yesterday_revenue || 0)}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-green-500" />}
            color="green"
          />
          <StatCard
            title="Month Orders"
            value={stats?.month_orders || 0}
            change="This month"
            icon={<ShoppingBagIcon className="h-6 w-6 text-blue-500" />}
            color="blue"
          />
          <StatCard
            title="Month Revenue"
            value={`KSh ${(stats?.month_revenue || 0).toLocaleString("en-KE")}`}
            change="This month"
            icon={<CurrencyDollarIcon className="h-6 w-6 text-purple-500" />}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-orange-500 mb-4">
                Recent Orders
              </h2>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <OrderItem key={order.order_id} order={order} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-orange-500 mb-4">
                Today's Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Orders Received</span>
                  <span className="font-medium">{stats?.today_orders || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenue Generated</span>
                  <span className="font-medium">
                    KSh {(stats?.today_revenue || 0).toLocaleString("en-KE")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cancelled Orders</span>
                  <span className="font-medium">
                    {stats?.today_cancelled || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-orange-500 mb-4">
                Most Popular Meal
              </h2>
              {stats?.popular_meal ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
                    <ChartBarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {stats.popular_meal.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Top selling item this week
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Average order value: KSh {stats.popular_meal.avg_price.toLocaleString("en-KE")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {stats.popular_meal.order_count} orders
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No popular meal data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    primary: "bg-primary-100 text-primary-600",
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>{icon}</div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <div className="flex items-center justify-end text-sm">
            {change}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderItem = ({ order }) => {
  const statusColors = {
    delivered: 'bg-green-50 border-green-100',
    cancelled: 'bg-red-50 border-red-100',
    confirmed: 'bg-yellow-50 border-yellow-100',
    preparing: 'bg-blue-50 border-blue-100',
    ready: 'bg-gray-50 border-gray-100',
  };

  const statusTextColors = {
    delivered: 'text-green-800',
    cancelled: 'text-red-800',
    confirmed: 'text-yellow-800',
    preparing: 'text-blue-800',
    ready: 'text-gray-800',
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg ${statusColors[order.status] || 'bg-white'} border`}>
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
          <ShoppingBagIcon className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{order.meal_name}</h3>
          <p className="text-sm text-gray-500">{order.customer_email}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${statusTextColors[order.status]}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900">
          KSh {order.price.toLocaleString("en-KE")}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleTimeString("en-KE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;