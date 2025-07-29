import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

const Dashboard = () => {
  useAuth();
  const [stats, setStats] = useState(null);
  const [yesterdayStats, setYesterdayStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [popularMeal, setPopularMeal] = useState(null);
  const [cancelledOrdersCount, setCancelledOrdersCount] = useState(0);
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0);

  // Function to calculate monthly stats
  const calculateMonthlyStats = (allOrders) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Filter orders for the current month and year
    const monthlyData = allOrders.filter((order) => {
      const orderDate = new Date(order.created_at);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    // Calculate all monthly orders (regardless of status)
    setMonthlyOrders(monthlyData.length);
    
    // Calculate monthly revenue from delivered orders only
    const deliveredMonthlyOrders = monthlyData.filter(
      (order) => order.status === "delivered"
    );
    
    setMonthlyRevenue(
      deliveredMonthlyOrders.reduce((sum, order) => sum + order.price, 0)
    );
  };

  // Function to fetch all data
  const fetchData = async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const allOrdersResponse = await api.get("/admin/orders");
      const allOrders = allOrdersResponse.data.data;

      // Calculate all stats from the complete orders data
      calculateMonthlyStats(allOrders);

      // Filter orders for today and yesterday
      const todayOrders = allOrders.filter(
        (order) =>
          new Date(order.created_at).toDateString() === today.toDateString()
      );
      const yesterdayOrders = allOrders.filter(
        (order) =>
          new Date(order.created_at).toDateString() === yesterday.toDateString()
      );

      const todayCompletedOrders = todayOrders.filter(
        (order) => order.status === "delivered"
      );
      const todayCancelledOrders = todayOrders.filter(
        (order) => order.status === "cancelled"
      );

      const todayStats = {
        total_orders: todayCompletedOrders.length,
        total_revenue: todayCompletedOrders.reduce((sum, order) => sum + order.price, 0),
        cancelled_orders: todayCancelledOrders.length,
      };

      const yesterdayCompletedOrders = yesterdayOrders.filter(
        (order) => order.status === "delivered"
      );
      const yesterdayCancelledOrders = yesterdayOrders.filter(
        (order) => order.status === "cancelled"
      );

      const yesterdayStats = {
        total_orders: yesterdayCompletedOrders.length,
        total_revenue: yesterdayCompletedOrders.reduce((sum, order) => sum + order.price, 0),
        cancelled_orders: yesterdayCancelledOrders.length,
      };

      const recentOrdersResponse = await api.get("/admin/orders?per_page=5");

      setStats(todayStats);
      setYesterdayStats(yesterdayStats);
      setRecentOrders(recentOrdersResponse.data.data);
      setCancelledOrdersCount(todayStats.cancelled_orders);
      setCompletedOrdersCount(todayStats.total_orders);

      // Calculate most popular meal of the week
      const startOfWeek = new Date();
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const weeklyMealCounts = {};
      const weeklyMealRevenue = {};

      allOrders.forEach((order) => {
        const orderDate = new Date(order.created_at);
        if (
          orderDate >= startOfWeek &&
          orderDate <= endOfWeek &&
          order.status === "delivered"
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

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling for real-time updates (every 30 seconds)
    const pollInterval = setInterval(fetchData, 30000);

    // Clean up interval on unmount
    return () => clearInterval(pollInterval);
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
    completedOrdersCount || 0,
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/20 to-green-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 space-y-8 p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="relative">
                <ChartBarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 animate-float" />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-green-500 opacity-20 rounded-lg blur-sm"></div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 via-green-600 to-blue-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Overview of your catering business</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Today's Orders"
            value={completedOrdersCount || 0}
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
            value={monthlyOrders || 0}
            change="This month"
            icon={<ShoppingBagIcon className="h-7 w-7" />}
            gradient="from-blue-400 to-blue-600"
            delay="200"
          />
          <StatCard
            title="Monthly Revenue"
            value={`KSh ${monthlyRevenue?.toLocaleString("en-KE") || 0}`}
            change="This month"
            icon={<CurrencyDollarIcon className="h-7 w-7" />}
            gradient="from-purple-400 to-purple-600"
            delay="300"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 animate-slide-up" style={{animationDelay: '400ms'}}>
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                Recent Orders
              </h2>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  <div className="overflow-x-auto custom-scrollbar">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Meal
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentOrders.map((order, index) => (
                            <tr key={order.order_id} className="animate-slide-up" style={{animationDelay: `${500 + index * 100}ms`}}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order.meal_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {order.customer_email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                KSh {order.price.toLocaleString("en-KE")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  order.status === "delivered"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : order.status === "ready"
                                    ? "bg-gray-100 text-gray-800"
                                    : order.status === "preparing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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

          <div className="space-y-6">
            <div className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-6 sm:p-8 animate-slide-up" style={{animationDelay: '600ms'}}>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                Today's Summary
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-100/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-xl p-2 bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md">
                      <CheckCircleIcon className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Completed Orders</span>
                  </div>
                  <span className="font-bold text-gray-900 text-base sm:text-lg">{completedOrdersCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-100/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-xl p-2 bg-gradient-to-r from-green-400 to-green-600 text-white shadow-md">
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">Revenue Generated</span>
                  </div>
                  <span className="font-bold text-gray-900 text-base sm:text-lg">
                    KSh {stats?.total_revenue?.toLocaleString("en-KE") || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-100/50 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-xl p-2 bg-gradient-to-r from-red-400 to-red-600 text-white shadow-md">
                      <XCircleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium text-sm sm:text-base">Cancelled Orders</span>
                      <p className="text-xs text-gray-500 mt-1">{cancelledComparison.text}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 text-base sm:text-lg">{cancelledOrdersCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-lg bg-gradient-to-br from-purple-100/70 to-pink-100/70 border border-purple-200/30 shadow-2xl rounded-3xl p-6 sm:p-8 animate-slide-up" style={{animationDelay: '700ms'}}>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
                🏆 Popular Meal This Week
              </h2>
              {popularMeal ? (
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl p-4 shadow-lg">
                    <ChartBarIcon className="h-8 w-8 text-white" />
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
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChartBarIcon className="h-12 w-12 text-purple-300 mx-auto mb-3" />
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

        .custom-scrollbar {
          -webkit-overflow-scrolling: touch;
        }

        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, change, isIncrease, icon, gradient, delay }) => {
  return (
    <div 
      className="backdrop-blur-lg bg-white/70 border border-white/20 shadow-2xl rounded-3xl p-5 sm:p-6 hover:scale-105 hover:shadow-3xl transition-all duration-300 animate-slide-up group" 
      style={{animationDelay: `${delay}ms`}}
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
        {change && (
          <div className="flex items-center text-xs sm:text-sm"> 
            {isIncrease !== undefined && (
              <>
                {isIncrease ? (
                  <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" /> 
                ) : (
                  <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" /> 
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

export default Dashboard;