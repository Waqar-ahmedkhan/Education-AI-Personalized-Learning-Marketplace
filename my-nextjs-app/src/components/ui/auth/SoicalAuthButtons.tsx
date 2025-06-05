'use client'

import { useCallback } from 'react'
// import { useRouter } from 'next/navigation'

interface Props {
  setGeneralError: (error: string | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function SocialAuthButtons({ setGeneralError, isLoading, setIsLoading }: Props) {
  // const router = useRouter()

  const handleGoogleAuth = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)
    setGeneralError(null)

    try {
      // Redirect to backend's Google OAuth endpoint
      // Adjust URL based on your backend's OAuth setup
      window.location.href = 'http://localhost:8080/api/v1/soical-auth/google'

      // For testing with direct API call (uncomment if needed):
      /*
      const response = await fetch('http://localhost:8080/api/v1/soical-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          avatar: 'https://example.com/avatar.jpg',
        }),
        credentials: 'include',
      })
      const data: ApiResponse = await response.json()
      if (data.success && data.user && data.accessToken) {
        sessionStorage.setItem('userData', JSON.stringify({
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        }))
        sessionStorage.setItem('accessToken', data.accessToken)
        router.push('/dashboard')
      } else {
        setGeneralError(data.message || 'Social login failed.')
      }
      */
    } catch {
      setGeneralError('Network error during social login.')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, setGeneralError, setIsLoading])

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-300 dark:bg-gray-900 dark:text-gray-400">Or continue with</span>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
              : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
          aria-disabled={isLoading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.29 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.07 7.57 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.57 1 4.01 3.93 2.18 7.07l3.66 2.84c.87-2.60 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  )
}