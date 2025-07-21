'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, systemTheme } = useTheme();
  const { login, userRole, isAdmin } = useAuth();
  const router = useRouter();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    emailInputRef.current?.focus();
    console.log('Checking userRole on mount:', userRole, 'isAdmin:', isAdmin);
    if (isAdmin) {
      console.log('Redirecting to /admin-dashboard');
      router.push('/admin-dashboard');
    }
  }, [isAdmin, router]);

  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  const validateForm = () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError(null);
    setLoading(true);

    try {
      console.log('Attempting admin login with email:', email);
      await login(email, password, "admin"); // Pass isAdmin: true
      console.log('Login successful, redirecting to /admin-dashboard');
    } catch (error: unknown) {
      const axiosError = error as { message?: string; response?: { status?: number; data?: unknown } };
      console.error('Login error in AdminLoginPage:', {
        message: axiosError?.message,
        status: axiosError?.response?.status,
        data: axiosError?.response?.data,
      });
      setError(axiosError?.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 border-4 border-indigo-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${
        isDark ? 'from-gray-900 via-indigo-900 to-purple-900' : 'from-gray-100 via-indigo-200 to-purple-200'
      } p-4 sm:p-6`}
    >
      <motion.div
        className={`max-w-md w-full rounded-2xl p-8 backdrop-blur-lg ${
          isDark ? 'bg-gray-800/70 border border-gray-700/50' : 'bg-white/70 border border-gray-200/50'
        } shadow-xl`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <motion.div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDark ? 'bg-indigo-900/50' : 'bg-indigo-100/80'
            }`}
            animate={{ scale: [1, 1.05, 1], transition: { duration: 1.5, repeat: Infinity } }}
          >
            <svg
              className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0-2.76 2.24-5 5-5s5 2.24 5 5v6h-5m-5-6c0-2.76-2.24-5-5-5S2 8.24 2 11v6h5m5-6v6m-5-6v6"
              />
            </svg>
          </motion.div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Admin Login
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Secure access to the admin panel as of{' '}
            {new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
            >
              Email
            </label>
            <motion.input
              id="email"
              ref={emailInputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-indigo-500 transition-all`}
              required
              placeholder="admin@example.com"
              aria-label="Admin email"
              variants={inputVariants}
              whileFocus="focus"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
            >
              Password
            </label>
            <motion.input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDark ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-indigo-500 transition-all`}
              required
              placeholder="••••••••"
              aria-label="Admin password"
              variants={inputVariants}
              whileFocus="focus"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-10 ${isDark ? 'text-gray-300' : 'text-gray-500'} hover:text-indigo-500`}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg text-white ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } transition-colors disabled:cursor-not-allowed`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>
        {error && (
          <motion.div
            className={`mt-6 p-4 rounded-lg border ${
              isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
              <button
                onClick={() => setError(null)}
                className={`text-sm ${isDark ? 'hover:text-red-300' : 'hover:text-red-700'}`}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
        <div className="mt-6 text-center">
          <a
            href="/auth/forgot-password"
            className={`text-sm ${
              isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
            } transition-colors`}
          >
            Forgot Password?
          </a>
        </div>
      </motion.div>
    </div>
  );
}