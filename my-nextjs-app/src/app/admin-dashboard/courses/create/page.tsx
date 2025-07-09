// app/admin-dashboard/courses/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CourseData {
  title: string;
  description: string;
  videoUrl: string;
  videoLength: number;
}

interface CourseForm {
  name: string;
  description: string;
  price: number;
  estimatedPrice: number;
  thumbnail: string; // Base64 string for Cloudinary upload
  tags: string;
  level: string;
  demoUrl: string;
  category: string;
  instructor: {
    name: string;
  };
  courseData: CourseData[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function CreateCoursePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<CourseForm>({
    name: '',
    description: '',
    price: 0,
    estimatedPrice: 0,
    thumbnail: '',
    tags: '',
    level: '',
    demoUrl: '',
    category: '',
    instructor: { name: '' },
    courseData: [{ title: '', description: '', videoUrl: '', videoLength: 0 }],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError('Thumbnail file size must be under 5MB');
          toast.error('Thumbnail file size must be under 5MB');
          return;
        }
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setFormData({ ...formData, thumbnail: base64 });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process thumbnail';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('No authentication token found');
      toast.error('No authentication token found');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await axios.post<ApiResponse<unknown>>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/upload-course`,
        {
          ...formData,
          tags: formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Course created successfully');
      router.push('/admin-dashboard/courses');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateCourseData = (index: number, field: keyof CourseData, value: string | number) => {
    const updatedCourseData = [...formData.courseData];
    updatedCourseData[index] = { ...updatedCourseData[index], [field]: value };
    setFormData({ ...formData, courseData: updatedCourseData });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-text-light dark:text-text-dark">
        Create New Course
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive max-w-md">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">Error</AlertTitle>
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-text-light dark:text-text-dark">Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-text-light dark:text-text-dark">Course Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-text-light dark:text-text-dark">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-text-light dark:text-text-dark">Price</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                min={0}
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="estimatedPrice" className="text-text-light dark:text-text-dark">Estimated Price</Label>
              <Input
                id="estimatedPrice"
                type="number"
                value={formData.estimatedPrice}
                onChange={(e) => setFormData({ ...formData, estimatedPrice: Number(e.target.value) })}
                min={0}
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="thumbnail" className="text-text-light dark:text-text-dark">Thumbnail</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="tags" className="text-text-light dark:text-text-dark">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="level" className="text-text-light dark:text-text-dark">Level</Label>
              <Input
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                required
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="demoUrl" className="text-text-light dark:text-text-dark">Demo URL</Label>
              <Input
                id="demoUrl"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-text-light dark:text-text-dark">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <Label htmlFor="instructorName" className="text-text-light dark:text-text-dark">Instructor Name</Label>
              <Input
                id="instructorName"
                value={formData.instructor.name}
                onChange={(e) => setFormData({ ...formData, instructor: { name: e.target.value } })}
                required
                className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-text-light dark:text-text-dark">Course Content</h3>
              {formData.courseData.map((data, index) => (
                <div key={index} className="space-y-4 border-t pt-4">
                  <div>
                    <Label htmlFor={`content-title-${index}`} className="text-text-light dark:text-text-dark">Content Title</Label>
                    <Input
                      id={`content-title-${index}`}
                      value={data.title}
                      onChange={(e) => updateCourseData(index, 'title', e.target.value)}
                      required
                      className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`content-description-${index}`} className="text-text-light dark:text-text-dark">Content Description</Label>
                    <Textarea
                      id={`content-description-${index}`}
                      value={data.description}
                      onChange={(e) => updateCourseData(index, 'description', e.target.value)}
                      required
                      className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`content-videoUrl-${index}`} className="text-text-light dark:text-text-dark">Video URL</Label>
                    <Input
                      id={`content-videoUrl-${index}`}
                      value={data.videoUrl}
                      onChange={(e) => updateCourseData(index, 'videoUrl', e.target.value)}
                      required
                      className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`content-videoLength-${index}`} className="text-text-light dark:text-text-dark">Video Length (minutes)</Label>
                    <Input
                      id={`content-videoLength-${index}`}
                      type="number"
                      value={data.videoLength}
                      onChange={(e) => updateCourseData(index, 'videoLength', Number(e.target.value))}
                      required
                      min={0}
                      className="text-text-light dark:text-text-dark bg-background-light dark:bg-background-dark border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}