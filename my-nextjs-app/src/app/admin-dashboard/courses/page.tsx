// app/admin-dashboard/courses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Course {
  _id: string;
  name: string;
  instructor: { name: string };
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  courses?: T; // Handle both response formats
  message?: string;
}

export default function CoursesSection() {
  const { token } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState<{ title: string; instructor: string }>({ title: '', instructor: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchCourses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const response = await axios.get<ApiResponse<Course[]>>(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/get-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.courses || response.data.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCourses();
  }, [token]);

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setError('');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/upload-course`,
        { name: newCourse.title, instructor: { name: newCourse.instructor } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewCourse({ title: '', instructor: '' });
      await fetchCourses();
      toast.success('Course uploaded successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload course';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!token) return;
    try {
      setError('');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/delete-course`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id },
      });
      await fetchCourses();
      toast.success('Course deleted successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-text-light dark:text-text-dark">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-text-light dark:text-text-dark">
        Course Management
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive max-w-md">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">Error</AlertTitle>
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-8">
        <CardHeader>
          <CardTitle className="text-text-light dark:text-text-dark">Upload New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUploadCourse} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Course Title"
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              required
              className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
            />
            <Input
              type="text"
              placeholder="Instructor Name"
              value={newCourse.instructor}
              onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
              required
              className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
            />
            <Button
              type="submit"
              className="bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light"
            >
              Upload
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-text-light dark:text-text-dark">Courses</CardTitle>
          <Button
            className="bg-primary-light dark:bg-primary-dark text-white"
            onClick={() => router.push('/admin-dashboard/courses/create')}
          >
            <BookOpen className="mr-2" /> Create Course
          </Button>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-center text-text-light dark:text-text-dark py-6">No courses found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <TableHead className="text-text-light dark:text-text-dark">Title</TableHead>
                  <TableHead className="text-text-light dark:text-text-dark">Instructor</TableHead>
                  <TableHead className="text-text-light dark:text-text-dark">Created At</TableHead>
                  <TableHead className="text-text-light dark:text-text-dark">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="text-text-light dark:text-text-dark">{course.name}</TableCell>
                    <TableCell className="text-text-light dark:text-text-dark">{course.instructor.name}</TableCell>
                    <TableCell className="text-text-light dark:text-text-dark">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary-light dark:text-primary-dark border-primary-light dark:border-primary-dark hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 dark:text-red-400 border-red-500 dark:border-red-400 hover:bg-red-500 dark:hover:bg-red-400 hover:text-white"
                        onClick={() => handleDeleteCourse(course._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}