import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HomeIcon, ShoppingBagIcon, BeakerIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isLoaded, setIsLoaded] = useState(false)
  const [showGoodbyeEffect, setShowGoodbyeEffect] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const handleLogout = () => {
    setShowGoodbyeEffect(true);
    setTimeout(() => {
      logout();
      setShowGoodbyeEffect(false);
    }, 1500);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: HomeIcon, gradient: 'from-orange-400 to-pink-400' },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBagIcon, gradient: 'from-blue-400 to-purple-500' },
    { name: 'Manage Meals', path: '/admin/meals', icon: BeakerIcon, gradient: 'from-green-400 to-blue-500' },
    { name: 'Profile', path: '/admin/profile', icon: UserIcon, gradient: 'from-purple-400 to-pink-500' },
  ]

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-orange-300/30 to-pink-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-300/30 to-blue-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gradient-to-r from-pink-300/30 to-orange-300/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex">
          <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64 border-r border-white/20 backdrop-blur-lg bg-white/70 shadow-2xl">
              <div className="h-0 flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-6 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-float">
                      <BeakerIcon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                      Mealy
                    </h1>
                  </div>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500/10 to-pink-500/10 text-orange-600 shadow-lg backdrop-blur-sm border border-orange-200/50'
                            : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 hover:shadow-md backdrop-blur-sm'
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <div className={`mr-4 p-2 rounded-lg transition-all duration-300 ${
                          isActive 
                            ? `bg-gradient-to-r ${item.gradient} shadow-lg` 
                            : 'bg-gray-100/50 group-hover:bg-gray-200/50'
                        }`}>
                          <item.icon
                            className={`h-5 w-5 ${
                              isActive
                                ? 'text-white'
                                : 'text-gray-500 group-hover:text-gray-600'
                            }`}
                          />
                        </div>
                        <span className="font-semibold">{item.name}</span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full animate-pulse"></div>
                        )}
                      </Link>
                    )
                  })}
                </nav>

                <div className="px-4 py-4 border-t border-white/20">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/20">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user?.name || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user?.email || 'admin@mealy.com'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 rounded-xl hover:bg-red-50/50 backdrop-blur-sm transition-all duration-300 group"
                  >
                    <div className="mr-3 p-2 rounded-lg bg-gray-100/50 group-hover:bg-red-100/50 transition-all duration-300">
                      <ArrowRightOnRectangleIcon className="h-5 w-5 group-hover:text-red-500 transition-colors duration-300" />
                    </div>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="md:hidden backdrop-blur-lg bg-white/70 shadow-lg border-b border-white/20">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                    <BeakerIcon className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    Mealy
                  </h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-all duration-300"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/20 bg-white/30 backdrop-blur-sm">
                <nav className="flex overflow-x-auto scrollbar-hide px-2 py-2">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 mx-1 text-sm font-medium rounded-lg transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-600 shadow-md border border-orange-200/50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md ${
                          isActive 
                            ? `bg-gradient-to-r ${item.gradient}` 
                            : 'bg-gray-200/50'
                        }`}>
                          <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <span className="whitespace-nowrap">{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>

            <div className="flex-1 overflow-auto focus:outline-none">
              <div className="p-6 md:p-8">
                <div className="animate-fade-in-up">
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showGoodbyeEffect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-500/90 via-pink-500/90 to-blue-500/90 text-white animate-fade-out-zoom">
          <div className="text-center p-6 sm:p-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 animate-slide-up-text">
              Goodbye, Admin!
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl font-medium animate-fade-in" style={{ animationDelay: '0.5s' }}>
              We hope to see you again soon.
            </p>
            <div className="mt-8">
              <ArrowRightOnRectangleIcon className="w-16 h-16 sm:w-20 sm:h-20 mx-auto animate-float" />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-out-zoom {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.1);
          }
        }

        @keyframes slide-up-text {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .animate-fade-out-zoom {
          animation: fade-out-zoom 1.5s ease-out forwards;
        }

        .animate-slide-up-text {
          animation: slide-up-text 0.8s ease-out forwards;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}

export default AdminLayout