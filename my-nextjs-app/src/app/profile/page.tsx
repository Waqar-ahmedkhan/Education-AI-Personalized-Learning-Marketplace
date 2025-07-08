'use client';

import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, CheckCircle, XCircle, Edit, LogOut } from 'lucide-react';


export default function Profile() {
  const { userRole, userName, isLoading } = useAuth();
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<{ email: string; isVerified: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (userRole && !isLoading) {
      const fetchProfile = async () => {
        try {
          const token = Cookies.get('access_token');
          if (!token) {
            setError('No authentication token found');
            return;
          }
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          });
          const data = await res.json();
          if (data.success) {
            setUserData({ email: data.user.email, isVerified: data.user.isVerified });
          } else {
            setError(data.message || 'Failed to fetch profile data');
          }
        } catch (err) {
          setError('Failed to connect to the server');
          console.error('Profile fetch error:', err);
        }
      };
      fetchProfile();
    }
  }, [userRole, isLoading]);

  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (!mounted || isLoading) {
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

  if (!userRole) {
    return (
      <div className={`min-h-screen p-6 bg-gradient-to-br ${isDark ? 'from-gray-900 to-indigo-900' : 'from-gray-100 to-indigo-200'}`}>
        <motion.div
          className="text-center text-red-600 dark:text-red-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Please log in to view your profile.
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 bg-gradient-to-br ${isDark ? 'from-gray-900 via-indigo-900 to-purple-900' : 'from-gray-100 via-indigo-200 to-purple-200'}`}
    >
      <motion.div
        className="container mx-auto max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark">
          Your Profile
        </h1>

        {error && (
          <motion.div
            className={`mb-6 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            aria-live="polite"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
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

        <Card className={`backdrop-blur-lg ${isDark ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'} shadow-xl`}>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-text-light dark:text-text-dark">
              Profile Details
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className={`${isDark ? 'text-primary-dark border-primary-dark hover:bg-primary-dark' : 'text-primary-light border-primary-light hover:bg-primary-light'} hover:text-white`}
            >
              <Edit size={16} className="mr-2" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div className="flex items-center gap-4" variants={itemVariants}>
              <User className={`w-6 h-6 ${isDark ? 'text-primary-dark' : 'text-primary-light'}`} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-lg font-medium text-text-light dark:text-text-dark">{userName || 'User'}</p>
              </div>
            </motion.div>
            <motion.div className="flex items-center gap-4" variants={itemVariants}>
              <Mail className={`w-6 h-6 ${isDark ? 'text-primary-dark' : 'text-primary-light'}`} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-lg font-medium text-text-light dark:text-text-dark">{userData?.email || 'Not available'}</p>
              </div>
            </motion.div>
            <motion.div className="flex items-center gap-4" variants={itemVariants}>
              <Shield className={`w-6 h-6 ${isDark ? 'text-primary-dark' : 'text-primary-light'}`} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-lg font-medium text-text-light dark:text-text-dark">{userRole}</p>
              </div>
            </motion.div>
            <motion.div className="flex items-center gap-4" variants={itemVariants}>
              <CheckCircle className={`w-6 h-6 ${userData?.isVerified ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`} />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Verified</p>
                <p className="text-lg font-medium text-text-light dark:text-text-dark">{userData?.isVerified ? 'Yes' : 'No'}</p>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        <motion.div className="mt-6 flex justify-end" variants={itemVariants}>
          <Button
            variant="outline"
            className={`${isDark ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-600 border-gray-300 hover:bg-gray-200'}`}
            onClick={() => window.location.href = '/auth/logout'}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}