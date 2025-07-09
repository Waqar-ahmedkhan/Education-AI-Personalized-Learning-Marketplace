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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Cookies from 'js-cookie';

interface FormData {
  name: string;
  email: string;
}

export default function UpdateInfo() {
  const { userName, isLoading, isAuthenticated } = useAuth();
  const { theme, systemTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: userName || '', email: '' },
  });

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !isAuthenticated) {
      console.log('UpdateInfo: Not authenticated, redirecting to /auth/login');
      router.push('/auth/login?error=Please+log+in');
    }
  }, [isLoading, isAuthenticated, router]);

  const onSubmit = async (data: FormData) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${baseUrl}/api/v1/user/update-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token') || Cookies.get('access_token')}`,
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        router.push('/profiles?success=Profile+updated+successfully');
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to connect to the server');
      console.error('Update info error:', err);
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
      className={`min-h-screen p-4 sm:p-6 bg-gradient-to-br ${isDark ? 'from-gray-900 via-indigo-900 to-purple-900' : 'from-gray-100 via-indigo-200 to-purple-200'} flex items-center justify-center`}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="backdrop-blur-lg bg-gray-800/70 dark:bg-gray-800/70 border-gray-700/50 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                  className={isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}
                />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { pattern: { value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Invalid email' } })}
                  className={isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}
                />
                {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
              </div>
              <Button type="submit" className={`w-full ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white`}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}