"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { useAuth } from "../../lib/auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  BookOpen,
  Search,
  Filter,
  X,
  Play,
  Star,
  TrendingUp,
  Zap,
  Trophy,
  RefreshCw,
} from "lucide-react";
import ProgressBar from "../../components/user-dashboard/ProgressBar";
import FloatingCard from "../../components/user-dashboard/FloatingCard";
import StatsCard from "../../components/user-dashboard/StatsCard";
import CertificateButton from "../../components/user-dashboard/CertificateButton";
import GamificationCard from "../../components/user-dashboard/Gemification";

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

interface Gamification {
  user: string;
  xp: number;
  badges: string[];
}

interface CourseData {
  _id: string;
  title: string;
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
  gamification: Gamification[];
  courseData: CourseData[];
  purchasedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Skeleton Card Component
const SkeletonCard: React.FC = () => (
  <div className="relative backdrop-blur-2xl bg-white/5 dark:bg-gray-900/5 border border-white/10 dark:border-gray-800/10 rounded-3xl shadow-lg overflow-hidden animate-pulse">
    <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-indigo-200/20 via-purple-200/20 to-pink-200/20 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      <div className="h-5 sm:h-6 bg-gradient-to-r from-gray-300/30 to-gray-400/30 dark:from-gray-700/30 dark:to-gray-600/30 rounded-lg w-3/4" />
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-300/30 to-gray-400/30 dark:from-gray-700/30 dark:to-gray-600/30 rounded w-full" />
      <div className="h-3 sm:h-4 bg-gradient-to-r from-gray-300/30 to-gray-400/30 dark:from-gray-700/30 dark:to-gray-600/30 rounded w-1/2" />
      <div className="h-2 sm:h-3 bg-gradient-to-r from-gray-300/30 to-gray-400/30 dark:from-gray-700/30 dark:to-gray-600/30 rounded-full w-full" />
      <div className="h-10 sm:h-12 bg-gradient-to-r from-gray-300/30 to-gray-400/30 dark:from-gray-700/30 dark:to-gray-600/30 rounded-xl w-full" />
    </div>
  </div>
);

const UserDashboard: React.FC = () => {
  const { token, isAuthenticated, logout, setUser, user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("purchasedAt");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Compute unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(courses.map((course) => course.category));
    return ["all", ...Array.from(uniqueCategories).sort()];
  }, [courses]);

  // Compute enhanced stats
  const stats = useMemo(() => {
    const totalHours = courses.reduce(
      (sum, course) => sum + course.duration,
      0
    );
    const certificates = courses.filter(
      (course) => course.progress.percentage === 100
    ).length;
    const overallProgress =
      courses.length > 0
        ? (
            courses.reduce(
              (sum, course) => sum + course.progress.percentage,
              0
            ) / courses.length
          ).toFixed(1)
        : "0";
    const lastCourse = courses.reduce(
      (latest, course) =>
        !latest ||
        (course.progress.lastAccessed &&
          new Date(course.progress.lastAccessed) >
            new Date(latest.progress.lastAccessed || ""))
          ? course
          : latest,
      courses[0]
    );
    const totalXP = courses.reduce((sum, course) => {
      const userGamification = course.gamification?.find(
        (g) => g.user === user?._id
      );
      return sum + (userGamification?.xp || 0);
    }, 0);

    return { totalHours, certificates, overallProgress, lastCourse, totalXP };
  }, [courses, user]);

  // Filter and sort courses
  const { filteredCourses, recentCourses } = useMemo(() => {
    let result = [...courses];

    if (searchQuery) {
      result = result.filter(
        (course) =>
          course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.instructor.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((course) => course.category === selectedCategory);
    }

    // Sort all courses
    result.sort((a, b) => {
      if (sortOption === "progress")
        return b.progress.percentage - a.progress.percentage;
      if (sortOption === "rating") return b.rating - a.rating;
      if (sortOption === "duration") return b.duration - a.duration;
      if (sortOption === "purchasedAt")
        return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime();
      return a.name.localeCompare(b.name);
    });

    // Get recent courses (last 3 purchased)
    const recentCourses = [...courses]
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())
      .slice(0, 3);

    return { filteredCourses: result, recentCourses };
  }, [courses, searchQuery, selectedCategory, sortOption]);

