'use client'

import { useState, useCallback } from 'react'
import IconInput from './IconInput'

interface LoginData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

interface ApiResponse {
  success: boolean
  message?: string
  user?: {
    _id: string
    name: string
    email: string
    role: string
    isVerified: boolean
  }
  accessToken?: string
}

interface LoginFormProps {
  emailInputRef: React.RefObject<HTMLInputElement | null>
  initialEmail: string
  onSuccess: (data: ApiResponse) => void
  setGeneralError: (error: string | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function LoginForm({ emailInputRef, initialEmail, onSuccess, setGeneralError, isLoading, setIsLoading }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginData>({ email: initialEmail, password: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)

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

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
    setGeneralError(null)
  }, [setGeneralError])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || !validateForm()) return

    setIsLoading(true)
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch('http://localhost:8080/api/v1/login-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim(), password: formData.password }),
        signal: controller.signal,
        credentials: 'include',
      })

      clearTimeout(timeoutId)

      let data: ApiResponse
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError)
        setGeneralError('Invalid server response. Please try again.')
        return
      }

      onSuccess(data)
    } catch (error: unknown) {
      console.error('Login error:', error)
      setGeneralError(
        error instanceof Error && error.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : 'Network error. Please check your connection.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [formData, isLoading, validateForm, onSuccess, setGeneralError, setIsLoading])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <IconInput
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="you@example.com"
        label="Email Address"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        error={errors.email}
        disabled={isLoading}
        ref={emailInputRef}
      />
      <IconInput
        id="password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleInputChange}
        placeholder="••••••••"
        label="Password"
        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.76 2.24-5 5-5s5 2.24 5 5v6h-5m-5-6c0-2.76-2.24-5-5-5S2 8.24 2 11v6h5m5-6v6m-5-6v6" /></svg>}
        error={errors.password}
        disabled={isLoading}
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
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
        }
      />
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        }`}
        aria-disabled={isLoading}
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
  )
}