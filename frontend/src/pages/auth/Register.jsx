import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  const [formAnimated, setFormAnimated] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const { register } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setFormAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password, role);
    } catch (err) {
      setError(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-yellow-500";
    if (passwordStrength < 75) return "bg-blue-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Weak";
    if (passwordStrength < 50) return "Fair";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };

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
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-shake { animation: shake 0.6s ease-in-out; }
        .animate-slide-in-up { animation: slideInUp 0.8s ease-out; }
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
        </div>

        <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className={`max-w-md w-full space-y-8 transform transition-all duration-1000 ${formAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* Enhanced Header */}
            <div className="text-center animate-slide-in-up">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-orange-500 to-green-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-300 animate-float">
                <UserIcon className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-5xl font-bold gradient-text mb-3 tracking-tight">
                Join Mealy
              </h2>
              <p className="text-gray-600 text-lg font-medium">
                Create your account to get started
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
                    <p className="text-xs text-red-500 font-medium">Please enter a valid email address</p>
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
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField('')}
                      className="input-glow focus:ring-2 focus:ring-orange-500 focus:border-transparent block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl bg-white/80 backdrop-blur-sm transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium hover:border-orange-300 hover:shadow-lg"
                      placeholder="Create a strong password"
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
                  
                  {/* Enhanced Password Strength Indicator */}
                  {password && (
                    <div className="space-y-3 animate-slide-in-up">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 font-medium">Password strength</span>
                        <span className={`font-bold ${
                          passwordStrength >= 75 ? 'text-green-600' : 
                          passwordStrength >= 50 ? 'text-blue-600' : 
                          passwordStrength >= 25 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-xs text-gray-500">
                        <span className={password.length >= 8 ? 'text-green-600 font-medium' : ''}>8+ chars</span>
                        <span className={/[a-z]/.test(password) ? 'text-green-600 font-medium' : ''}>lowercase</span>
                        <span className={/[A-Z]/.test(password) ? 'text-green-600 font-medium' : ''}>uppercase</span>
                        <span className={/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 'text-green-600 font-medium' : ''}>symbols</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Role Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700 tracking-wide">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        id="customer"
                        name="role"
                        type="radio"
                        className="peer sr-only"
                        checked={role === "customer"}
                        onChange={() => setRole("customer")}
                      />
                      <label
                        htmlFor="customer"
                        className="block cursor-pointer rounded-2xl border-3 border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-orange-50 py-6 px-4 text-center text-sm font-bold transition-all duration-300 peer-checked:border-orange-500 peer-checked:bg-orange-100 peer-checked:text-orange-700 hover:scale-105 hover:shadow-xl transform peer-checked:shadow-orange-200 peer-checked:shadow-lg"
                      >
                        <div className="space-y-2">
                          <UserIcon className="h-8 w-8 mx-auto transition-transform duration-300 peer-checked:scale-110" />
                          <div className="font-bold">Customer</div>
                          <div className="text-xs text-gray-500 peer-checked:text-orange-600">Browse & Order</div>
                        </div>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="admin"
                        name="role"
                        type="radio"
                        className="peer sr-only"
                        checked={role === "admin"}
                        onChange={() => setRole("admin")}
                      />
                      <label
                        htmlFor="admin"
                        className="block cursor-pointer rounded-2xl border-3 border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-green-50 py-6 px-4 text-center text-sm font-bold transition-all duration-300 peer-checked:border-green-500 peer-checked:bg-green-100 peer-checked:text-green-700 hover:scale-105 hover:shadow-xl transform peer-checked:shadow-green-200 peer-checked:shadow-lg"
                      >
                        <div className="space-y-2">
                          <BuildingOfficeIcon className="h-8 w-8 mx-auto transition-transform duration-300 peer-checked:scale-110" />
                          <div className="font-bold">Caterer/Admin</div>
                          <div className="text-xs text-gray-500 peer-checked:text-green-600">Manage Business</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Enhanced Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !emailValid || passwordStrength < 50}
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
                        Creating your account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </div>
                </button>

                {/* Form validation summary */}
                {(!emailValid || passwordStrength < 50) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700 font-medium">
                          {!emailValid ? "Please enter a valid email address. " : ""}
                          {passwordStrength < 50 ? "Password should be stronger for better security." : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Enhanced Footer */}
            <div className="text-center glass-morphism rounded-2xl p-6 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
              <p className="text-gray-600 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent hover:from-orange-700 hover:to-green-700 transition-all duration-300 hover:underline transform hover:scale-105 inline-block"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;