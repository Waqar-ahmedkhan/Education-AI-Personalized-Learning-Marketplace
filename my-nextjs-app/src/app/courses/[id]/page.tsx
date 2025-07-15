'use client';

import React, { useReducer, useEffect, useCallback, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { motion, AnimatePresence, Variants } from 'framer-motion';

import BackButton from '@/components/courses/BackButton';
import HeroSection from '@/components/courses/HeroSection';
import VideoPlayer from '@/components/courses/VideoPlayer';
import Curriculum from '@/components/courses/Curriculum';
import Description from '@/components/courses/Description';
import InstructorInfo from '@/components/courses/InstructorInfo';
import CourseStats from '@/components/courses/CourseStats';
import CourseCategory from '@/components/courses/CourseCategory';
import SkeletonCoursePage from '@/components/courses/SkeletonCoursePage';
import ErrorDisplay from '@/components/courses/ErrorDisplay';
import CourseActionPanel from '@/components/courses/CourseActionPanel';

import {
  formatDuration,
  renderStars,
  getLevelColor as originalGetLevelColor,
} from '@/utils/courseUtils';

// Type definitions
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

// State management with useReducer
interface CourseState {
  course: Course | null;
  isLoading: boolean;
  error: CoursePageError | null;
}

type CourseAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Course }
  | { type: 'FETCH_ERROR'; payload: CoursePageError }
  | { type: 'SET_ENROLLED' };

const initialState: CourseState = {
  course: null,
  isLoading: true,
  error: null,
};

const courseReducer = (state: CourseState, action: CourseAction): CourseState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, course: action.payload, error: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_ENROLLED':
      return {
        ...state,
        course: state.course ? { ...state.course, enrolled: true } : null,
      };
    default:
      return state;
  }
};

