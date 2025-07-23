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
  const [yesterdayStats, setYesterdayStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [popularMeal, setPopularMeal] = useState(null);
  const [cancelledOrdersCount, setCancelledOrdersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Get all orders first
        const allOrdersResponse = await api.get("/admin/orders");
        const allOrders = allOrdersResponse.data.data;

        // Filter orders for today and yesterday
        const todayOrders = allOrders.filter(order => 
          new Date(order.created_at).toDateString() === today.toDateString()
        );
        const yesterdayOrders = allOrders.filter(order => 
          new Date(order.created_at).toDateString() === yesterday.toDateString()
        );

        // Calculate today's stats
        const todayStats = {
          total_orders: todayOrders.length,
          total_revenue: todayOrders
            .filter(order => order.status !== 'cancelled')
            .reduce((sum, order) => sum + order.price, 0),
          cancelled_orders: todayOrders
            .filter(order => order.status === 'cancelled')
            .length
        };

        // Calculate yesterday's stats
        const yesterdayStats = {
          total_orders: yesterdayOrders.length,
          total_revenue: yesterdayOrders
            .filter(order => order.status !== 'cancelled')
            .reduce((sum, order) => sum + order.price, 0),
          cancelled_orders: yesterdayOrders
            .filter(order => order.status === 'cancelled')
            .length
        };

        // Get recent orders
        const recentOrdersResponse = await api.get("/admin/orders?per_page=5");

        setStats(todayStats);
        setYesterdayStats(yesterdayStats);
        setRecentOrders(recentOrdersResponse.data.data);
        setCancelledOrdersCount(todayStats.cancelled_orders);

        // Calculate monthly orders
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const monthlyCount = allOrders.filter(order => {
          const orderDate = new Date(order.created_at);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        }).length;
        setMonthlyOrders(monthlyCount);

        // Calculate most popular meal from recent orders
        const mealCounts = {};
        const mealRevenue = {};

        recentOrdersResponse.data.data.forEach((order) => {
          if (order.status !== "cancelled") {
            mealCounts[order.meal_name] = (mealCounts[order.meal_name] || 0) + 1;
            mealRevenue[order.meal_name] = (mealRevenue[order.meal_name] || 0) + order.price;
          }
        });

        let mostPopular = null;
        Object.entries(mealCounts).forEach(([name, count]) => {
          if (!mostPopular || count > mostPopular.count) {
            mostPopular = {
              name,
              count,
              total_revenue: mealRevenue[name],
            };
          }
        });

        if (mostPopular) {
          setPopularMeal({
            name: mostPopular.name,
            order_count: mostPopular.count,
            average_price: mostPopular.total_revenue / mostPopular.count,
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate comparison with yesterday
  const getComparisonText = (todayValue, yesterdayValue, isCurrency = false) => {
    if (yesterdayValue === undefined || yesterdayValue === 0) {
      return "No data for yesterday";
    }

    const difference = todayValue - yesterdayValue;
    const percentage = Math.round((difference / yesterdayValue) * 100);
    const absoluteDifference = Math.abs(difference);
    
    const formattedDifference = isCurrency 
      ? `KSh ${absoluteDifference.toLocaleString("en-KE")}` 
      : absoluteDifference;

    return {
      text: `${difference >= 0 ? '+' : '-'}${formattedDifference} (${Math.abs(percentage)}%) from yesterday`,
      isIncrease: difference >= 0
    };
  };

  const ordersComparison = getComparisonText(
    stats?.total_orders || 0, 
    yesterdayStats?.total_orders || 0
  );

  const revenueComparison = getComparisonText(
    stats?.total_revenue || 0, 
    yesterdayStats?.total_revenue || 0,
    true
  );

  const cancelledComparison = getComparisonText(
    cancelledOrdersCount || 0,
    yesterdayStats?.cancelled_orders || 0
  );

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
            value={stats?.total_orders || 0}
            change={ordersComparison.text}
            isIncrease={ordersComparison.isIncrease}
            icon={<ShoppingBagIcon className="h-6 w-6 text-primary-500" />}
            color="primary"
          />
          <StatCard
            title="Today's Revenue"
            value={`KSh ${stats?.total_revenue?.toLocaleString("en-KE") || 0}`}
            change={revenueComparison.text}
            isIncrease={revenueComparison.isIncrease}
            icon={<CurrencyDollarIcon className="h-6 w-6 text-green-500" />}
            color="green"
          />
          <StatCard
            title="Total Orders"
            value={monthlyOrders}
            change="This month"
            icon={<ShoppingBagIcon className="h-6 w-6 text-blue-500" />}
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={`KSh ${stats?.total_revenue?.toLocaleString("en-KE") || 0}`}
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
                  <div
                    key={order.order_id}
                    className={`p-4 rounded-lg border ${
                      order.status === "delivered"
                        ? "border-green-200 bg-green-50"
                        : order.status === "cancelled"
                        ? "border-red-200 bg-red-50"
                        : order.status === "ready"
                        ? "border-gray-200 bg-gray-50"
                        : order.status === "preparing"
                        ? "border-blue-200 bg-blue-50"
                        : "border-yellow-200 bg-yellow-50"
                    }`}
                  >
                    <OrderItem order={order} />
                  </div>
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
                  <span className="font-medium">{stats?.total_orders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Revenue Generated</span>
                  <span className="font-medium">
                    KSh {stats?.total_revenue?.toLocaleString("en-KE")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cancelled Orders</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{cancelledOrdersCount}</span>
                    <div className="flex items-center text-sm text-gray-500">
                      {/* {cancelledComparison.isIncrease ? (
                        <ArrowUpIcon className="h-4 w-4 text-red-500 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-green-500 mr-1" />
                      )} */}
                      <span>{cancelledComparison.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-orange-500 mb-4">
                Most Popular Meal
              </h2>
              {popularMeal ? (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 bg-primary-100 rounded-lg p-3">
                    <ChartBarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {popularMeal.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Top selling item this week
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Average order value: KSh{" "}
                      {popularMeal.average_price?.toFixed(2) || "0"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {popularMeal.order_count} orders
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

const StatCard = ({ title, value, change, isIncrease, icon, color }) => {
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
          <div className="flex items-center justify-end text-sm text-gray-500">
            {isIncrease ? (
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span>{change}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderItem = ({ order }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              order.status === "delivered"
                ? "bg-green-100 text-green-800"
                : order.status === "cancelled"
                ? "bg-red-100 text-red-800"
                : order.status === "ready"
                ? "bg-gray-100 text-gray-800"
                : order.status === "preparing"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{order.meal_name}</h3>
          <p className="text-sm text-gray-500">{order.customer_email}</p>
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
            timeZone: "Africa/Nairobi",
          })}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
