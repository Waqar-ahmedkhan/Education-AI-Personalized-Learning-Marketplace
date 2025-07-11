'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import axios, { AxiosError } from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

import BackButton from '@/components/courses/BackButton';
import HeroSection from '@/components/courses/HeroSection';
import CourseActionPanel from '@/components/courses/CourseActionPanel';
import VideoPlayer from '@/components/courses/VideoPlayer';
import Curriculum from '@/components/courses/Curriculum';
import Description from '@/components/courses/Description';
import InstructorInfo from '@/components/courses/InstructorInfo';
import CourseStats from '@/components/courses/CourseStats';
import CourseCategory from '@/components/courses/CourseCategory';
import SkeletonCoursePage from '@/components/courses/SkeletonCoursePage';
import ErrorDisplay from '@/components/courses/ErrorDisplay';

import {
  formatDuration,
  renderStars,
  getLevelColor as originalGetLevelColor,
} from '@/utils/courseUtils';

interface CourseInstructor {
  name: string;
  bio: string;
  avatar: string;
}

interface CourseThumbnail {
  public_id: string;
  url: string;
}

interface CourseData {
  title: string;
  description?: string;
  videoSection?: string;
  videoLength?: number;
  videoPlayer?: string;
  demoUrl?: string;
  isRequired: boolean;
  order: number;
  _id: string;
  completed?: boolean;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail: CourseThumbnail;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor: CourseInstructor;
  duration: number;
  category: string;
  rating: number;
  purchased: number;
  courseData?: CourseData[];
  demoUrl?: string;
  enrolled?: boolean;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  course?: T;
  message?: string;
}

type CourseError =
  | 'COURSE_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'ENROLLMENT_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

interface CoursePageError {
  type: CourseError;
  message: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const sectionVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const floatingElements = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export default function GetSingleCoursePage(): React.JSX.Element {
  const { token, isAdmin } = useAuth();
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CoursePageError | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isDark = resolvedTheme === 'dark';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  const courseId = useMemo(() => {
    if (typeof params.id === 'string') return params.id;
    if (Array.isArray(params.id)) return params.id[0];
    return '';
  }, [params.id]);

  const handleError = useCallback((err: unknown): CoursePageError => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      switch (axiosError.response?.status) {
        case 401:
          return { type: 'UNAUTHORIZED', message: 'Please log in to access this course' };
        case 404:
          return { type: 'COURSE_NOT_FOUND', message: 'Course not found' };
        case 403:
          return { type: 'UNAUTHORIZED', message: 'You are not authorized to access this course' };
        default:
          return { type: 'NETWORK_ERROR', message: 'Network error occurred' };
      }
    }
    return { type: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
  }, []);

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setError({ type: 'COURSE_NOT_FOUND', message: 'Invalid course ID' });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const courseRes = await axios.get<ApiResponse<Course>>(
        `${baseUrl}/api/v1/get-course/${courseId}`,
        { headers }
      );

      const receivedCourse = courseRes.data.data || courseRes.data.course;
      if (!receivedCourse) throw new Error('Course not found');

      let courseData: CourseData[] = [];
      if (token) {
        try {
          const contentRes = await axios.get<ApiResponse<{ courseData: CourseData[] }>>(
            `${baseUrl}/api/v1/get-course-content/${courseId}`,
            { headers }
          );
          courseData = (contentRes.data.data?.courseData || []).map(lesson => ({
            ...lesson,
            completed: lesson.completed ?? false, // Default to false if undefined
          }));
        } catch (contentErr) {
          console.warn('Failed to fetch course content:', contentErr);
          if (axios.isAxiosError(contentErr) && contentErr.response?.status === 404) {
            courseData = [];
          } else {
            throw contentErr;
          }
        }
      }

      const enrichedCourse: Course = {
        ...receivedCourse,
        thumbnail: receivedCourse.thumbnail?.url
          ? receivedCourse.thumbnail
          : { public_id: `fallback-${courseId}`, url: '/images/fallback-course.jpg' },
        instructor: {
          name: receivedCourse.instructor?.name || 'Unknown Instructor',
          bio: receivedCourse.instructor?.bio || 'No bio available',
          avatar: receivedCourse.instructor?.avatar || '/images/instructor-placeholder.jpg',
        },
        enrolled: courseData.length > 0,
        courseData,
        progress:
          courseData.length > 0
            ? (courseData.filter(l => l.completed).length / courseData.length) * 100
            : 0,
      };

      setCourse(enrichedCourse);

