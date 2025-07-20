'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AlertCircle, BookOpen, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

interface Course {
  _id: string;
  name: string;
  instructor: { name: string };
  thumbnail?: { public_id: string; url: string };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

const EditCoursePage: React.FC = () => {
  const { token, isAdmin, isLoading, isTokenExpired } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<{ name: string; instructor: string; thumbnail?: string }>({
    name: '',
    instructor: '',
    thumbnail: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!isLoading && (!isAdmin || isTokenExpired)) {
      router.push('/auth/login?error=Admin+access+required');
    } else if (token && id) {
      fetchCourse();
    }
  }, [token, isAdmin, isLoading, isTokenExpired, id, router]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get<ApiResponse<Course>>(`${baseUrl}/api/v1/get-course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      if (response.data.success && response.data.data) {
        setCourse(response.data.data);
        setFormData({
          name: response.data.data.name,
          instructor: response.data.data.instructor.name,
          thumbnail: response.data.data.thumbnail?.url || '',
        });
      } else {
        setError('Failed to fetch course');
        toast.error('Failed to fetch course');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch course';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.instructor.trim()) {
      setError('Course title and instructor name are required.');
      toast.error('Course title and instructor name are required.');
      return;
    }
    try {
      setError('');
      setIsSubmitting(true);
      await axios.put(
        `${baseUrl}/api/v1/edit-course/${id}`,
        {
          name: formData.name,
          instructor: { name: formData.instructor },
          thumbnail: formData.thumbnail || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      toast.success('Course updated successfully');
      router.push('/admin-dashboard/courses');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update course';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center"
      >
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"
          />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading course...</p>
        </div>
      </motion.div>
    );
  }

  if (!course) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center"
      >
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 max-w-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Course not found</AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
    >
      <div className="container mx-auto px-4 py-8">
        <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Edit Course: {course.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
                <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Course Title
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter course title"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Instructor Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter instructor name"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    required
                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Thumbnail (optional)
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  />
                  {formData.thumbnail && (
                    <Image
                      src={formData.thumbnail}
                      alt="Thumbnail Preview"
                      width={128}
                      height={128}
                      className="mt-2 w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin-dashboard/courses')}
                  className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default EditCoursePage;