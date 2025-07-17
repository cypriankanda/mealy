import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { HomeIcon, ShoppingBagIcon, ClockIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

const CustomerLayout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'My Orders', path: '/orders', icon: ShoppingBagIcon },
    { name: 'Order History', path: '/orders/history', icon: ClockIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900">Mealy</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.path
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        location.pathname === item.path
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={logout}
                className="flex-shrink-0 w-full group block"
              >
                <div className="flex items-center">
                  <div>
                    <ArrowRightOnRectangleIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Sign Out</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile top navigation */}
          <div className="md:hidden bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <h1 className="text-lg font-bold text-gray-900">Mealy</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">{user?.email}</span>
                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <nav className="flex overflow-x-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 ${
                      location.pathname === item.path
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-auto focus:outline-none p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerLayout