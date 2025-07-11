"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Users, Clock, CheckCircle, Star, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { Course } from "@/types/course";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -2, transition: { duration: 0.2 } },
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

interface HeroSectionProps {
  course: Course;
  isFavorite: boolean;
  toggleFavorite: () => void;
  renderStars: (rating: number) => React.JSX.Element[];
  formatDuration: (duration: number) => string;
  getLevelColor: (level: string) => string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  course,
  renderStars,
  formatDuration,
  getLevelColor,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`relative rounded-3xl p-8 shadow-2xl transition-all duration-300 overflow-hidden ${
        isDark
          ? "bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 border border-gray-700/50"
          : "bg-gradient-to-br from-white/90 via-gray-50/90 to-gray-100/90 border border-gray-200/50"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
        />
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full blur-xl"
        />
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          style={{ animationDelay: "4s" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-pink-500/20 to-yellow-500/20 rounded-full blur-xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <div className="flex items-center gap-3 mb-6">
              {course.tags.map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border transition-all duration-300 ${
                    isDark 
                      ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-blue-300 border-blue-500/30 hover:from-blue-600/50 hover:to-purple-600/50" 
                      : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-blue-300/50 hover:from-blue-500/30 hover:to-purple-500/30"
                  }`}
                >
                  {tag}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: course.tags.length * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border transition-all duration-300 ${getLevelColor(
                  course.level
                )}`}
              >
                <Award className="w-4 h-4 inline mr-1" />
                {course.level}
              </motion.span>
            </div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              id="course-title"
              className={`text-4xl md:text-6xl font-bold mb-6 leading-tight ${
                isDark 
                  ? "bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent" 
                  : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent"
              }`}
            >
              {course.name}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-xl leading-relaxed mb-8 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {course.description}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className={`flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                  isDark 
                    ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:from-gray-800/70 hover:to-gray-900/70" 
                    : "bg-gradient-to-br from-white/50 to-gray-50/50 border-gray-200/50 hover:from-white/70 hover:to-gray-50/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-yellow-500">
                    {course.rating}
                  </span>
                  <div className="flex gap-1">{renderStars(course.rating)}</div>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Rating
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    ({course.purchased.toLocaleString()} reviews)
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className={`flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                  isDark 
                    ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:from-gray-800/70 hover:to-gray-900/70" 
                    : "bg-gradient-to-br from-white/50 to-gray-50/50 border-gray-200/50 hover:from-white/70 hover:to-gray-50/70"
                }`}
              >
                <Users className={`w-8 h-8 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                <div className="text-left">
                  <p className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    {course.purchased.toLocaleString()}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Students Enrolled
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className={`flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                  isDark 
                    ? "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 hover:from-gray-800/70 hover:to-gray-900/70" 
                    : "bg-gradient-to-br from-white/50 to-gray-50/50 border-gray-200/50 hover:from-white/70 hover:to-gray-50/70"
                }`}
              >
                <Clock className={`w-8 h-8 ${isDark ? "text-green-400" : "text-green-600"}`} />
                <div className="text-left">
                  <p className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    {formatDuration(course.duration)}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Total Duration
                  </p>
                </div>
              </motion.div>
            </motion.div>
            
            {course.enrolled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-4 p-6 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                  isDark
                    ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-700/50"
                    : "bg-gradient-to-br from-green-50/80 to-emerald-50/80 border-green-200/50"
                }`}
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="flex-1">
                  <p className={`text-lg font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>
                    Enrolled Successfully!
                  </p>
                  <p className={`text-sm ${isDark ? "text-green-300" : "text-green-500"}`}>
                    You&apos;re making great progress
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className={`text-2xl font-bold ${isDark ? "text-green-400" : "text-green-600"}`}>
                      {course.progress || 0}%
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? "text-green-300" : "text-green-500"}`}>
                    Complete
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;