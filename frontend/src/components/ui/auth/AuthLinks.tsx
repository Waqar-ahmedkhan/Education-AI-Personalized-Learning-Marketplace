'use client'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

export default function AuthLinks() {
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark'

  return (
    <div className="mt-6 text-center space-y-3">
      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Forgot your password?{' '}
        <button
          onClick={() => router.push('/auth/forgot-password')}
          className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          Reset Password
        </button>
      </p>
      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Don’t have an account?{' '}
        <button
          onClick={() => router.push('/auth/registration')}
          className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          Sign Up
        </button>
      </p>
    </div>
  )
}