import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon,
  TrophyIcon,
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
        const todayOrders = allOrders.filter(
          (order) =>
            new Date(order.created_at).toDateString() === today.toDateString()
        );
        const yesterdayOrders = allOrders.filter(
          (order) =>
            new Date(order.created_at).toDateString() ===
            yesterday.toDateString()
        );

        // Calculate today's stats
        const todayStats = {
          total_orders: todayOrders.length,
          total_revenue: todayOrders
            .filter((order) => order.status !== "cancelled")
            .reduce((sum, order) => sum + order.price, 0),
          cancelled_orders: todayOrders.filter(
            (order) => order.status === "cancelled"
          ).length,
        };

        // Calculate yesterday's stats
        const yesterdayStats = {
          total_orders: yesterdayOrders.length,
          total_revenue: yesterdayOrders
            .filter((order) => order.status !== "cancelled")
            .reduce((sum, order) => sum + order.price, 0),
          cancelled_orders: yesterdayOrders.filter(
            (order) => order.status === "cancelled"
          ).length,
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
        const monthlyCount = allOrders.filter((order) => {
          const orderDate = new Date(order.created_at);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        }).length;
        setMonthlyOrders(monthlyCount);

        // Calculate most popular meal of the week
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

        const weeklyMealCounts = {};
        const weeklyMealRevenue = {};

        allOrders.forEach((order) => {
          const orderDate = new Date(order.created_at);
          if (
            orderDate >= startOfWeek &&
            orderDate <= endOfWeek &&
            order.status !== "cancelled"
          ) {
            weeklyMealCounts[order.meal_name] =
              (weeklyMealCounts[order.meal_name] || 0) + 1;
            weeklyMealRevenue[order.meal_name] =
              (weeklyMealRevenue[order.meal_name] || 0) + order.price;
          }
        });

        let mostPopularWeekly = null;
        Object.entries(weeklyMealCounts).forEach(([name, count]) => {
          if (!mostPopularWeekly || count > mostPopularWeekly.count) {
            mostPopularWeekly = {
              name,
              count,
              total_revenue: weeklyMealRevenue[name],
            };
          }
        });

        if (mostPopularWeekly) {
          setPopularMeal({
            name: mostPopularWeekly.name,
            order_count: mostPopularWeekly.count,
            average_price:
              mostPopularWeekly.total_revenue / mostPopularWeekly.count,
          });
        } else {
          setPopularMeal(null);
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
  const getComparisonText = (
    todayValue,
    yesterdayValue,
    isCurrency = false
  ) => {
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
      text: `${difference >= 0 ? "+" : "-"}${formattedDifference} (${Math.abs(
        percentage
      )}%) from yesterday`,
      isIncrease: difference >= 0,
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
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/20 to-green-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="flex justify-center items-center h-screen relative z-10">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-orange-500 to-green-500 rounded-full"></div>
              <div className="absolute inset-2 animate-spin rounded-full border-4 border-transparent bg-gradient-to-r from-green-500 to-orange-500 rounded-full" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-6 text-lg font-medium bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
              Fetching your business insights...
            </p>
            <p className="mt-2 text-sm text-gray-500">Please wait while we load your dashboard</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/20 to-green-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 space-y-8 p-6 animate-fade-in">
        {/* Enhanced Header */}
        <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ChartBarIcon className="h-10 w-10 text-orange-500 animate-float" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-green-500 opacity-20 rounded-lg blur-sm"></div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Overview of your catering business</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="px-4 py-2 bg-gradient-to-r from-orange-100 to-green-100 rounded-full border border-orange-200/50">
                <p className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString('en-KE', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Orders"
            value={stats?.total_orders || 0}
            change={ordersComparison.text}
            isIncrease={ordersComparison.isIncrease}
            icon={<ShoppingBagIcon className="h-7 w-7" />}
            gradient="from-orange-400 to-orange-600"
            delay="0"
          />
          <StatCard
            title="Today's Revenue"
            value={`KSh ${stats?.total_revenue?.toLocaleString("en-KE") || 0}`}
            change={revenueComparison.text}
            isIncrease={revenueComparison.isIncrease}
            icon={<CurrencyDollarIcon className="h-7 w-7" />}
            gradient="from-green-400 to-green-600"
            delay="100"
          />
          <StatCard
            title="Monthly Orders"
            value={monthlyOrders}
            change="This month"
            icon={<ShoppingBagIcon className="h-7 w-7" />}
            gradient="from-blue-400 to-blue-600"
            delay="200"
          />
          <StatCard
            title="Cancelled Today"
            value={cancelledOrdersCount}
            change={cancelledComparison.text}
            isIncrease={cancelledComparison.isIncrease}
            icon={<XCircleIcon className="h-7 w-7" />}
            gradient="from-red-400 to-red-600"
            delay="300"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Recent Orders */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-8 animate-slide-up" style={{animationDelay: '400ms'}}>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-6">
                Recent Orders
              </h2>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order, index) => (
                    <div
                      key={order.order_id}
                      className="animate-slide-up hover:scale-[1.02] transition-all duration-300"
                      style={{animationDelay: `${500 + index * 100}ms`}}
                    >
                      <OrderItem order={order} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">No recent orders</h3>
                    <p className="text-gray-400">Orders will appear here once customers start placing them</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-8 animate-slide-up" style={{animationDelay: '600ms'}}>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-6">
                Today's Summary
              </h2>
              <div className="space-y-4">
                <SummaryItem
                  icon={<ShoppingBagIcon className="h-5 w-5" />}
                  label="Orders Received"
                  value={stats?.total_orders || 0}
                  gradient="from-orange-400 to-orange-600"
                />
                <SummaryItem
                  icon={<CurrencyDollarIcon className="h-5 w-5" />}
                  label="Revenue Generated"
                  value={`KSh ${stats?.total_revenue?.toLocaleString("en-KE") || 0}`}
                  gradient="from-green-400 to-green-600"
                />
                <SummaryItem
                  icon={<XCircleIcon className="h-5 w-5" />}
                  label="Cancelled Orders"
                  value={cancelledOrdersCount || 0}
                  gradient="from-red-400 to-red-600"
                  subtitle={cancelledComparison.text}
                />
              </div>
            </div>

            {/* Popular Meal */}
            <div className="backdrop-blur-lg bg-gradient-to-br from-purple-100/70 to-pink-100/70 border border-purple-200/30 shadow-2xl rounded-3xl p-8 animate-slide-up" style={{animationDelay: '700ms'}}>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                🏆 Popular Meal This Week
              </h2>
              {popularMeal ? (
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl p-4 shadow-lg">
                    <TrophyIcon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {popularMeal.name}
                    </h3>
                    <p className="text-purple-600 font-medium text-sm mb-2">
                      Top selling item this week
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Orders:</span>
                        <span className="font-medium text-gray-900">{popularMeal.order_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Avg. Price:</span>
                        <span className="font-medium text-gray-900 bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1 rounded-lg">
                          KSh {popularMeal.average_price?.toFixed(0) || "0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrophyIcon className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                  <p className="text-purple-600 font-medium">No popular meal data available</p>
                  <p className="text-purple-500 text-sm mt-1">Data will appear as orders come in</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

const StatCard = ({ title, value, change, isIncrease, icon, gradient, delay }) => {
  return (
    <div 
      className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-6 hover:scale-105 hover:shadow-3xl transition-all duration-300 animate-slide-up group"
      style={{animationDelay: `${delay}ms`}}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-2xl p-4 bg-gradient-to-r ${gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {change && (
          <div className="flex items-center text-sm">
            {isIncrease !== undefined && (
              <>
                {isIncrease ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={isIncrease ? "text-green-600" : "text-red-600"}>
                  {change}
                </span>
              </>
            )}
            {isIncrease === undefined && (
              <span className="text-gray-500">{change}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryItem = ({ icon, label, value, gradient, subtitle }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-100/50 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center space-x-3">
        <div className={`rounded-xl p-2 bg-gradient-to-r ${gradient} text-white shadow-md group-hover:shadow-lg transition-shadow`}>
          {icon}
        </div>
        <div>
          <span className="text-gray-700 font-medium">{label}</span>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <span className="font-bold text-gray-900 text-lg">{value}</span>
    </div>
  );
};

const OrderItem = ({ order }) => {
  const getStatusConfig = (status) => {
    const configs = {
      delivered: {
        gradient: "from-green-400 to-green-600",
        bgGradient: "from-green-50 to-green-100",
        borderColor: "border-green-200",
        icon: <CheckCircleIcon className="h-4 w-4" />
      },
      cancelled: {
        gradient: "from-red-400 to-red-600", 
        bgGradient: "from-red-50 to-red-100",
        borderColor: "border-red-200",
        icon: <XCircleIcon className="h-4 w-4" />
      },
      ready: {
        gradient: "from-blue-400 to-blue-600",
        bgGradient: "from-blue-50 to-blue-100", 
        borderColor: "border-blue-200",
        icon: <CheckCircleIcon className="h-4 w-4" />
      },
      preparing: {
        gradient: "from-yellow-400 to-yellow-600",
        bgGradient: "from-yellow-50 to-yellow-100",
        borderColor: "border-yellow-200", 
        icon: <CogIcon className="h-4 w-4 animate-spin" />
      },
      pending: {
        gradient: "from-orange-400 to-orange-600",
        bgGradient: "from-orange-50 to-orange-100",
        borderColor: "border-orange-200",
        icon: <ClockIcon className="h-4 w-4" />
      }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-r ${statusConfig.bgGradient} border ${statusConfig.borderColor} hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium bg-gradient-to-r ${statusConfig.gradient} text-white shadow-md`}>
            {statusConfig.icon}
            <span className="ml-2">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{order.meal_name}</h3>
            <p className="text-sm text-gray-600 mt-1">{order.customer_email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900 text-xl">
            KSh {order.price.toLocaleString("en-KE")}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(order.created_at).toLocaleTimeString("en-KE", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Africa/Nairobi",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;