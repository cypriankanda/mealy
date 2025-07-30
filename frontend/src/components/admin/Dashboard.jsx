import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { useRealTimeUpdates } from "../../utils/useRealTimeUpdates";
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
  ArrowPathIcon,
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
  const [recentDeliveredCount, setRecentDeliveredCount] = useState(0);
  const [ordersComparison, setOrdersComparison] = useState({ text: "No data", isIncrease: false });
  const [revenueComparison, setRevenueComparison] = useState({ text: "No data", isIncrease: false });
  const [cancelledComparison, setCancelledComparison] = useState({ text: "No data", isIncrease: false });

    const fetchDashboardData = useCallback(async () => {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Helper function for date formatting
      const getDateString = (date) => {
        const d = new Date(date);
        return d.getFullYear() + '-' + 
               String(d.getMonth() + 1).padStart(2, '0') + '-' + 
               String(d.getDate()).padStart(2, '0');
      };

      const allOrdersResponse = await api.get("/admin/orders");
      const allOrders = allOrdersResponse.data.data;
      
      // Debug: Log all orders to see their dates and statuses
      console.log('🔍 ALL ORDERS DEBUG - TOTAL:', allOrders.length);
      console.log('🔍 ALL ORDERS DEBUG - TODAY EXPECTED:', getDateString(today));
      
      // Emergency debug: show raw order data
      if (allOrders.length > 0) {
        console.log('🚨 EMERGENCY DEBUG - First order raw data:', allOrders[0]);
      }
      
      // Show first 3 orders in detail
      console.log('🔍 SAMPLE ORDERS:', allOrders.slice(0, 3).map(o => ({
        order_id: o.order_id,
        status: o.status,
        created_at: o.created_at,
        updated_at: o.updated_at,
        created_date_formatted: getDateString(new Date(o.created_at)),
        updated_date_formatted: o.updated_at ? getDateString(new Date(o.updated_at)) : 'N/A',
        meal_name: o.meal_name,
        price: o.price
      })));
      
      // Show all unique creation dates
      const allCreationDates = [...new Set(allOrders.map(o => getDateString(new Date(o.created_at))))].sort();
      console.log('🔍 ALL ORDER CREATION DATES:', allCreationDates);
      
      // Check if any orders were created or updated today
      console.log('🔍 DIRECT DATE CHECK:');
      console.log('Today we are looking for:', getDateString(today));
      console.log('Orders created today count:', allOrders.filter(o => getDateString(new Date(o.created_at)) === getDateString(today)).length);
      console.log('Orders delivered today count:', allOrders.filter(o => o.status === 'delivered' && (o.updated_at ? getDateString(new Date(o.updated_at)) === getDateString(today) : getDateString(new Date(o.created_at)) === getDateString(today))).length);
      
      // Show all delivered orders with their delivery dates
      const deliveredOrders = allOrders.filter(o => o.status === 'delivered');
      console.log('🔍 DELIVERED ORDERS COUNT:', deliveredOrders.length);
      if (deliveredOrders.length > 0) {
        console.log('🔍 DELIVERED ORDERS SAMPLE:', deliveredOrders.slice(0, 3).map(o => ({
          order_id: o.order_id,
          created_at: o.created_at,
          updated_at: o.updated_at,
          delivery_date: o.updated_at ? getDateString(new Date(o.updated_at)) : getDateString(new Date(o.created_at))
        })));
      }

      // Fix: Count orders that were delivered today (not just created today)
      const todayCompletedOrders = allOrders.filter(
        (order) => {
          // For delivered orders, we need to check when they were actually delivered
          if (order.status !== "delivered") return false;
          
          // Use updated_at if available, otherwise fallback to created_at
          const updatedDate = order.updated_at ? new Date(order.updated_at) : new Date(order.created_at);
          const createdDate = new Date(order.created_at);
          
          const todayString = getDateString(today);
          const updatedDateString = getDateString(updatedDate);
          const createdDateString = getDateString(createdDate);
          
          const isDeliveredToday = updatedDateString === todayString ||
                 (createdDateString === todayString && order.status === "delivered");
          
                     // Debug delivered orders
           if (order.status === "delivered" && allOrders.filter(o => o.status === "delivered").indexOf(order) < 3) {
             console.log(`🚚 DELIVERED ORDER ${order.order_id} - Delivered: ${updatedDateString}, Today: ${todayString}, Match: ${isDeliveredToday}`);
           }
          
          return isDeliveredToday;
        }
      );
      
      const todayCancelledOrders = allOrders.filter(
        (order) => {
          // For cancelled orders, we need to check when they were actually cancelled
          if (order.status !== "cancelled") return false;
          
          // Use updated_at if available, otherwise fallback to created_at
          const updatedDate = order.updated_at ? new Date(order.updated_at) : new Date(order.created_at);
          const createdDate = new Date(order.created_at);
          
          const todayString = getDateString(today);
          const updatedDateString = getDateString(updatedDate);
          const createdDateString = getDateString(createdDate);
          
          const isCancelledToday = updatedDateString === todayString ||
                 (createdDateString === todayString && order.status === "cancelled");
          
          // Debug cancelled orders
          if (order.status === "cancelled" && allOrders.filter(o => o.status === "cancelled").indexOf(order) < 2) {
            console.log(`❌ CANCELLED ORDER ${order.order_id} DATE CHECK:`, {
              status: order.status,
              updated_at: order.updated_at,
              created_at: order.created_at,
              updatedDateString,
              createdDateString,
              todayString,
              isCancelledToday,
              usedUpdatedAt: !!order.updated_at
            });
          }
          
          return isCancelledToday;
        }
      );

      // Also count orders created today for comparison (using reliable date string)
      const todayCreatedOrders = allOrders.filter(
        (order) => {
          const createdDate = new Date(order.created_at);
          const createdDateString = getDateString(createdDate);
          const todayString = getDateString(today);
          const isToday = createdDateString === todayString;
          
          // Debug each order's date comparison
          if (allOrders.indexOf(order) < 3) { // Log first 3 orders for debugging
            console.log(`📅 ORDER ${order.order_id} DATE CHECK - Created: ${createdDateString}, Today: ${todayString}, Match: ${isToday}`);
          }
          
          return isToday;
        }
      );

              // Alternative approach: Count all delivered orders from the last 24 hours
      const last24Hours = new Date(today.getTime() - (24 * 60 * 60 * 1000));
      const recentDeliveredOrders = allOrders.filter(
        (order) => {
          if (order.status !== "delivered") return false;
          const updatedDate = order.updated_at ? new Date(order.updated_at) : new Date(order.created_at);
          return updatedDate >= last24Hours;
        }
      );

      // Final filtering summary
      console.log('📊 FILTERING SUMMARY:', {
        totalOrdersInSystem: allOrders.length,
        todayDateString: getDateString(today),
        filterResults: {
          createdToday: todayCreatedOrders.length,
          deliveredToday: todayCompletedOrders.length,
          cancelledToday: todayCancelledOrders.length,
          recentDelivered: recentDeliveredOrders.length
        },
        ordersByStatus: {
          total: allOrders.length,
          delivered: allOrders.filter(o => o.status === 'delivered').length,
          pending: allOrders.filter(o => o.status === 'pending').length,
          preparing: allOrders.filter(o => o.status === 'preparing').length,
          cancelled: allOrders.filter(o => o.status === 'cancelled').length
        }
      });

      const todayStats = {
        total_orders: todayCompletedOrders.length,
        total_revenue: todayCompletedOrders.reduce((sum, order) => sum + (order.price || 0), 0),
        cancelled_orders: todayCancelledOrders.length,
        created_today: todayCreatedOrders.length,
        recent_delivered: recentDeliveredOrders.length
      };

            // Yesterday stats - orders delivered yesterday
      const yesterdayCompletedOrders = allOrders.filter(
        (order) => {
          if (order.status !== "delivered") return false;
          
          // Use updated_at if available, otherwise fallback to created_at
          const updatedDate = order.updated_at ? new Date(order.updated_at) : new Date(order.created_at);
          const createdDate = new Date(order.created_at);
          
          return updatedDate.toDateString() === yesterday.toDateString() || 
                 (createdDate.toDateString() === yesterday.toDateString() && order.status === "delivered");
        }
      );
      
      const yesterdayCancelledOrders = allOrders.filter(
        (order) => {
          if (order.status !== "cancelled") return false;
          
          // Use updated_at if available, otherwise fallback to created_at
          const updatedDate = order.updated_at ? new Date(order.updated_at) : new Date(order.created_at);
          const createdDate = new Date(order.created_at);
          
          return updatedDate.toDateString() === yesterday.toDateString() || 
                 (createdDate.toDateString() === yesterday.toDateString() && order.status === "cancelled");
        }
      );

        const yesterdayStats = {
          total_orders: yesterdayCompletedOrders.length,
          total_revenue: yesterdayCompletedOrders.reduce((sum, order) => sum + order.price, 0),
          cancelled_orders: yesterdayCancelledOrders.length,
        };

        const recentOrdersResponse = await api.get("/admin/orders?per_page=5");

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Monthly orders: All orders in the current month (regardless of status)
        const monthlyOrdersData = allOrders.filter((order) => {
          const orderDate = new Date(order.created_at);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          );
        });
        
        // Monthly revenue: Only from delivered orders (actual earnings)
        const monthlyRevenueData = allOrders.filter((order) => {
          const orderDate = new Date(order.created_at);
          return (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear &&
            order.status === "delivered"
          );
        });
        
        const monthlyCount = monthlyOrdersData.length;
        const monthlyRev = monthlyRevenueData.reduce((sum, order) => sum + order.price, 0);

              setStats(todayStats);
      setYesterdayStats(yesterdayStats);
      setRecentOrders(recentOrdersResponse.data.data);
      
      // Immediate verification of state setting
      console.log('✅ STATS SET SUCCESSFULLY:', {
        todayStats,
        message: 'Stats have been set in component state',
        breakdown: {
          'Orders placed today (created_today)': todayStats.created_today,
          'Orders delivered today (total_orders)': todayStats.total_orders,
          'Revenue from delivered orders': todayStats.total_revenue,
          'Cancelled orders today': todayStats.cancelled_orders
        }
      });
      setCancelledOrdersCount(todayStats.cancelled_orders);
      setCompletedOrdersCount(todayStats.total_orders); // This represents delivered orders today
      setRecentDeliveredCount(recentDeliveredOrders.length);
      setMonthlyOrders(monthlyCount);
      setMonthlyRevenue(monthlyRev);

      // Calculate yesterday's created orders for comparison
      const yesterdayCreatedOrders = allOrders.filter(
        (order) => {
          const createdDate = new Date(order.created_at);
          const yesterdayString = getDateString(yesterday);
          const createdDateString = getDateString(createdDate);
          return createdDateString === yesterdayString;
        }
      );

      // Set orders comparison
      const ordersComparisonResult = getComparisonText(
        todayStats.created_today || 0,
        yesterdayCreatedOrders.length || 0
      );
      setOrdersComparison(ordersComparisonResult);

      // Set revenue comparison
      const revenueComparisonResult = getComparisonText(
        todayStats.total_revenue || 0,
        yesterdayStats.total_revenue || 0,
        true
      );
      setRevenueComparison(revenueComparisonResult);

      // Set cancelled comparison
      const cancelledComparisonResult = getComparisonText(
        todayStats.cancelled_orders || 0,
        yesterdayStats.cancelled_orders || 0
      );
      setCancelledComparison(cancelledComparisonResult);

      // Debug logging to verify calculations
      const todayUTC = new Date();
      const todayLocal = new Date(todayUTC.getTime() - (todayUTC.getTimezoneOffset() * 60000));
      
      console.log('🎯 DASHBOARD METRICS VERIFICATION:', {
        '📊 MAIN DASHBOARD CARDS': {
          'Today\'s Orders (All placed today)': todayCreatedOrders.length,
          'Today\'s Revenue (From delivered today)': `KSh ${todayStats.total_revenue.toLocaleString("en-KE")}`,
          'Monthly Orders': monthlyCount,
          'Monthly Revenue': `KSh ${monthlyRev.toLocaleString("en-KE")}`
        },
        
        '📋 TODAY\'S SUMMARY SECTION': {
          'Orders Completed (Delivered today)': todayCompletedOrders.length,
          'Revenue Generated (From delivered today)': `KSh ${todayStats.total_revenue.toLocaleString("en-KE")}`,
          'Cancelled Orders': todayStats.cancelled_orders
        },
        
        '🔍 VERIFICATION DATA': {
          todaysOrdersPlaced: todayCreatedOrders.length,
          todaysOrdersDelivered: todayCompletedOrders.length,
          todaysRevenue: todayStats.total_revenue,
          recentDeliveredOrders: recentDeliveredOrders.length,
          totalSystemOrders: allOrders.length,
          totalDeliveredOrders: allOrders.filter(o => o.status === 'delivered').length,
          'STATS OBJECT CONTENT': todayStats,
          'STATE VALUES': {
            'stats.created_today': stats?.created_today,
            'stats.total_orders': stats?.total_orders,
            'stats.total_revenue': stats?.total_revenue
          }
        },
        
        '📅 DATE VERIFICATION': {
          todayFormatted: getDateString(todayUTC),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezoneOffset: todayUTC.getTimezoneOffset()
        },
        
        '📦 SAMPLE ORDERS FOR TODAY': {
          ordersCreatedToday: todayCreatedOrders.slice(0, 2).map(o => ({
            order_id: o.order_id,
            status: o.status,
            price: o.price,
            created_date: getDateString(new Date(o.created_at)),
            meal_name: o.meal_name
          })),
          ordersDeliveredToday: todayCompletedOrders.slice(0, 2).map(o => ({
            order_id: o.order_id,
            status: o.status,
            price: o.price,
            delivered_date: o.updated_at ? getDateString(new Date(o.updated_at)) : 'N/A',
            meal_name: o.meal_name
          }))
        }
      });

        const startOfWeek = new Date();
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const weeklyMealCounts = {};

        allOrders.forEach((order) => {
          const orderDate = new Date(order.created_at);
          if (
            orderDate >= startOfWeek &&
            orderDate <= endOfWeek &&
            order.status === "delivered"
          ) {
            weeklyMealCounts[order.meal_name] =
              (weeklyMealCounts[order.meal_name] || 0) + 1;
          }
        });

        let mostPopularWeekly = null;
        Object.entries(weeklyMealCounts).forEach(([name, count]) => {
          if (!mostPopularWeekly || count > mostPopularWeekly.count) {
            mostPopularWeekly = {
              name,
              count,
            };
          }
        });

        if (mostPopularWeekly) {
          setPopularMeal({
            name: mostPopularWeekly.name,
            order_count: mostPopularWeekly.count,
          });
        } else {
          setPopularMeal(null);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
  }, []);

  // Use real-time updates with 15-second polling (more frequent for responsiveness)
  const { refresh } = useRealTimeUpdates(fetchDashboardData, [], 15000);

  // Additional effect to refresh when page becomes visible (user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing dashboard...');
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboardData]);

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




  // Debug UI values right before render
  if (stats && !loading) {
    console.log('🎨 UI RENDER VALUES:', {
      'Today\'s Orders Card': {
        value: stats?.created_today || 0,
        subtitle: `${stats?.total_orders || 0} delivered today`
      },
      'Today\'s Revenue Card': {
        value: `KSh ${stats?.total_revenue?.toLocaleString("en-KE") || 0}`,
        subtitle: revenueComparison?.text || 'No comparison'
      },
      'Summary Orders Completed': {
        value: stats?.total_orders || 0,
        subtitle: "Meals delivered today"
      },
      'Summary Revenue Generated': {
        value: `KSh ${stats?.total_revenue?.toLocaleString("en-KE") || 0}`,
        subtitle: "From delivered orders today"
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-green-50 to-blue-50">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/20 to-green-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-gradient-to-r from-red-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '6s'}}></div>
          <div className="absolute top-50 left-1/4 w-52 h-52 bg-gradient-to-r from-yellow-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '8s'}}></div>
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
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-orange-300/20 to-green-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-gradient-to-r from-red-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '6s'}}></div>
        <div className="absolute top-50 left-1/4 w-52 h-52 bg-gradient-to-r from-yellow-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '8s'}}></div>
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
            <div className="flex items-center space-x-4">
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
              <button
                onClick={refresh}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-full shadow-lg hover:from-orange-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Today's Orders"
            value={stats?.created_today || 0}
            change={`${stats?.total_orders || 0} delivered today`}
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
            change="All orders this month"
            icon={<ShoppingBagIcon className="h-7 w-7" />}
            gradient="from-blue-400 to-blue-600"
            delay="200"
          />
          <StatCard
            title="Monthly Revenue"
            value={`KSh ${monthlyRevenue?.toLocaleString("en-KE") || 0}`}
            change="From delivered orders"
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
                                <OrderStatusPill status={order.status} />
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
                <SummaryItem
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                  label="Orders Completed"
                  value={stats?.total_orders || 0}
                  subtitle="Meals delivered today"
                  gradient="from-green-400 to-green-600"
                />
                <SummaryItem
                  icon={<CurrencyDollarIcon className="h-5 w-5" />}
                  label="Revenue Generated"
                  value={`KSh ${stats?.total_revenue?.toLocaleString("en-KE") || 0}`}
                  subtitle="From delivered orders today"
                  gradient="from-green-400 to-green-600"
                />
                <SummaryItem
                  icon={<XCircleIcon className="h-5 w-5" />}
                  label="Cancelled Orders"
                  value={cancelledOrdersCount || 0}
                  subtitle={cancelledComparison.text}
                  gradient="from-red-400 to-red-600"
                />
              </div>
            </div>

            <div className="backdrop-blur-lg bg-gradient-to-br from-purple-100/70 to-pink-100/70 border border-purple-200/30 shadow-2xl rounded-3xl p-6 sm:p-8 animate-slide-up" style={{animationDelay: '700ms'}}>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 sm:mb-6">
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

      <style>{`
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

const SummaryItem = ({ icon, label, value, gradient, subtitle }) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-gray-50/50 to-white/50 border border-gray-100/50 hover:shadow-md transition-all duration-300 group"> 
      <div className="flex items-center space-x-3">
        <div className={`rounded-xl p-2 bg-gradient-to-r ${gradient} text-white shadow-md group-hover:shadow-lg transition-shadow`}>
          {icon}
        </div>
        <div>
          <span className="text-gray-700 font-medium text-sm sm:text-base">{label}</span> 
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <span className="font-bold text-gray-900 text-base sm:text-lg">{value}</span> 
    </div>
  );
};

const OrderStatusPill = ({ status }) => {
  const getStatusConfig = (status) => {
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
      pending: {
        gradient: "from-orange-400 to-orange-600",
        icon: <ClockIcon className="h-4 w-4" />
      }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${statusConfig.gradient} text-white shadow-md`}>
      {statusConfig.icon}
      <span className="ml-1">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

export default Dashboard;