  // Fetch courses
  const fetchPurchasedCourses = async (forceRefresh: boolean = false) => {
    if (!isAuthenticated || !token) {
      logout();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse<Course[]>>(
        `http://localhost:8080/api/v1/get-purchased-courses${
          forceRefresh ? "?refresh=true" : ""
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setCourses(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch purchased courses");
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      if (axiosError.response?.status === 401) {
        try {
          const refreshResponse = await axios.get<
            ApiResponse<{ accessToken: string; user: any }>
          >(`http://localhost:8080/api/v1/user/refresh`, {
            withCredentials: true,
          });
          if (refreshResponse.data.success) {
            setUser(
              refreshResponse.data.data.user,
              refreshResponse.data.data.accessToken
            );
            const retryResponse = await axios.get<ApiResponse<Course[]>>(
              `http://localhost:8080/api/v1/get-purchased-courses${
                forceRefresh ? "?refresh=true" : ""
              }`,
              {
                headers: {
                  Authorization: `Bearer ${refreshResponse.data.data.accessToken}`,
                },
                withCredentials: true,
              }
            );
            if (retryResponse.data.success) {
              setCourses(retryResponse.data.data);
            } else {
              setError(
                retryResponse.data.message ||
                  "Failed to fetch purchased courses"
              );
            }
          } else {
            logout();
          }
        } catch (refreshErr) {
          logout();
        }
      } else {
        setError(
          axiosError.response?.data?.message ||
            "Failed to load purchased courses"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasedCourses();
  }, [token, isAuthenticated, logout, setUser, refreshTrigger]);

  // Handle course purchase
  const handlePurchaseCourse = async (courseId: string) => {
    if (!token) return;
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/purchase-course`,
        { courseId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        const courseResponse = await axios.get<ApiResponse<Course>>(
          `http://localhost:8080/api/v1/courses/${courseId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        if (courseResponse.data.success) {
          setCourses((prev) => [
            {
              ...courseResponse.data.data,
              progress: {
                percentage: 0,
                completedLessons: 0,
                totalLessons: courseResponse.data.data.courseData.length,
                lastAccessed: null,
              },
              gamification: [{ user: user!._id, xp: 0, badges: [] }],
              purchasedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to purchase course:", err);
      setError("Failed to purchase course");
    }
  };

  // Track progress and add XP
  const handleTrackProgress = async (courseId: string, contentId: string) => {
    if (!token) return;
    try {
      const progressResponse = await axios.post(
        `http://localhost:8080/api/v1/track-progress`,
        { courseId, contentId },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (progressResponse.data.success) {
        setCourses((prevCourses) =>
          prevCourses.map((course) => {
            if (course._id === courseId) {
              const newCompletedLessons = course.progress.completedLessons + 1;
              return {
                ...course,
                progress: {
                  ...course.progress,
                  completedLessons: newCompletedLessons_DB(),
                  percentage: Math.min(
                    (newCompletedLessons / course.progress.totalLessons) * 100,
                    100
                  ),
                  lastAccessed: new Date().toISOString(),
                },
              };
            }
            return course;
          })
        );

        await axios.post(
          `http://localhost:8080/api/v1/add-xp`,
          { courseId, xp: 10 },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
      }
    } catch (err) {
      console.error("Failed to track progress or add XP:", err);
      setError("Failed to track progress");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-pink-900/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-12 bg-gradient-to-r from-indigo-300/30 via-purple-300/30 to-pink-300/30 dark:from-indigo-700/30 dark:via-purple-700/30 dark:to-pink-700/30 rounded-3xl w-full sm:w-1/3 mb-8 animate-pulse"
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-pink-900/20 flex justify-center items-center px-4">
        <FloatingCard className="text-center p-6 max-w-md w-full">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Oops!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              {error}
            </p>
          </div>
          <button
            onClick={() => fetchPurchasedCourses(true)}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-base"
          >
            Try Again
          </button>
        </FloatingCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-pink-900/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full px-3 py-1.5 mb-4">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Learning Dashboard
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            My Learning Hub
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Elevate your skills and unlock your potential with personalized
            learning experiences
          </p>
        </motion.div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fetchPurchasedCourses(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Courses</span>
          </motion.button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            title="Overall Progress"
            value={`${stats.overallProgress}%`}
            subtitle="Average completion"
            color="from-indigo-600 to-indigo-700"
            index={0}
          />
          <StatsCard
            icon={<Clock className="w-5 h-5 text-white" />}
            title="Learning Hours"
            value={`${stats.totalHours.toFixed(1)}`}
            subtitle="Total course duration"
            color="from-blue-600 to-blue-700"
            index={1}
          />
          <StatsCard
            icon={<Trophy className="w-5 h-5 text-white" />}
            title="Certificates"
            value={stats.certificates.toString()}
            subtitle="Courses completed"
            color="from-emerald-600 to-emerald-700"
            index={2}
          />
          <GamificationCard
            xp={stats.totalXP}
            badges={courses.flatMap(
              (course) =>
                course.gamification?.find((g) => g.user === user?._id)
                  ?.badges || []
            )}
            index={3}
          />
        </div>

        {/* Recently Purchased Section */}
        {recentCourses.length > 0 && (
          <FloatingCard className="mb-8" delay={0.4}>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Recently Purchased
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group"
                >
                  <FloatingCard className="h-full overflow-hidden">
                    <div className="relative h-32 sm:h-40 overflow-hidden">
                      <Image
                        src={course.thumbnail?.url || "/placeholder.jpg"}
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        {course.progress.percentage === 100 && (
                          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                            <Trophy className="w-3 h-3" />
                            <span>Complete</span>
                          </div>
                        )}
                        <div className="bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <span className="inline-block bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full text-xs font-medium mb-2">
                        {course.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {course.name}
                      </h3>
                      <div className="mb-4">
                        <ProgressBar percentage={course.progress.percentage} />
                      </div>
                      <Link href={`/courses/${course._id}/content`}>
                        <motion.button
                          onClick={() =>
                            handleTrackProgress(
                              course._id,
                              course.courseData[0]?._id || "first-content"
                            )
                          }
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-base"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start Learning</span>
                        </motion.button>
                      </Link>
                    </div>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </FloatingCard>
        )}

        {/* Continue Learning Section */}
        {stats.lastCourse && stats.lastCourse.progress.lastAccessed && (
          <FloatingCard className="mb-8" delay={0.5}>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 p-4">
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                  <Image
                    src={stats.lastCourse.thumbnail?.url || "/placeholder.jpg"}
                    alt={stats.lastCourse.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Continue Learning
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                    {stats.lastCourse.name}
                  </p>
                  <div className="w-full max-w-[12rem]">
                    <ProgressBar
                      percentage={stats.lastCourse.progress.percentage}
                    />
                  </div>
                </div>
              </div>
              <Link href={`/courses/${stats.lastCourse._id}/content`}>
                <motion.button
                  onClick={() =>
                    handleTrackProgress(
                      stats.lastCourse._id,
                      stats.lastCourse.courseData[0]?._id || "first-content"
                    )
                  }
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-base"
                >
                  <Play className="w-4 h-4" />
                  <span>Resume Course</span>
                </motion.button>
              </Link>
            </div>
          </FloatingCard>
        )}

        {/* Search and Filters */}
        <FloatingCard className="mb-8" delay={0.6}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 dark:bg-gray-900/10 border border-gray-200/10 dark:border-gray-800/10 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 backdrop-blur-md text-sm"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm ${
                  showFilters
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "bg-white/10 dark:bg-gray-900/10 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-900/20"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              {(searchQuery || selectedCategory !== "all") && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 transition-all duration-300 text-sm"
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
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200/10 dark:border-gray-800/10"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 dark:bg-gray-900/10 border border-gray-200/10 dark:border-gray-800/10 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
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
                      className="w-full px-3 py-2 bg-white/10 dark:bg-gray-900/10 border border-gray-200/10 dark:border-gray-800/10 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 text-sm"
                    >
                      <option value="purchasedAt">Recently Purchased</option>
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

        {/* Courses Grid */}
        <AnimatePresence mode="wait">
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key="empty-state"
            >
              <FloatingCard className="text-center p-6 md:p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {searchQuery || selectedCategory !== "all"
                    ? "No courses match your filters"
                    : "Start Your Learning Journey"}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Discover amazing courses and start building new skills today."}
                </p>
                <Link href="/courses">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-base"
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  className="group"
                >
                  <FloatingCard className="h-full overflow-hidden">
                    <div className="relative h-40 sm:h-48 overflow-hidden">
                      <Image
                        src={course.thumbnail?.url || "/placeholder.jpg"}
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 flex space-x-2">
                        {course.progress.percentage === 100 && (
                          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                            <Trophy className="w-3 h-3" />
                            <span>Complete</span>
                          </div>
                        )}
                        <div className="bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-black/50 backdrop-blur-md rounded-lg p-1.5">
                          <ProgressBar
                            percentage={course.progress.percentage}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="mb-4">
                        <span className="inline-block bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full text-xs font-medium mb-2">
                          {course.category}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                          {course.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                          {course.description}
                        </p>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Instructor
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {course.instructor.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Duration
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {course.duration.toFixed(1)} hrs
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            Progress
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {course.progress.completedLessons}/
                            {course.progress.totalLessons} lessons
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            XP
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {course.gamification?.find(
                              (g) => g.user === user?._id
                            )?.xp || 0}{" "}
                            XP
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link href={`/courses/${course._id}/content`}>
                          <motion.button
                            onClick={() =>
                              handleTrackProgress(
                                course._id,
                                course.courseData[0]?._id || "first-content"
                              )
                            }
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-base"
                          >
                            <Play className="w-4 h-4" />
                            <span>Continue Learning</span>
                          </motion.button>
                        </Link>

                        {course.progress.percentage === 100 && (
                          <CertificateButton courseId={course._id} />
                        )}
                      </div>
                    </div>
                  </FloatingCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 text-center"
        >
          <FloatingCard className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="text-left">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to Learn More?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover new courses and expand your knowledge base
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <Link href="/courses">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg text-base"
                  >
                    Browse Courses
                  </motion.button>
                </Link>
                <Link href="/profile">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full sm:w-auto px-6 py-2.5 bg-white/10 dark:bg-gray-900/10 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-white/20 dark:hover:bg-gray-900/20 transition-all duration-300 border border-gray-200/10 dark:border-gray-800/10 text-base"
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
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;