'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'

// Types
interface ActivationData {
  activation_code: string
  activation_token: string
}

interface ApiResponse {
  success: boolean
  message: string
  errorCode?: string
  action?: string
  user?: {
    name: string
    email: string
    role: string
    isVerified: boolean
    _id: string
  }
}

interface FormErrors {
  activation_code?: string
  general?: string
}

// Constants
const API_ENDPOINT = 'http://localhost:8080/api/v1/user/activate'
const RESEND_COOLDOWN = 30
const AUTO_SUBMIT_DELAY = 300
const REQUEST_TIMEOUT = 10000

const ERROR_MESSAGES: Record<string, { message: string; action?: string }> = {
  MISSING_TOKEN: { message: 'Activation link is invalid or expired. Please request a new code.', action: '/resend-activation' },
  MISSING_CODE: { message: 'Please enter the 4-digit activation code sent to your email.' },
  INVALID_CODE_FORMAT: { message: 'Activation code must be exactly 4 digits.' },
  TOKEN_EXPIRED: { message: 'Your activation code has expired. Please request a new code.', action: '/resend-activation' },
  INVALID_TOKEN: { message: 'Invalid activation link. Please request a new code.', action: '/resend-activation' },
  TOKEN_ERROR: { message: 'Activation link is corrupted. Please request a new code.', action: '/resend-activation' },
  CODE_MISMATCH: { message: 'The activation code is incorrect. Please check and try again.' },
  INCOMPLETE_DATA: { message: 'Activation data is incomplete. Please register again.', action: '/register' },
  ALREADY_ACTIVATED: { message: 'This account is already activated. You can log in.', action: '/auth/login' },
  DUPLICATE_EMAIL: { message: 'An account with this email exists. Try logging in.', action: '/auth/login' },
  DATABASE_ERROR: { message: 'Server error. Please try again later.' },
  VALIDATION_ERROR: { message: 'Invalid information provided. Please check and try again.' },
  NETWORK_ERROR: { message: 'Network issue detected. Please check your connection.' },
  INTERNAL_ERROR: { message: 'Something went wrong. Please try again or contact support.' }
}

// Custom hooks
const useCountdown = (initialValue: number) => {
  const [count, setCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = useCallback((value = initialValue) => {
    setCount(value)
    intervalRef.current = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [initialValue])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCount(0)
  }, [])

  useEffect(() => () => stop(), [stop])

  return { count, start, stop, isActive: count > 0 }
}

// Components
const LoadingSpinner = ({ size = 'sm', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  return (
    <div className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
  )
}

const SuccessScreen = ({ message, isDark }: { message: string, isDark: boolean }) => (
  <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
    isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
  }`}>
    <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 text-center backdrop-blur-sm transition-all duration-300 ${
      isDark 
        ? 'bg-gray-800/90 border border-gray-700/50 shadow-gray-900/50' 
        : 'bg-white/90 border border-white/50 shadow-gray-200/50'
    }`}>
      <div className="relative mb-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto relative overflow-hidden ${
          isDark ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-green-500 to-emerald-500'
        }`}>
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>
      <h2 className={`text-3xl font-bold mb-4 bg-gradient-to-r ${
        isDark ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'
      } bg-clip-text text-transparent`}>
        Account Activated!
      </h2>
      <p className={`mb-6 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {message}
      </p>
      <div className="flex items-center justify-center space-x-2 text-sm text-indigo-500">
        <LoadingSpinner size="sm" />
        <span>Redirecting to login...</span>
      </div>
    </div>
  </div>
)

