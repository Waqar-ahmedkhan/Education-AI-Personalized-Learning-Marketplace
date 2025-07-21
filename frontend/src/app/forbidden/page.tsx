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
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const iconVariants = {
    animate: {
      scale: [1, 1.15, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="h-16 w-16 border-4 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-gradient-to-br ${
        isDark
          ? 'from-gray-900 via-indigo-950 to-purple-950'
          : 'from-gray-50 via-indigo-100 to-purple-100'
      }`}
    >
      <motion.div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-10 backdrop-blur-xl ${
          isDark
            ? 'bg-gray-900/40 border border-gray-700/30'
            : 'bg-white/50 border border-gray-200/30'
        } shadow-2xl`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center mb-8">
          <motion.div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isDark ? 'bg-red-900/30' : 'bg-red-100/50'
            } shadow-lg`}
            variants={iconVariants}
            animate="animate"
          >
            <Lock
              className={`w-10 h-10 sm:w-12 sm:h-12 ${
                isDark ? 'text-red-400' : 'text-red-500'
              }`}
            />
          </motion.div>
          <h1
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Access Denied
          </h1>
          <p
            className={`mt-3 text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            You lack permission to access this page as of{' '}
            {new Date().toLocaleString('en-PK', {
              timeZone: 'Asia/Karachi',
              dateStyle: 'medium',
              timeStyle: 'short',
            })}.
          </p>
        </div>

        <div className="space-y-6">
          <p
            className={`text-center text-sm sm:text-base ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {userRole
              ? 'Your account lacks the necessary permissions.'
              : 'Please sign in with an admin account to proceed.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/')}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm sm:text-base font-semibold ${
                isDark
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              } transition-all duration-300 shadow-md hover:shadow-lg`}
            >
              <Home size={18} />
              Return Home
            </Button>
            {!userRole && (
              <Button
                onClick={() => router.push('/auth/login')}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm sm:text-base font-semibold ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                } transition-all duration-300 shadow-md hover:shadow-lg`}
              >
                <LogIn size={18} />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}