// Animation variants
const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const sectionVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const floatingElements: Variants = {
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

// Utility for dynamic class names
const getThemeClass = (isDark: boolean, darkClass: string, lightClass: string): string =>
  isDark ? darkClass : lightClass;

// Component
const GetSingleCoursePage: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const router = useRouter();

  // State management
  const [state, dispatch] = useReducer(courseReducer, initialState);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Computed values
  const isDark = useMemo(() => resolvedTheme === 'dark', [resolvedTheme]);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  const courseId = useMemo(() => {
    const id = params?.id;
    return typeof id === 'string' ? id : Array.isArray(id) ? id[0] || '' : '';
  }, [params?.id]);

  // Error handler
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

  // Fetch course data
  const fetchCourse = useCallback(async (): Promise<void> => {
    if (!courseId) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: { type: 'COURSE_NOT_FOUND', message: 'Invalid course ID' },
      });
      return;
    }

    dispatch({ type: 'FETCH_START' });

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const courseRes: AxiosResponse<ApiResponse<Course>> = await axios.get(
        `${baseUrl}/api/v1/get-course/${courseId}`,
        { headers }
      );

      const receivedCourse = courseRes.data.data || courseRes.data.course;
      if (!receivedCourse) {
        throw new Error('Course not found');
      }

      let courseData: CourseData[] = [];
      if (token) {
        try {
          const contentRes: AxiosResponse<ApiResponse<{ courseData: CourseData[] }>> = await axios.get(
            `${baseUrl}/api/v1/get-course-content/${courseId}`,
            { headers }
          );
          courseData = (contentRes.data.data?.courseData || []).map((lesson) => ({
            ...lesson,
            completed: lesson.completed ?? false,
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
            ? (courseData.filter((l) => l.completed).length / courseData.length) * 100
            : 0,
      };

      dispatch({ type: 'FETCH_SUCCESS', payload: enrichedCourse });

      // Set initial video
      if (enrichedCourse.demoUrl) {
        setActiveVideo(enrichedCourse.demoUrl);
      } else if (courseData[0]?.demoUrl) {
        setActiveVideo(courseData[0].demoUrl);
      }

      // Load favorites from localStorage
      try {
        const savedFavorites = localStorage.getItem('courseFavorites');
        if (savedFavorites) {
          const favorites = new Set<string>(JSON.parse(savedFavorites));
          setIsFavorite(favorites.has(enrichedCourse._id));
        }
      } catch (e) {
        console.warn('Failed to parse favorites from localStorage:', e);
      }
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: handleError(err) });
    }
  }, [courseId, token, baseUrl, handleError]);

  // Toggle favorite
  const toggleFavorite = useCallback((): void => {
    if (!state.course) return;

    setIsFavorite((prev) => !prev);

    try {
      const savedFavorites = localStorage.getItem('courseFavorites');
      const favorites = savedFavorites
        ? new Set<string>(JSON.parse(savedFavorites))
        : new Set<string>();

      if (favorites.has(state.course._id)) {
        favorites.delete(state.course._id);
      } else {
        favorites.add(state.course._id);
      }

      localStorage.setItem('courseFavorites', JSON.stringify(Array.from(favorites)));
    } catch (error) {
      console.warn('Failed to update favorites in localStorage:', error);
    }
  }, [state.course]);

  // Handle edit
  const handleEdit = useCallback((): void => {
    if (state.course) {
      router.push(`/courses/edit/${state.course._id}`);
    }
  }, [state.course, router]);

  // Handle delete
  const handleDelete = useCallback(async (): Promise<void> => {
    if (!state.course || !token) return;

    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(`${baseUrl}/api/v1/delete-course`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { courseId: state.course._id },
      });
      router.push('/courses');
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: { type: 'UNKNOWN_ERROR', message: 'Failed to delete course' } });
    } finally {
      setIsDeleting(false);
    }
  }, [state.course, token, router, baseUrl]);

  // Handle enrollment success
  const handleEnrollSuccess = useCallback((): void => {
    if (state.course) {
      dispatch({ type: 'SET_ENROLLED' });
      router.push(`/course/${state.course._id}/content`);
    }
  }, [state.course, router]);

  // Effects
  useEffect(() => {
    setMounted(true);
    fetchCourse();
  }, [fetchCourse]);

  // Render conditions
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />
    );
  }

  if (state.isLoading) {
    return <SkeletonCoursePage />;
  }

  if (state.error || !state.course) {
    return (
      <ErrorDisplay
        error={state.error || { type: 'COURSE_NOT_FOUND', message: 'Course not found' }}
        onRetry={fetchCourse}
      />
    );
  }

  // Main render
  return (
    <div
      className={`min-h-screen relative transition-colors duration-500 ${getThemeClass(
        isDark,
        'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
        'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      )}`}
    >
      {/* Background floating elements */}
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
          className="relative z-10 py-6"
        >
          <motion.div
            variants={staggerContainer}
            animate="animate"
            className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8"
          >
            {/* Navigation */}
            <motion.div variants={sectionVariants} className="mb-6">
              <BackButton aria-label="Back to courses" />
            </motion.div>

            {/* Hero Section */}
            <motion.div variants={sectionVariants} className="mb-8">
              <HeroSection
                course={state.course}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                renderStars={(rating: number) => renderStars(rating)}
                formatDuration={formatDuration}
                getLevelColor={(level: Course['level']) => originalGetLevelColor(level, isDark)}
              />
            </motion.div>

            {/* Main Content Grid - Improved Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left Side: Video and Course Content */}
              <div className="xl:col-span-8 space-y-8">
                {/* Video Player */}
                <motion.div variants={sectionVariants}>
                  <VideoPlayer activeVideo={activeVideo} course={state.course} />
                </motion.div>

                {/* Content Section */}
                <AnimatePresence mode="wait">
                  {state.course.enrolled && state.course.courseData?.length ? (
                    <motion.div
                      key="curriculum-content"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      variants={sectionVariants}
                      className="min-h-[400px]"
                    >
                      <Curriculum
                        course={state.course}
                        activeVideo={activeVideo}
                        setActiveVideo={setActiveVideo}
                        expandedSection={null}
                        toggleSection={(id: string) => setActiveVideo(id)}
                        formatDuration={formatDuration}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="description-content"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      variants={sectionVariants}
                      className="min-h-[400px]"
                    >
                      <Description course={state.course} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Side: Action Panel - Fixed Width and Better Layout */}
              <div className="xl:col-span-4">
                <motion.div
                  variants={sectionVariants}
                  className="sticky top-6"
                >
                  <div
                    className={`w-full min-h-[600px] ${getThemeClass(
                      isDark,
                      'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border border-gray-700/50 shadow-2xl shadow-gray-900/20',
                      'bg-gradient-to-br from-white/95 to-gray-50/95 border border-gray-200/50 shadow-2xl shadow-gray-900/10'
                    )} rounded-2xl backdrop-blur-sm`}
                  >
                    <div className="p-6 h-full">
                      <CourseActionPanel
                        course={state.course}
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
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Additional Course Information - Mobile/Tablet Friendly */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div variants={sectionVariants}>
                <InstructorInfo instructor={state.course.instructor} />
              </motion.div>
              
              <motion.div variants={sectionVariants}>
                <CourseStats
                  course={state.course}
                  formatDuration={formatDuration}
                  renderStars={renderStars}
                />
              </motion.div>
              
              <motion.div variants={sectionVariants}>
                <CourseCategory
                  category={state.course.category}
                  tags={state.course.tags}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.section>
      </AnimatePresence>
    </div>
  );
};

export default GetSingleCoursePage;