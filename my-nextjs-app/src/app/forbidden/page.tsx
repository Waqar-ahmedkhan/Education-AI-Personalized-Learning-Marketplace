'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Lock, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export default function ForbiddenPage() {
  const { userRole } = useAuth();
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const iconVariants = {
    animate: { scale: [1, 1.1, 1], transition: { duration: 1.5, repeat: Infinity } },
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
              isDark ? 'bg-red-900/50' : 'bg-red-100/80'
            }`}
            variants={iconVariants}
            animate="animate"
          >
            <Lock className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </motion.div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Access Denied
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            You do not have permission to access this page as of{' '}
            {new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}.
          </p>
        </div>

        <div className="space-y-4">
          <p className={`text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {userRole
              ? 'Your account does not have the required permissions.'
              : 'Please log in with an admin account to access this page.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/')}
              className={`flex items-center gap-2 ${
                isDark
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } transition-colors`}
            >
              <Home size={16} />
              Go to Home
            </Button>
            {!userRole && (
              <Button
                onClick={() => router.push('/auth/login')}
                className={`flex items-center gap-2 ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                } transition-colors`}
              >
                <LogIn size={16} />
                Log In
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}