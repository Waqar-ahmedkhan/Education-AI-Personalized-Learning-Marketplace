'use client';

import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XCircle } from 'lucide-react';

interface FormData {
  currentPassword: string;
  newPassword: string;
}

export default function UpdatePassword() {
  const { isLoading, isAuthenticated } = useAuth();
  const { theme, systemTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/user/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        router.push('/profiles');
      } else {
        setError(result.message || 'Failed to update password');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Update password error:', err);
    }
  };

  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

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

  return (
    <div
      className={`min-h-screen p-6 bg-gradient-to-br ${isDark ? 'from-gray-900 via-indigo-900 to-purple-900' : 'from-gray-100 via-indigo-200 to-purple-200'}`}
    >
      <motion.div
        className="container mx-auto max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className={`backdrop-blur-lg ${isDark ? 'bg-gray-800/70 border-gray-700/50' : 'bg-white/70 border-gray-200/50'} shadow-xl`}>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Update Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                <p className="text-sm flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  {error}
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword', { required: 'Current password is required' })}
                  className={isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}
                />
                {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    pattern: {
                      value: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Password must contain uppercase, lowercase, number, and special character',
                    },
                  })}
                  className={isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}
                />
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
              </div>
              <Button type="submit" className={`${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white`}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}