const CodeInput = ({ 
  index, 
  value, 
  onChange, 
  onPaste, 
  onKeyDown, 
  hasError, 
  isLoading, 
  isDark,
  inputRef 
}: {
  index: number
  value: string
  onChange: (index: number, value: string) => void
  onPaste: (e: React.ClipboardEvent<Element>) => void
  onKeyDown: (index: number, e: React.KeyboardEvent) => void
  hasError: boolean
  isLoading: boolean
  isDark: boolean
  inputRef: (el: HTMLInputElement | null) => void
}) => (
  <input
    ref={inputRef}
    type="text"
    inputMode="numeric"
    maxLength={1}
    value={value}
    onChange={(e) => onChange(index, e.target.value)}
    onPaste={onPaste}
    onKeyDown={(e) => onKeyDown(index, e)}
    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:scale-105 ${
      hasError
        ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50'
        : value
          ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 dark:border-emerald-500 focus:ring-emerald-200 dark:focus:ring-emerald-900/50'
          : isDark
            ? 'border-gray-600 bg-gray-700/50 text-white focus:border-indigo-500 focus:ring-indigo-500/20'
            : 'border-gray-300 bg-white focus:border-indigo-500 focus:ring-indigo-200'
    } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-indigo-400'}`}
    disabled={isLoading}
    aria-label={`Digit ${index + 1} of activation code`}
    autoComplete="one-time-code"
  />
)

