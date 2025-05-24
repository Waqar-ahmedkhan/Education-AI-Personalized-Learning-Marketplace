'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'

interface LoginData {
  email: string
  password: string
}

interface ApiResponse {
  success: boolean
  message?: string
  user?: {
    _id: string
    name: string
    email: string
    password: string
    role: string
    isVerified: boolean
    preferences: string[]
    courses: string[]
    recommendedCourses: string[]
    createdAt: string
    updatedAt: string
    __v: number
  }
  accessToken?: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, systemTheme } = useTheme()
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)

  // Initialize and focus email input
  useEffect(() => {
    setMounted(true)
    emailInputRef.current?.focus()
    // Pre-fill email from query param (e.g., from activation redirect)
    const email = searchParams.get('email') || ''
    if (email) {
      setFormData(prev => ({ ...prev, email }))
    }
  }, [searchParams])

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault?.()

    if (isLoading || !validateForm()) return

    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
    }

    submitTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      setErrors({})

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch('http://localhost:8080/api/v1/login-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        let data: ApiResponse
        try {
          data = await response.json()
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError)
          setErrors({ general: 'Invalid server response. Please try again.' })
          return
        }

        if (data.success && data.user && data.accessToken) {
          // Store user data and token
          sessionStorage.setItem('userData', JSON.stringify({
            _id: data.user._id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role
          }))
          sessionStorage.setItem('accessToken', data.accessToken)

          // Check verification status
          if (!data.user.isVerified) {
            sessionStorage.setItem('activationToken', data.accessToken) // Assuming token can be reused
            router.push(`/activate?email=${encodeURIComponent(data.user.email)}`)
            return
          }

          // Redirect to dashboard or home
          router.push('/dashboard')
        } else {
          setErrors({ general: data.message || 'Invalid email or password' })
        }
      } catch (error: unknown) {
        console.error('Login error:', error)
        setErrors({
          general:
            error instanceof Error && error.name === 'AbortError'
              ? 'Request timed out. Please try again.'
              : 'Network error. Please check your connection.'
        })
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }, [formData, isLoading, validateForm, router])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
            <svg className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.76 2.24-5 5-5s5 2.24 5 5v6h-5m-5-6c0-2.76-2.24-5-5-5S2 8.24 2 11v6h5m5-6v6m-5-6v6" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome Back
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                ref={emailInputRef}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                  errors.email
                    ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500'
                    : isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                }`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
                  errors.password
                    ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500'
                    : isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-white'
                }`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.76 2.24-5 5-5s5 2.24 5 5v6h-5m-5-6c0-2.76-2.24-5-5-5S2 8.24 2 11v6h5m5-6v6m-5-6v6" />
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.password}
              </p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className={`p-3 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
              <p className="text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.general}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Forgot your password?{' '}
            <button
              onClick={() => router.push('/forgot-password')}
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Reset Password
            </button>
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Don’t have an account?{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Sign Up
            </button>
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Need to activate your account?{' '}
            <button
              onClick={() => router.push(`/activate?email=${encodeURIComponent(formData.email)}`)}
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Activate Now
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}