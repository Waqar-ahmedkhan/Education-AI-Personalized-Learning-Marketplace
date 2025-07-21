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
  name: string;
}

export default function UpdateInfo() {
  const { isLoading, isAuthenticated, token, userName } = useAuth();
  const { theme, systemTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    setMounted(true);
    setValue('name', userName || '');
  }, [userName, setValue]);

  useEffect(() => {
    if (mounted && !isAuthenticated && !isLoading) {
      router.push('/auth/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/api/v1/user/update-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Information updated successfully.');
      } else {
        setError(result.message || 'Failed to update information');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Something went wrong. Please try again.');
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
      className={`min-h-screen p-6 bg-gradient-to-br ${
        isDark ? 'from-gray-900 via-indigo-900 to-purple-900' : 'from-gray-100 via-indigo-200 to-purple-200'
      }`}
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
              Update Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(error || success) && (
              <div
                className={`mb-4 p-4 rounded-lg border ${
                  error
                    ? isDark
                      ? 'bg-red-900/20 border-red-500 text-red-400'
                      : 'bg-red-50 border-red-200 text-red-600'
                    : isDark
                    ? 'bg-green-900/20 border-green-500 text-green-400'
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}
              >
                <p className="text-sm flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  {error || success}
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className={isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
              <Button
                type="submit"
                className={`${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white`}
              >
                Update Info
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