export default function ActivationPage() {
  // State
  const [formData, setFormData] = useState<ActivationData>({
    activation_code: '',
    activation_token: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [shake, setShake] = useState(false)

  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSubmittingRef = useRef(false)

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, systemTheme } = useTheme()
  const resendCooldown = useCountdown(RESEND_COOLDOWN)

  // Computed values
  const isDark = useMemo(() => (theme === 'system' ? systemTheme : theme) === 'dark', [theme, systemTheme])
  const isFormValid = useMemo(() => 
    formData.activation_code.length === 4 && 
    /^\d{4}$/.test(formData.activation_code) && 
    formData.activation_token
  , [formData])

  // Effects
  useEffect(() => {
    const token = sessionStorage.getItem('activationToken') || searchParams.get('token') || ''
    setFormData(prev => ({ ...prev, activation_token: token }))
    setMounted(true)

    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current)
    }
  }, [searchParams])

  useEffect(() => {
    if (isFormValid && !isLoading && !isSubmittingRef.current) {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current)
      submitTimeoutRef.current = setTimeout(handleSubmit, AUTO_SUBMIT_DELAY)
    }
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current)
    }
  }, [isFormValid, isLoading])

  // Handlers
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.activation_code.trim()) {
      newErrors.activation_code = ERROR_MESSAGES.MISSING_CODE.message
    } else if (!/^\d{4}$/.test(formData.activation_code.trim())) {
      newErrors.activation_code = ERROR_MESSAGES.INVALID_CODE_FORMAT.message
    }
    
    if (!formData.activation_token) {
      newErrors.general = ERROR_MESSAGES.MISSING_TOKEN.message
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleDigitChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return

    setFormData(prev => {
      const newCode = prev.activation_code.padEnd(4, '').split('')
      newCode[index] = value
      return {
        ...prev,
        activation_code: newCode.join('').replace(/\s/g, '')
      }
    })

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }

    // Clear errors
    setErrors(prev => ({ ...prev, activation_code: undefined, general: undefined }))
  }, [])

  const handlePaste = useCallback((e: React.ClipboardEvent<Element>) => {
    e.preventDefault()
    const event = e as React.ClipboardEvent<HTMLInputElement>
    const pastedData = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    
    if (pastedData.length > 0) {
      setFormData(prev => ({ ...prev, activation_code: pastedData }))
      const focusIndex = Math.min(pastedData.length - 1, 3)
      inputRefs.current[focusIndex]?.focus()
    }
  }, [])

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Backspace':
        if (!formData.activation_code[index] && index > 0) {
          inputRefs.current[index - 1]?.focus()
        }
        break
      case 'ArrowLeft':
        if (index > 0) inputRefs.current[index - 1]?.focus()
        break
      case 'ArrowRight':
        if (index < 3) inputRefs.current[index + 1]?.focus()
        break
      case 'Enter':
        if (isFormValid) handleSubmit()
        break
    }
  }, [formData.activation_code, isFormValid])

  const resetForm = useCallback(() => {
    setFormData(prev => ({ ...prev, activation_code: '' }))
    setShake(true)
    setTimeout(() => setShake(false), 600)
    inputRefs.current[0]?.focus()
  }, [])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (isSubmittingRef.current || isLoading || !validateForm()) return

    isSubmittingRef.current = true
    setIsLoading(true)
    setErrors({})
    setShake(false)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

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
        
        setTimeout(() => router.push('/auth/login'), 2500)
      } else {
        const errorInfo = ERROR_MESSAGES[data.errorCode || 'INTERNAL_ERROR']
        setErrors({ general: errorInfo.message })
        resetForm()
        
        if (data.action && errorInfo.action) {
          setTimeout(() => router.push(errorInfo.action!), 3000)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && error.name === 'AbortError'
        ? 'Request timed out. Please try again.'
        : ERROR_MESSAGES.NETWORK_ERROR.message
        
      setErrors({ general: errorMessage })
      resetForm()
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }, [formData, validateForm, router, isLoading, resetForm])

  const handleResend = useCallback(() => {
    if (resendCooldown.isActive) return
    resendCooldown.start()
    router.push('/resend-activation')
  }, [resendCooldown, router])

  const clearCode = useCallback(() => {
    setFormData(prev => ({ ...prev, activation_code: '' }))
    setErrors({})
    inputRefs.current[0]?.focus()
  }, [])

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" className="text-indigo-600" />
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return <SuccessScreen message={successMessage} isDark={isDark} />
  }

  // Main form
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
    }`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-8 backdrop-blur-sm transition-all duration-300 ${
        isDark 
          ? 'bg-gray-800/90 border border-gray-700/50 shadow-gray-900/50' 
          : 'bg-white/90 border border-white/50 shadow-gray-200/50'
      } ${shake ? 'animate-pulse' : ''}`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isDark ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold mb-3 bg-gradient-to-r ${
            isDark ? 'from-white to-gray-300' : 'from-gray-900 to-gray-700'
          } bg-clip-text text-transparent`}>
            Activate Your Account
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Enter the 4-digit verification code sent to your email
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className={`block text-sm font-medium mb-4 text-center ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Verification Code
            </label>
            
            <div className={`flex justify-center space-x-3 ${shake ? 'animate-bounce' : ''}`}>
              {[0, 1, 2, 3].map((index) => (
                <CodeInput
                  key={index}
                  index={index}
                  value={formData.activation_code[index] || ''}
                  onChange={handleDigitChange}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  hasError={!!errors.activation_code}
                  isLoading={isLoading}
                  isDark={isDark}
                  inputRef={(el) => { inputRefs.current[index] = el }}
                />
              ))}
            </div>
            
            {errors.activation_code && (
              <p className="mt-3 text-sm text-red-500 dark:text-red-400 flex items-center justify-center animate-fadeIn">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.activation_code}
              </p>
            )}
          </div>

          {/* General Error */}
          {errors.general && (
            <div className={`p-4 rounded-xl border-l-4 ${
              isDark 
                ? 'bg-red-900/20 border-red-500 text-red-400' 
                : 'bg-red-50 border-red-400 text-red-600'
            } animate-fadeIn`}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`w-full py-4 rounded-xl font-semibold text-sm transition-all duration-200 transform ${
              isLoading || !isFormValid
                ? 'bg-gray-400 cursor-not-allowed text-gray-600 scale-95'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Activating Account...</span>
              </div>
            ) : (
              'Activate Account'
            )}
          </button>
        </form>

        {/* Footer Actions */}
        <div className="mt-8 space-y-4 text-center">
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Didn&apos;t receive a code?{' '}
            <button
              onClick={handleResend}
              disabled={isLoading || resendCooldown.isActive}
              className={`font-semibold transition-colors ${
                isLoading || resendCooldown.isActive
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300'
              }`}
            >
              {resendCooldown.isActive ? `Resend in ${resendCooldown.count}s` : 'Resend Code'}
            </button>
          </div>
          
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Need to start over?{' '}
            <button
              onClick={clearCode}
              disabled={isLoading}
              className={`font-semibold transition-colors ${
                isLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300'
              }`}
            >
              Clear Code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}