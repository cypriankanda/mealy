import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Assuming this path is correct
import {
  HomeIcon,
  ShoppingBagIcon,
  ClockIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon, // For hamburger menu
  XMarkIcon // For close button in mobile menu
} from '@heroicons/react/24/outline';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showContent, setShowContent] = useState(false); // For staggered animation

  // Simulate user data for demonstration if not available
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Customer';
  const userEmail = user?.email || 'customer@example.com';

  useEffect(() => {
    // Trigger content animation after component mounts
    setShowContent(true);
  }, []);

  const navItems = [
    { name: 'Home', path: '/customer', icon: HomeIcon, iconGradient: 'from-orange-400 to-red-500' },
    { name: 'My Orders', path: '/customer/orders', icon: ShoppingBagIcon, iconGradient: 'from-green-400 to-teal-500' },
    { name: 'Order History', path: '/customer/orders/history', icon: ClockIcon, iconGradient: 'from-blue-400 to-indigo-500' },
    { name: 'Profile', path: '/customer/profile', icon: UserIcon, iconGradient: 'from-purple-400 to-pink-500' },
  ];

  // Helper to get dynamic icon and text classes based on active state and desired gradients
  const getNavItemClasses = (itemPath) => {
    const isActive = location.pathname === itemPath;
    return {
      link: `group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105 ${
        isActive
          ? 'bg-gradient-to-br from-orange-400 to-green-500 text-white shadow-lg'
          : 'text-gray-700 hover:bg-white/50 hover:text-orange-600'
      }`,
      icon: `mr-4 flex-shrink-0 h-7 w-7 transition-all duration-300 ease-in-out ${
        isActive
          ? 'text-white' // Active icons are white on gradient background
          : `bg-gradient-to-br ${navItems.find(i => i.path === itemPath)?.iconGradient} bg-clip-text text-transparent group-hover:text-orange-600`
      }`,
      text: `transition-all duration-300 ease-in-out ${
        isActive
          ? 'text-white'
          : 'text-gray-700 group-hover:text-orange-600'
      }`
    };
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 to-green-50 font-inter">
      {/* Animated Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>

      <div className="flex relative z-10">
        {/* Sidebar for Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-72 border-r border-gray-100 bg-white/80 backdrop-blur-md shadow-lg rounded-r-3xl my-4 ml-4">
            <div className="h-0 flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              {/* Brand Logo */}
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent animate-pulse-slow">
                  Mealy
                </h1>
              </div>
              {/* Navigation */}
              <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                  const classes = getNavItemClasses(item.path);
                  return (
                    <Link key={item.name} to={item.path} className={classes.link}>
                      <item.icon className={classes.icon} />
                      <span className={classes.text}>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            {/* Logout */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-6">
              <button
                onClick={logout}
                className="flex-shrink-0 w-full group flex items-center justify-center px-4 py-3 text-base font-medium rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
              >
                <ArrowRightOnRectangleIcon className="h-7 w-7 mr-3 text-red-500 group-hover:text-red-700" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Top Navigation */}
          <div className="md:hidden bg-white/90 backdrop-blur-md shadow-lg rounded-b-3xl py-4 px-6 flex items-center justify-between">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
              Mealy
            </h1>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="hidden sm:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full shadow-inner">
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={`https://placehold.co/40x40/FF9800/FFFFFF?text=${userName.charAt(0).toUpperCase()}`}
                      alt="User Avatar"
                    />
                    <span className="text-sm font-medium text-gray-800 hidden md:block">{userEmail}</span>
                  </div>
                </>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md p-2 transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-8 w-8" />
                ) : (
                  <Bars3Icon className="h-8 w-8" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
              <div
                className="fixed inset-y-0 right-0 w-64 bg-white/95 backdrop-blur-lg shadow-xl flex flex-col py-6 transform transition-transform duration-300 ease-in-out"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              >
                <div className="flex items-center justify-between px-6 mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-700 hover:text-orange-600 focus:outline-none p-2 rounded-md"
                  >
                    <XMarkIcon className="h-7 w-7" />
                  </button>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                  {navItems.map((item) => {
                    const classes = getNavItemClasses(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={classes.link}
                      >
                        <item.icon className={classes.icon} />
                        <span className={classes.text}>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t border-gray-200 p-6">
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex-shrink-0 w-full group flex items-center justify-center px-4 py-3 text-base font-medium rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
                  >
                    <ArrowRightOnRectangleIcon className="h-7 w-7 mr-3 text-red-500 group-hover:text-red-700" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Content area */}
          <main className="flex-1 overflow-y-auto focus:outline-none p-6 md:p-8">
            {location.pathname === '/customer' && (
              <div className={`transition-opacity duration-700 ease-in-out ${showContent ? 'opacity-100' : 'opacity-0'}`}>
                {/* Welcome Message */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 mb-8 shadow-xl transform transition-all duration-500 ease-out translate-y-4 opacity-0 animate-fade-in-up">
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-green-700 bg-clip-text text-transparent">
                    Welcome back, {userName}! 👋
                  </h2>
                  <p className="text-lg text-gray-700">
                    Ready to explore delicious meals or track your latest order?
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out animate-fade-in-up animation-delay-100">
                    <div className="flex items-center mb-4">
                      <span className="text-4xl mr-4">🍔</span>
                      <h3 className="text-2xl font-semibold text-gray-800">Browse Menu</h3>
                    </div>
                    <p className="text-gray-600">Discover new dishes and your favorite restaurants.</p>
                    <Link to="/customer/menu" className="mt-4 inline-block text-orange-600 hover:text-orange-800 font-medium transition-colors duration-200">
                      Start Ordering &rarr;
                    </Link>
                  </div>
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out animate-fade-in-up animation-delay-200">
                    <div className="flex items-center mb-4">
                      <span className="text-4xl mr-4">📦</span>
                      <h3 className="text-2xl font-semibold text-gray-800">Track Orders</h3>
                    </div>
                    <p className="text-gray-600">Keep an eye on your delivery in real-time.</p>
                    <Link to="/customer/orders" className="mt-4 inline-block text-green-600 hover:text-green-800 font-medium transition-colors duration-200">
                      View Live Orders &rarr;
                    </Link>
                  </div>
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out animate-fade-in-up animation-delay-300">
                    <div className="flex items-center mb-4">
                      <span className="text-4xl mr-4">⏰</span>
                      <h3 className="text-2xl font-semibold text-gray-800">Order History</h3>
                    </div>
                    <p className="text-gray-600">Review your past orders and reorder with ease.</p>
                    <Link to="/customer/orders/history" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                      See Past Orders &rarr;
                    </Link>
                  </div>
                </div>

                {/* Quick Stats Dashboard */}
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl animate-fade-in-up animation-delay-400">
                  <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent">
                    Your Mealy Stats
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center p-4 bg-orange-50 rounded-xl shadow-inner transform hover:scale-105 transition-transform duration-200">
                      <span className="text-5xl font-extrabold text-orange-600">12</span>
                      <p className="text-lg text-gray-700 mt-2">Total Orders</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl shadow-inner transform hover:scale-105 transition-transform duration-200">
                      <span className="text-5xl font-extrabold text-green-600">8</span>
                      <p className="text-lg text-gray-700 mt-2">Favorite Meals</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl shadow-inner transform hover:scale-105 transition-transform duration-200">
                      <span className="text-5xl font-extrabold text-blue-600">5</span>
                      <p className="text-lg text-gray-700 mt-2">Reviews Given</p>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl shadow-inner transform hover:scale-105 transition-transform duration-200">
                      <span className="text-5xl font-extrabold text-purple-600">250</span>
                      <p className="text-lg text-gray-700 mt-2">Loyalty Points</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Outlet /> {/* Renders nested routes */}
          </main>
        </div>
      </div>

      {/* Tailwind CSS Custom Styles (for animations) */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fadeInScaleUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fadeInScaleUp 0.6s ease-out forwards;
        }

        .animation-delay-100 { animation-delay: 0.1s; }
        .animation-delay-200 { animation-delay: 0.2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-400 { animation-delay: 0.4s; }

        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s infinite ease-in-out;
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

export default CustomerLayout;
