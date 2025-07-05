'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth'
import { motion } from 'framer-motion' // For animations

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const { theme, systemTheme } = useTheme()
  const { login, user } = useAuth()
  const router = useRouter()
  const emailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    emailInputRef.current?.focus()
    if (user?.role === 'admin') router.push('/admin-dashboard')
  }, [user, router])

  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark'

  type LoginResponse = { role?: string } | null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await login(email, password) as unknown as LoginResponse
      if (response?.role === 'admin') router.push('/admin-dashboard')
      else setError('Unauthorized: Admin access only')
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        setError(searchParams.get('error') || (err as { message: string }).message || 'Invalid email or password')
      } else {
        setError(searchParams.get('error') || 'Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 border-4 border-indigo-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${isDark ? 'from-gray-900 to-indigo-900' : 'from-gray-100 to-indigo-200'} p-4`}>
      <motion.div
        className={`max-w-md w-full rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-6">
          <motion.div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}
            animate={{ scale: [1, 1.05, 1], transition: { duration: 1.5, repeat: Infinity } }}
          >
            <svg className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.76 2.24-5 5-5s5 2.24 5 5v6h-5m-5-6c0-2.76-2.24-5-5-5S2 8.24 2 11v6h5m5-6v6m-5-6v6" />
            </svg>
          </motion.div>
          <h1 className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Admin Login
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Secure access to the admin panel as of {new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
              required
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all"
              required
              placeholder="••••••••"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>
        {error && (
          <motion.div
            className={`mt-4 p-3 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
              <button onClick={() => setError(null)} className="text-sm hover:text-red-300">×</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}