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
import { AlertCircle, BookOpen, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
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
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newCourse, setNewCourse] = useState<{ title: string; instructor: string }>({ title: '', instructor: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

  const fetchCourses = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const response = await axios.get<ApiResponse<Course[]>>(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/get-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const coursesData = response.data.courses || response.data.data || [];
      setCourses(coursesData);
      setFilteredCourses(coursesData);
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

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchTerm, courses]);

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
      setShowUploadForm(false);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Loading courses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Course Management
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-2">
                Manage your courses and create new learning experiences
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="mr-2 h-4 w-4" />
                Quick Upload
              </Button>
              <Button
                onClick={() => router.push('/admin-dashboard/courses/create')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Create Course
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Upload Form */}
        {showUploadForm && (
          <Card className="mb-8 shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Quick Upload Course
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUploadCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Title</label>
                    <Input
                      type="text"
                      placeholder="Enter course title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      required
                      className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Instructor Name</label>
                    <Input
                      type="text"
                      placeholder="Enter instructor name"
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                      required
                      className="border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUploadForm(false)}
                    className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    Upload Course
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter Section */}
        <Card className="mb-8 shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search courses or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                <Filter className="h-4 w-4" />
                <span>
                  {filteredCourses.length} of {courses.length} courses
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Table */}
        <Card className="shadow-xl border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-t-lg border-b">
            <CardTitle className="text-slate-800 dark:text-slate-200">
              All Courses ({filteredCourses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                  {courses.length === 0 ? 'No courses found' : 'No courses match your search'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {courses.length === 0 ? 'Create your first course to get started' : 'Try adjusting your search terms'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Course Title</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200">Instructor</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 hidden sm:table-cell">Created Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-200 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow 
                        key={course._id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-200 dark:border-slate-600"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                              {course.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">{course.name}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 sm:hidden">
                                by {course.instructor.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                          {course.instructor.name}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                          {new Date(course.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-200"
                            >
                              <Edit2 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCourse(course._id)}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}