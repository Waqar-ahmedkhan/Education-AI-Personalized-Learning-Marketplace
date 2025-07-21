// pages/notifications.tsx
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import NotificationList from '@/components/dashboard/NotificationList';

const NotificationsPage: React.FC = () => {
  const { isAdmin, isLoading, isTokenExpired } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const router = useRouter();

  // Redirect non-admins or unauthenticated users
  useEffect(() => {
    if (!isLoading && (!isAdmin || isTokenExpired)) {
      router.push('/auth/login?error=Admin+access+required');
    }
  }, [isAdmin, isLoading, isTokenExpired, router]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-500`}
    >
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className={`text-3xl font-bold tracking-tight sm:text-4xl ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Notification Management
          </motion.h2>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-gray-800" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </button>
        </div>
        <NotificationList theme={theme} />
      </div>
    </motion.div>
  );
};

export default NotificationsPage;