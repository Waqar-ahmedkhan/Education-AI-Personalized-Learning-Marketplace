"use client";

import React, { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Star, Clock, Users, Award, TrendingUp } from "lucide-react";

interface RecommendedCourse {
  id: string;
  name: string;
  thumbnail: string;
  rating: number;
  price: number;
  duration: number;
  level: string;
  category: string;
  studentsCount?: number;
  instructor?: string;
}

interface CourseRecommendationsProps {
  currentCourseId: string;
  name: string;
  category: string;
}

const fallbackRecommendations: RecommendedCourse[] = [
  {
    id: "1",
    name: "AI Basics for Beginners",
    thumbnail: "/images/ai-basics.jpg",
    rating: 4.3,
    price: 99,
    duration: 300,
    level: "Beginner",
    category: "AI & ML",
    studentsCount: 2547,
    instructor: "Dr. Sarah Chen",
  },
  {
    id: "4",
    name: "HTML, CSS & JS Starter Pack",
    thumbnail: "/images/web-basics.jpg",
    rating: 4.4,
    price: 79,
    duration: 240,
    level: "Beginner",
    category: "Web Development",
    studentsCount: 3892,
    instructor: "Mike Johnson",
  },
  {
    id: "21",
    name: "MDCAT Beginner Prep",
    thumbnail: "/images/mdcat-basics.jpg",
    rating: 4.4,
    price: 89,
    duration: 300,
    level: "Beginner",
    category: "MDCAT",
    studentsCount: 1234,
    instructor: "Prof. Ahmed Ali",
  },
];

// Utility functions
const renderStars = (rating: number, isDark: boolean): React.JSX.Element[] => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 fill-current ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} 
        />
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <div key={i} className="relative w-4 h-4">
          <Star className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`w-4 h-4 fill-current ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
          </div>
        </div>
      );
    } else {
      stars.push(
        <Star 
          key={i} 
          className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} 
        />
      );
    }
  }
  return stars;
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${mins}m`;
};

const getLevelColor = (level: string, isDark: boolean): string => {
  const colors = {
    beginner: isDark ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    intermediate: isDark ? 'bg-amber-900/20 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200',
    advanced: isDark ? 'bg-rose-900/20 text-rose-400 border-rose-500/30' : 'bg-rose-50 text-rose-700 border-rose-200',
  };
  
  return colors[level.toLowerCase() as keyof typeof colors] || colors.beginner;
};

// Simplified animation variants - more professional
const cardVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 20
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: { 
    y: -4,
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    } 
  },
};

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const getThemeClass = (isDark: boolean, darkClass: string, lightClass: string): string =>
  isDark ? darkClass : lightClass;

const CourseRecommendations: React.FC<CourseRecommendationsProps> = ({ 
  currentCourseId, 
  name, 
  category 
}) => {
  const { resolvedTheme } = useTheme();
  const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/v1/recommend-courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name,
            tags: category,
            top_n: 6,
            exclude_id: currentCourseId,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          const filteredRecommendations = result.data.filter(
            (course: RecommendedCourse) => course.id !== currentCourseId
          );
          setRecommendations(filteredRecommendations);
        } else {
          throw new Error(result.message || "Failed to fetch recommendations");
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError("Failed to load recommendations. Using fallback data.");
        setRecommendations(fallbackRecommendations.filter((course) => course.id !== currentCourseId));
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentCourseId, name, category]);

  if (loading) {
    return (
      <div className={`py-20 ${
        getThemeClass(
          isDark,
          "bg-gray-900",
          "bg-gray-50"
        )
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
              isDark ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className={`w-6 h-6 border-2 border-t-transparent rounded-full ${
                  isDark ? 'border-blue-400' : 'border-blue-600'
                }`}
              />
            </div>
            <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading recommendations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className={`py-20 ${
        getThemeClass(
          isDark,
          "bg-gray-900",
          "bg-gray-50"
        )
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <TrendingUp className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              No recommendations available
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
              {error || "We're working on finding great courses for you."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={`py-20 ${getThemeClass(
      isDark,
      "bg-gray-900",
      "bg-gray-50"
    )}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className={`text-3xl font-bold mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Recommended Courses
          </h2>
          <p className={`text-base max-w-2xl mx-auto ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Courses selected based on your interests and learning preferences
          </p>
        </motion.div>

        {/* Courses Grid */}
        <motion.div
          variants={staggerContainer}
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {recommendations.map((course) => (
            <motion.div
              key={course.id}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              className={`group relative rounded-xl overflow-hidden transition-all duration-200 ${getThemeClass(
                isDark,
                "bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl",
                "bg-white border border-gray-200 shadow-sm hover:shadow-lg"
              )}`}
            >
              <Link href={`/courses/${course.id}`} className="block">
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={course.thumbnail || "/images/default-course.jpg"}
                    alt={course.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Level Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      getLevelColor(course.level, isDark)
                    }`}>
                      <Award className="w-3 h-3 mr-1" />
                      {course.level}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold ${
                      isDark 
                        ? 'bg-gray-900/80 text-white border border-gray-700'
                        : 'bg-white/90 text-gray-900 border border-gray-200'
                    }`}>
                      ${course.price}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
                      isDark ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'
                    } transition-colors duration-200`}>
                      {course.name}
                    </h3>
                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {course.category}
                    </p>
                    {course.instructor && (
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        by {course.instructor}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                      {renderStars(course.rating, isDark)}
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {course.rating.toFixed(1)}
                    </span>
                    {course.studentsCount && (
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        ({course.studentsCount.toLocaleString()})
                      </span>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDuration(course.duration)}
                        </span>
                      </div>
                      {course.studentsCount && (
                        <div className="flex items-center gap-1">
                          <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {course.studentsCount > 1000 
                              ? `${(course.studentsCount / 1000).toFixed(1)}k`
                              : course.studentsCount.toString()
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CourseRecommendations;