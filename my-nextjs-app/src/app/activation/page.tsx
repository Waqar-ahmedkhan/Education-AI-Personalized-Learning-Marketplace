'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'

interface ActivationData {
  activation_code: string
  activation_token: string
}

interface ApiResponse {
  success: boolean
  message: string
  user?: {
    name: string
    email: string
    password: string
    role: string
    isVerified: boolean
    preferences: string[]
    _id: string
    courses: string[]
    recommendedCourses: string[]
    createdAt: string
    updatedAt: string
    __v: number
  }
}

interface FormErrors {
  activation_code?: string
  general?: string
}

export default function ActivationPage() {
  const [formData, setFormData] = useState<ActivationData>({
    activation_code: '',
    activation_token: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, systemTheme } = useTheme()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize token and mount state
  useEffect(() => {
    const token = sessionStorage.getItem('activationToken') || searchParams.get('token') || ''
    setFormData(prev => ({ ...prev, activation_token: token }))
    setMounted(true)
  }, [searchParams])

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isDark = currentTheme === 'dark'

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.activation_code.trim()) {
      newErrors.activation_code = 'Activation code is required'
    } else if (!/^\d{4}$/.test(formData.activation_code.trim())) {
      newErrors.activation_code = 'Code must be exactly 4 digits'
    }

    if (!formData.activation_token) {
      newErrors.general = 'Activation token is missing. Please restart the process.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Handle digit input
  const handleDigitChange = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return

    const newCode = formData.activation_code.padEnd(4, ' ').split('')
    newCode[index] = value || ' '
    const updatedCode = newCode.join('').trim()

    setFormData(prev => ({
      ...prev,
      activation_code: updatedCode
    }))

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    // Clear errors
    setErrors(prev => ({
      ...prev,
      activation_code: undefined,
      general: undefined
    }))
  }, [formData])

  // Handle backspace
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !formData.activation_code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }, [formData])

  // Handle form submission with debounce
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault?.()

    if (isLoading || !validateForm()) return

    // Debounce submission
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
    }

    submitTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      setErrors({})

      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout

        const response = await fetch('http://localhost:8080/api/v1/active-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            activation_code: formData.activation_code,
            activation_token: formData.activation_token
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

        if (data.success) {
          setIsSuccess(true)
          setSuccessMessage(data.message)
          sessionStorage.removeItem('activationToken')
          if (data.user) {
            sessionStorage.setItem('userData', JSON.stringify({
              name: data.user.name,
              email: data.user.email,
              role: data.user.role
            }))
          }
          setFormData({ activation_code: '', activation_token: '' })
        } else {
          setErrors({ general: data.message || 'Activation failed. Please check your code.' })
          setFormData(prev => ({ ...prev, activation_code: '' }))
        }
      } catch (error: unknown) {
        console.error('Activation error:', error)
        setErrors({
          general: (error instanceof Error && error.name === 'AbortError')
            ? 'Request timed out. Please try again.'
            : 'Network error. Please check your connection.'
        })
        setFormData(prev => ({ ...prev, activation_code: '' }))
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce
  }, [formData, isLoading, validateForm])

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (formData.activation_code.length === 4 && validateForm()) {
      handleSubmit()
    }
  }, [formData.activation_code, handleSubmit, validateForm])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full rounded-xl shadow-lg p-6 text-center ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Account Activated
          </h2>
          <p className={`mb-6 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {successMessage}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`max-w-md w-full rounded-xl shadow-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Activate Your Account
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Enter the 4-digit code sent to your email
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-3 text-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              Verification Code
            </label>
            <div className="flex justify-center space-x-2">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={formData.activation_code[index] || ''}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.activation_code
                      ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500'
                      : formData.activation_code[index]
                        ? 'border-green-400 bg-green-50/50 dark:bg-green-900/20 dark:border-green-500'
                        : isDark
                          ? 'border-gray-600 bg-gray-700 text-white'
                          : 'border-gray-300 bg-white'
                  }`}
                  disabled={isLoading}
                />
              ))}
            </div>
            {errors.activation_code && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.activation_code}
              </p>
            )}
          </div>

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

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || formData.activation_code.length !== 4}
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
              isLoading || formData.activation_code.length !== 4
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Activating...
              </div>
            ) : (
              'Activate Account'
            )}
          </button>
        </div>

        <div className="mt-6 text-center space-y-3">
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Didn’t receive a code?{' '}
            <button
              onClick={() => router.push('/resend-activation')}
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Resend Code
            </button>
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Wrong code?{' '}
            <button
              onClick={() => {
                setFormData(prev => ({ ...prev, activation_code: '' }))
                setErrors({})
                inputRefs.current[0]?.focus()
              }}
              className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Clear and Retry
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}