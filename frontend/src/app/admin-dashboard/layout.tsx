'use client';

import Sidebar from '@/components/dashboard/Sidebar';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Settings, ChevronDown, Menu } from 'lucide-react';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const { userRole, isLoading, userName, isTokenExpired } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && (!userRole || userRole !== 'admin' || isTokenExpired)) {
      router.push(isTokenExpired ? '/auth/login' : '/forbidden');
    }
  }, [userRole, isLoading, isTokenExpired, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-16 w-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <p className="text-slate-300 font-medium text-base">Loading Dashboard...</p>
            <p className="text-slate-400 text-xs">Please wait while we prepare your workspace</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!userRole || userRole !== 'admin' || isTokenExpired) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -256 }}
        animate={{ x: sidebarOpen ? 0 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 left-0 h-full z-50 lg:static lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        <Sidebar />
      </motion.div>

      <main className="flex-1 relative">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 sm:px-6 py-3"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Welcome, {userName || 'Administrator'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative w-32 sm:w-48 md:w-64">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>

              <button className="relative p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              <button className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
              </button>

              <div className="flex items-center space-x-2 sm:pl-3 sm:border-l border-slate-200 dark:border-slate-700">
                <div className="relative">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {(userName || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-white dark:border-slate-900"></div>
                </div>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window !== 'undefined' ? window.location.pathname : 'initial'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}