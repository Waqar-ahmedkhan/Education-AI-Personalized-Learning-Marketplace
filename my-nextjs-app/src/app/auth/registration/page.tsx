'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

interface RegistrationData {
  name: string
  email: string
  password: string
}

interface ApiResponse {
  success: boolean
  message: string
  activationToken?: string
  errors?: Record<string, string>
  data?: {
    email: string
    name: string
  }
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  general?: string
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [redirectCountdown, setRedirectCountdown] = useState(3)
  
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto redirect countdown after successful registration
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSuccess && redirectCountdown > 0) {
      interval = setInterval(() => {
        setRedirectCountdown(prev => prev - 1)
      }, 1000)
    } else if (isSuccess && redirectCountdown === 0) {
      router.push('/auth/activation')
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSuccess, redirectCountdown, router])

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Password strength checker with detailed criteria
  const checkPasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/\d/.test(password)) strength += 1
    if (/[@$!%*?&]/.test(password)) strength += 1
    return strength
  }

  // Password strength requirements
  const passwordRequirements = [
    { test: (pwd: string) => pwd.length >= 8, label: 'At least 8 characters' },
    { test: (pwd: string) => pwd.length >= 12, label: 'At least 12 characters' },
    { test: (pwd: string) => /[a-z]/.test(pwd), label: 'Lowercase letter' },
    { test: (pwd: string) => /[A-Z]/.test(pwd), label: 'Uppercase letter' },
    { test: (pwd: string) => /\d/.test(pwd), label: 'Number' },
    { test: (pwd: string) => /[@$!%*?&]/.test(pwd), label: 'Special character' }
  ]

  // Client-side form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters'
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces'
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must not exceed 100 characters'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password must not exceed 128 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, number, and special character'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value))
    }

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch('http://localhost:8080/api/v1/user/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        // Store necessary data for activation
        if (data.activationToken) {
          sessionStorage.setItem('activationToken', data.activationToken)
        }
        if (data.data) {
          sessionStorage.setItem('registrationData', JSON.stringify(data.data))
        }
        
        setIsSuccess(true)
        setSuccessMessage(data.message)
        setFormData({ name: '', email: '', password: '' })
        setPasswordStrength(0)
        
        // Start countdown for auto redirect
        setRedirectCountdown(3)
      } else {
        if (data.errors) {
          setErrors(data.errors)
        } else {
          setErrors({ general: data.message || 'Registration failed. Please try again.' })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({ 
        general: 'Network error. Please check your connection and try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 4) return 'Medium'
    return 'Strong'
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  // Success screen with auto redirect
  if (isSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800 to-indigo-900' : 'from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className={`max-w-md w-full rounded-2xl shadow-lg p-6 sm:p-8 text-center transition-colors duration-200 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Registration Successful!
          </h2>
          <p className={`mb-4 text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {successMessage}
          </p>
          
          {/* Auto redirect notice */}
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-indigo-900/30 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200'}`}>
            <p className={`text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
              Redirecting to activation page in{' '}
              <span className="font-bold text-lg">{redirectCountdown}</span> seconds...
            </p>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((3 - redirectCountdown) / 3) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/activation')}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Activate Now
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className={`w-full py-2 px-4 rounded-lg font-medium transition duration-200 text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}
            >
              Skip to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800 to-indigo-900' : 'from-blue-50 via-indigo-50 to-purple-50'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-lg p-6 sm:p-8 transition-colors duration-200 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Account
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Join EduAI today and get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${errors.name ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500' : isDark ? 'border-gray-600 bg-gray-700 text-white focus:border-indigo-500' : 'border-gray-300 focus:border-indigo-500'}`}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 rounded-lg border transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${errors.email ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500' : isDark ? 'border-gray-600 bg-gray-700 text-white focus:border-indigo-500' : 'border-gray-300 focus:border-indigo-500'}`}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 rounded-lg border transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base ${errors.password ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500' : isDark ? 'border-gray-600 bg-gray-700 text-white focus:border-indigo-500' : 'border-gray-300 focus:border-indigo-500'}`}
                placeholder="Create a strong password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 6) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${passwordStrength <= 2 ? 'text-red-500 dark:text-red-400' : passwordStrength <= 4 ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'}`}>
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center">
                      <svg className={`w-4 h-4 mr-1 flex-shrink-0 ${req.test(formData.password) ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d={req.test(formData.password) ? "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" : "M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2v2H9V9z"} clipRule="evenodd" />
                      </svg>
                      <span className={`${req.test(formData.password) ? isDark ? 'text-gray-200' : 'text-gray-700' : 'text-gray-400 dark:text-gray-500'}`}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errors.password && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-start">
                <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="leading-tight">{errors.password}</span>
              </p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
              <p className="text-sm flex items-start">
                <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="leading-tight">{errors.general}</span>
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition duration-200 text-sm sm:text-base ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/login')}
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-200"
            >
              Sign in here
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            By creating an account, you agree to our{' '}
            <button 
              onClick={() => router.push('/terms')}
              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-200"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button 
              onClick={() => router.push('/privacy')}
              className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-200"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}