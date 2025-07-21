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
  avatar: FileList;
}

export default function AvatarUpload() {
  const { isLoading, isAuthenticated, token } = useAuth();
  const { theme, systemTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && !isLoading) {
      console.log('AvatarUpload: Not authenticated, redirecting to /auth/login');
      router.push('/auth/login');
    }
  }, [mounted, isAuthenticated, isLoading, router]);

  const onSubmit = async (data: FormData) => {
    setError(null);
    const file = data.avatar?.[0];

    if (!file) {
      setError('No file selected');
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64 = reader.result?.toString();

        if (!base64) {
          setError('Failed to process image');
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${baseUrl}/api/v1/user/avatar-upload`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ avatar: base64 }), // full data URI
        });

        const result = await response.json();

        if (response.ok && result.success) {
          router.push('/profiles');
        } else {
          setError(result.message || 'Failed to upload avatar');
        }
      } catch (err) {
        console.error('Upload error:', err);
        setError('Upload failed. Please try again.');
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsDataURL(file);
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
              Upload Avatar
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
                <Label htmlFor="avatar" className="text-gray-700 dark:text-gray-300">Avatar Image</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  {...register('avatar', { required: 'Avatar image is required' })}
                  className={isDark ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}
                />
                {errors.avatar && <p className="text-red-500 text-sm mt-1">{errors.avatar.message}</p>}
              </div>
              <Button
                type="submit"
                className={`${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white`}
              >
                Upload Avatar
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