      // Set initial video
      if (enrichedCourse.demoUrl) {
        setActiveVideo(enrichedCourse.demoUrl);
      } else if (courseData[0]?.demoUrl) {
        setActiveVideo(courseData[0].demoUrl);
      }

      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('courseFavorites');
      if (savedFavorites) {
        try {
          const favorites = new Set<string>(JSON.parse(savedFavorites));
          setIsFavorite(favorites.has(enrichedCourse._id));
        } catch (e) {
          console.warn('Failed to parse favorites from localStorage');
        }
      }
    } catch (err) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
    }
  }, [courseId, token, baseUrl, handleError]);

  const toggleFavorite = useCallback(() => {
    if (!course) return;

    setIsFavorite(prev => !prev);

    try {
      const savedFavorites = localStorage.getItem('courseFavorites');
      const favorites = savedFavorites ? new Set<string>(JSON.parse(savedFavorites)) : new Set<string>();

      if (favorites.has(course._id)) {
        favorites.delete(course._id);
      } else {
        favorites.add(course._id);
      }

      localStorage.setItem('courseFavorites', JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.warn('Failed to update favorites in localStorage');
    }
  }, [course]);

  const handleEdit = useCallback(() => {
    if (course) {
      router.push(`/courses/edit/${course._id}`);
    }
  }, [course, router]);

  const handleDelete = useCallback(async () => {
    if (!course || !token) return;

    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(`${baseUrl}/api/v1/delete-course`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { courseId: course._id },
      });
      router.push('/courses');
    } catch (error) {
      setError({ type: 'UNKNOWN_ERROR', message: 'Failed to delete course' });
    } finally {
      setIsDeleting(false);
    }
  }, [course, token, router, baseUrl]);

  const handleEnrollSuccess = useCallback(() => {
    if (course) {
      setCourse(prev => (prev ? { ...prev, enrolled: true } : null));
      router.push(`/course/${course._id}/content`);
    }
  }, [course, router]);

  useEffect(() => {
    setMounted(true);
    fetchCourse();
  }, [fetchCourse]);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />;
  }

  if (isLoading) return <SkeletonCoursePage />;
  if (error || !course) {
    return (
      <ErrorDisplay
        error={error || { type: 'COURSE_NOT_FOUND', message: 'Course not found' }}
        onRetry={fetchCourse}
      />
    );
  }

  return (
    <div
      className={`min-h-screen relative transition-colors duration-500 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingElements}
          animate="animate"
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingElements}
          animate="animate"
          style={{ animationDelay: '2s' }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          variants={floatingElements}
          animate="animate"
          style={{ animationDelay: '4s' }}
          className="absolute top-1/2 right-1/4 w-60 h-60 bg-gradient-to-br from-pink-500/10 to-yellow-500/10 rounded-full blur-3xl"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={courseId}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative z-10 py-12 px-4 sm:px-6"
        >
          <motion.div
            variants={staggerContainer}
            animate="animate"
            className="max-w-7xl mx-auto space-y-12"
          >
            <motion.div variants={sectionVariants}>
              <BackButton aria-label="Back to courses" />
            </motion.div>

            <motion.div variants={sectionVariants}>
              <HeroSection
                course={course}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                renderStars={(rating) => renderStars(rating, isDark)}
                formatDuration={formatDuration}
                getLevelColor={(level) => originalGetLevelColor(level, isDark)}
              />
            </motion.div>

            <motion.div variants={sectionVariants}>
              <CourseActionPanel
                course={course}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                isEnrolling={isEnrolling}
                setIsEnrolling={setIsEnrolling}
                handleEnrollSuccess={handleEnrollSuccess}
                isAdmin={isAdmin}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                isDeleting={isDeleting}
                formatDuration={formatDuration}
              />
            </motion.div>

            <motion.div variants={sectionVariants} className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-2/3 space-y-12">
                <AnimatePresence mode="wait">
                  {course.demoUrl || (course.enrolled && course.courseData?.length) ? (
                    <motion.div
                      key="video-content"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-8"
                    >
                      <VideoPlayer activeVideo={activeVideo} course={course} />
                      {course.enrolled && course.courseData?.length ? (
                        <Curriculum
                          course={course}
                          activeVideo={activeVideo}
                          setActiveVideo={setActiveVideo}
                          expandedSection={expandedSection}
                          toggleSection={(id) =>
                            setExpandedSection((prev) => (prev === id ? null : id))
                          }
                          formatDuration={formatDuration}
                        />
                      ) : null}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="description-content"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Description course={course} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={sectionVariants} initial="initial" animate="animate">
                  <InstructorInfo instructor={course.instructor} />
                </motion.div>
              </div>

              <motion.div variants={sectionVariants} className="lg:w-1/3 space-y-8">
                <CourseStats
                  course={course}
                  formatDuration={formatDuration}
                  renderStars={(rating) => renderStars(rating, isDark)}
                />
                <CourseCategory category={course.category} />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
}