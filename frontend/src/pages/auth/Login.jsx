import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LockClosedIcon, 
  EnvelopeIcon, 
  EyeIcon, 
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailValid, setEmailValid] = useState(false)
  const [formAnimated, setFormAnimated] = useState(false)
  const [focusedField, setFocusedField] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => setFormAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    setEmailValid(validateEmail(value))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (role) => {
    setLoading(true)
    setError('')
    
    const demoCredentials = {
      admin: { email: 'admin@mealy.co.ke', password: 'demo123' },
      customer: { email: 'customer@example.com', password: 'demo123' }
    }
    
    try {
      await login(demoCredentials[role].email, demoCredentials[role].password)
    } catch {
      setError('Failed to login with demo account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        @keyframes slideInUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-shake { animation: shake 0.6s ease-in-out; }
        .animate-slide-in-up { animation: slideInUp 0.8s ease-out; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .glass-morphism {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .input-glow:focus {
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1), 0 0 20px rgba(249, 115, 22, 0.1);
        }
        .gradient-text {
          background: linear-gradient(135deg, #f97316, #22c55e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .demo-button-admin {
          background: linear-gradient(135deg, #f97316, #fb923c);
        }
        .demo-button-customer {
          background: linear-gradient(135deg, #22c55e, #4ade80);
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-green-50">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/60 to-orange-300/60 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200/60 to-green-300/60 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-orange-100/40 to-green-100/40 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-orange-400 rounded-full animate-float opacity-60" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-green-400 rounded-full animate-float opacity-60" style={{animationDelay: '3s'}}></div>
          <div className="absolute bottom-32 left-32 w-5 h-5 bg-orange-300 rounded-full animate-float opacity-50" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/3 right-20 w-2 h-2 bg-green-300 rounded-full animate-float opacity-40" style={{animationDelay: '5s'}}></div>
        </div>

        <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className={`max-w-md w-full space-y-8 transform transition-all duration-1000 ${formAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* Enhanced Header */}
            <div className="text-center animate-slide-in-up">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-green-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 animate-float relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700 animate-shimmer"></div>
                <SparklesIcon className="h-10 w-10 text-white drop-shadow-lg relative z-10" />
              </div>
              <h2 className="text-5xl font-bold gradient-text mb-3 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-lg font-medium">
                Sign in to your Mealy account
              </p>
            </div>

            {/* Enhanced Error Message */}
            {error && (
              <div className="glass-morphism rounded-2xl p-5 animate-shake border-l-4 border-red-500 bg-red-50/80">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Main Form */}
            <div className="glass-morphism rounded-3xl shadow-2xl p-10 space-y-8 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
              <form className="space-y-8" onSubmit={handleSubmit}>
                
                {/* Enhanced Email Field */}
                <div className="space-y-3">
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-gray-700 tracking-wide"
                  >
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300">
                      <EnvelopeIcon className={`h-5 w-5 transition-all duration-300 ${
                        focusedField === 'email' ? 'text-orange-500 scale-110' :
                        emailValid && email ? 'text-green-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleEmailChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField('')}
                      className="input-glow focus:ring-2 focus:ring-orange-500 focus:border-transparent block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium hover:border-orange-300 hover:shadow-lg"
                      placeholder="Enter your email address"
                    />
                    {emailValid && email && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center animate-pulse">
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      </div>
                    )}
                  </div>
                  {email && !emailValid && (
                    <p className="text-xs text-red-500 font-medium animate-slide-in-up">Please enter a valid email address</p>
                  )}
                </div>

                {/* Enhanced Password Field */}
                <div className="space-y-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-gray-700 tracking-wide"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all duration-300">
                      <LockClosedIcon className={`h-5 w-5 transition-all duration-300 ${
                        focusedField === 'password' ? 'text-orange-500 scale-110' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className="input-glow focus:ring-2 focus:ring-orange-500 focus:border-transparent block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium hover:border-orange-300 hover:shadow-lg"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition-all duration-300 hover:scale-110"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enhanced Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded transition-all duration-200"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent hover:from-orange-700 hover:to-green-700 transition-all duration-300 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Enhanced Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !emailValid || !password}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-green-500 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none hover:from-orange-600 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-orange-300"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center justify-center text-lg">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing you in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </div>
                </button>

                {/* Form validation summary */}
                {(!emailValid || !password) && (email || password) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-slide-in-up">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700 font-medium">
                          {!emailValid && email ? "Please enter a valid email address. " : ""}
                          {!password ? "Password is required to continue." : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Enhanced Sign Up Link */}
            <div className="text-center glass-morphism rounded-2xl p-6 animate-slide-in-up" style={{animationDelay: '0.3s'}}>
              <p className="text-gray-600 font-medium">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent hover:from-orange-700 hover:to-green-700 transition-all duration-300 hover:underline transform hover:scale-105 inline-block"
                >
                  Sign up here
                </Link>
              </p>
            </div>
            
            {/* Enhanced Demo Accounts Section */}
            <div className="glass-morphism rounded-2xl p-8 animate-slide-in-up border-t-4 border-gradient-to-r from-orange-400 to-green-400" style={{animationDelay: '0.4s'}}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Try Demo Accounts</h3>
                <p className="text-sm text-gray-600">Experience Mealy with pre-configured demo accounts</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="group relative overflow-hidden demo-button-admin text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-orange-300"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <BuildingOfficeIcon className="h-5 w-5" />
                    <span>Admin Demo</span>
                  </div>
                  <div className="text-xs mt-1 opacity-90">Manage restaurants & orders</div>
                </button>
                
                <button
                  onClick={() => handleDemoLogin('customer')}
                  disabled={loading}
                  className="group relative overflow-hidden demo-button-customer text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <UserIcon className="h-5 w-5" />
                    <span>Customer Demo</span>
                  </div>
                  <div className="text-xs mt-1 opacity-90">Browse & order food</div>
                </button>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-2">
                    <p className="text-xs text-yellow-800 font-medium">
                      Demo accounts are pre-configured for testing purposes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login