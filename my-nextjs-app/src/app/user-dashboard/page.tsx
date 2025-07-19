'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../lib/auth'
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Award, BookOpen, Search, Filter, X, Play, Star, TrendingUp, Zap, Trophy, Target } from 'lucide-react';

// Interfaces
interface Progress {
  percentage: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string | null;
}

interface Instructor {
  name: string;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  thumbnail: { url: string };
  category: string;
  instructor: Instructor;
  rating: number;
  purchased: number;
  duration: number;
  progress: Progress;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Enhanced Progress Bar Component
const ProgressBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="relative w-full h-3 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
    <motion.div
      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 shadow-lg relative"
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
    </motion.div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
  </div>
);

// Enhanced Floating Card Component
const FloatingCard: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ 
  children, 
  className = '', 
  delay = 0 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative backdrop-blur-xl bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-cyan-500/5 rounded-2xl" />
    {children}
  </motion.div>
);

// Enhanced Stats Card Component
const StatsCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  value: string; 
  subtitle?: string;
  color: string;
  index: number;
}> = ({ icon, title, value, subtitle, color, index }) => (
  <FloatingCard delay={index * 0.1} className="p-6 group">
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  </FloatingCard>
);

// Main Component
const UserDashboard: React.FC = () => {
  const { token, isAuthenticated, logout, setUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('name');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Compute unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(courses.map((course) => course.category));
    return ['all', ...Array.from(uniqueCategories).sort()];
  }, [courses]);

  // Compute enhanced stats
  const stats = useMemo(() => {
    const totalHours = courses.reduce((sum, course) => sum + course.duration, 0);
    const certificates = courses.filter((course) => course.progress.percentage === 100).length;
    const overallProgress =
      courses.length > 0
        ? (courses.reduce((sum, course) => sum + course.progress.percentage, 0) / courses.length).toFixed(1)
        : '0';
    const lastCourse = courses.reduce(
      (latest, course) =>
        !latest || (course.progress.lastAccessed && new Date(course.progress.lastAccessed) > new Date(latest.progress.lastAccessed || '')) ? course : latest,
      courses[0]
    );
    const inProgress = courses.filter(course => course.progress.percentage > 0 && course.progress.percentage < 100).length;
    const averageRating = courses.length > 0 ? (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1) : '0';
    
    return { totalHours, certificates, overallProgress, lastCourse, inProgress, averageRating };
  }, [courses]);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    if (searchQuery) {
      result = result.filter((course) =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((course) => course.category === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortOption === 'progress') return b.progress.percentage - a.progress.percentage;
      if (sortOption === 'rating') return b.rating - a.rating;
      if (sortOption === 'duration') return b.duration - a.duration;
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [courses, searchQuery, selectedCategory, sortOption]);

  // Fetch courses (same as original)
  useEffect(() => {
    if (!isAuthenticated || !token) {
      logout();
      return;
    }

    const fetchPurchasedCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<ApiResponse<Course[]>>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/get-purchased-courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setCourses(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch purchased courses');
        }
        setLoading(false);
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{ message?: string }>;
        if (axiosError.response?.status === 401) {
          try {
            const refreshResponse = await axios.get<ApiResponse<{ accessToken: string; user: any }>>(
              `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/refresh`,
              { withCredentials: true }
            );
            if (refreshResponse.data.success) {
              setUser(refreshResponse.data.data.user, refreshResponse.data.data.accessToken);
              const retryResponse = await axios.get<ApiResponse<Course[]>>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/get-purchased-courses`,
                {
                  headers: { Authorization: `Bearer ${refreshResponse.data.data.accessToken}` },
                  withCredentials: true,
                }
              );
              if (retryResponse.data.success) {
                setCourses(retryResponse.data.data);
              } else {
                setError(retryResponse.data.message || 'Failed to fetch purchased courses');
              }
            } else {
              logout();
            }
          } catch (refreshErr) {
            logout();
          }
        } else {
          setError(
            axiosError.response?.data?.message || 'Failed to load purchased courses'
          );
        }
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [token, isAuthenticated, logout, setUser]);

  // Enhanced skeleton loader
  const SkeletonCard: React.FC = () => (
    <div className="relative backdrop-blur-xl bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl overflow-hidden animate-pulse">
      <div className="w-full h-56 bg-gradient-to-br from-purple-200/30 via-pink-200/30 to-cyan-200/30 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-cyan-900/30" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg w-3/4" />
        <div className="h-4 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded w-full" />
        <div className="h-4 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded w-1/2" />
        <div className="h-3 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-full w-full" />
        <div className="h-12 bg-gradient-to-r from-gray-300/50 to-gray-400/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl w-full" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-cyan-900/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-12 bg-gradient-to-r from-purple-300/50 via-pink-300/50 to-cyan-300/50 dark:from-purple-700/50 dark:via-pink-700/50 dark:to-cyan-700/50 rounded-2xl w-1/3 mb-12 animate-pulse"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, index) => (
                <SkeletonCard key={index} />
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-cyan-900/20 flex justify-center items-center">
        <FloatingCard className="text-center p-8 max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oops!</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </FloatingCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-cyan-900/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full px-4 py-2 mb-4">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Learning Dashboard</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            My Learning Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Elevate your skills and unlock your potential with personalized learning experiences
          </p>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatsCard
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            title="Overall Progress"
            value={`${stats.overallProgress}%`}
            subtitle="Average completion"
            color="from-purple-500 to-purple-600"
            index={0}
          />
          <StatsCard
            icon={<Clock className="w-6 h-6 text-white" />}
            title="Learning Hours"
            value={`${stats.totalHours.toFixed(1)}`}
            subtitle="Total course duration"
            color="from-blue-500 to-blue-600"
            index={1}
          />
          <StatsCard
            icon={<Trophy className="w-6 h-6 text-white" />}
            title="Certificates"
            value={stats.certificates.toString()}
            subtitle="Courses completed"
            color="from-emerald-500 to-emerald-600"
            index={2}
          />
          <StatsCard
            icon={<Target className="w-6 h-6 text-white" />}
            title="In Progress"
            value={stats.inProgress.toString()}
            subtitle="Active learning"
            color="from-orange-500 to-orange-600"
            index={3}
          />
        </div>

        {/* Continue Learning Section */}
        {stats.lastCourse && stats.lastCourse.progress.lastAccessed && (
          <FloatingCard className="mb-12 p-8" delay={0.5}>
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
                  <Image
                    src={stats.lastCourse.thumbnail?.url || '/placeholder.jpg'}
                    alt={stats.lastCourse.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Continue Learning
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {stats.lastCourse.name}
                  </p>
                  <div className="w-48">
                    <ProgressBar percentage={stats.lastCourse.progress.percentage} />
                  </div>
                </div>
              </div>
              <Link href={`/course/${stats.lastCourse._id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Play className="w-5 h-5" />
                  <span>Resume Course</span>
                </motion.button>
              </Link>
            </div>
          </FloatingCard>
        )}

        {/* Enhanced Search and Filters */}
        <FloatingCard className="mb-8 p-6" delay={0.6}>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  showFilters
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
              {(searchQuery || selectedCategory !== 'all') && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </motion.button>
              )}
            </div>
          </div>
          
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort by
                    </label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300"
                    >
                      <option value="name">Name</option>
                      <option value="progress">Progress</option>
                      <option value="rating">Rating</option>
                      <option value="duration">Duration</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </FloatingCard>

        {/* Enhanced Courses Grid */}
        <AnimatePresence mode="wait">
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="empty-state"
            >
              <FloatingCard className="text-center p-12">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'No courses match your filters'
                    : 'Start Your Learning Journey'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'Discover amazing courses and start building new skills today.'}
                </p>
                <Link href="/courses">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Explore Courses
                  </motion.button>
                </Link>
              </FloatingCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="courses-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <FloatingCard className="h-full overflow-hidden">
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={course.thumbnail?.url || '/placeholder.jpg'}
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4 flex space-x-2">
                        {course.progress.percentage === 100 && (
                          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                            <Trophy className="w-3 h-3" />
                            <span>Complete</span>
                          </div>
                        )}
                        <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                          <ProgressBar percentage={course.progress.percentage} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="mb-4">
                        <span className="inline-block bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-medium mb-2">
                          {course.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                          {course.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                          {course.description}
                        </p>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Instructor</span>
                          <span className="font-medium text-gray-900 dark:text-white">{course.instructor.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Duration</span>
                          <span className="font-medium text-gray-900 dark:text-white">{course.duration.toFixed(1)} hrs</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {course.progress.completedLessons}/{course.progress.totalLessons} lessons
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Link href={`/course/${course._id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                          >
                            <Play className="w-4 h-4" />
                            <span>Continue Learning</span>
                          </motion.button>
                        </Link>
                        
                        {course.progress.percentage === 100 && (
                          <Link href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/download-certificate/${course._id}`}>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                              <Award className="w-4 h-4" />
                              <span>Download Certificate</span>
                            </motion.button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </FloatingCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Enhanced Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <FloatingCard className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to Learn More?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Discover new courses and expand your knowledge base
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/courses">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Browse Courses
                  </motion.button>
                </Link>
                <Link href="/profile">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/20 dark:bg-gray-800/20 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    View Profile
                  </motion.button>
                </Link>
              </div>
            </div>
          </FloatingCard>
        </motion.div>
        
        {/* Floating Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;