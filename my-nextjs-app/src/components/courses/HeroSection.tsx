"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Users, Clock, CheckCircle, Star, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { Course } from "@/types/course";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -5, transition: { duration: 0.3 } },
};

const floatingAnimation = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
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
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`relative rounded-2xl p-6 lg:p-10 shadow-lg overflow-hidden border ${
        isDark
          ? "bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700/50"
          : "bg-gradient-to-br from-white/90 to-gray-100/90 border-gray-200/50"
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"
        />
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          style={{ animationDelay: "2s" }}
          className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl"
        />
        <motion.div
          variants={floatingAnimation}
          animate="animate"
          style={{ animationDelay: "4s" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {course.tags.map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border transition-all duration-300 ${
                    isDark
                      ? "bg-blue-900/30 text-blue-200 border-blue-700/50 hover:bg-blue-900/50"
                      : "bg-blue-50 text-blue-700 border-blue-200/50 hover:bg-blue-100"
                  }`}
                >
                  {tag}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: course.tags.length * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border transition-all duration-300 ${getLevelColor(
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
              className={`text-3xl lg:text-5xl font-extrabold mb-6 leading-tight ${
                isDark
                  ? "bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
              }`}
            >
              {course.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-lg lg:text-xl leading-relaxed mb-8 ${
                isDark ? "text-gray-400" : "text-gray-600"
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
                whileHover={{ scale: 1.03, y: -3 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70"
                    : "bg-white/50 border-gray-200/50 hover:bg-white/70"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="text-xl font-bold text-yellow-500">
                    {course.rating}
                  </span>
                  <div className="flex gap-1">{renderStars(course.rating)}</div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                    Rating
                  </p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    ({course.purchased.toLocaleString()} reviews)
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -3 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70"
                    : "bg-white/50 border-gray-200/50 hover:bg-white/70"
                }`}
              >
                <Users className={`w-6 h-6 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
                <div>
                  <p className={`text-xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    {course.purchased.toLocaleString()}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Students
                  </p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, y: -3 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70"
                    : "bg-white/50 border-gray-200/50 hover:bg-white/70"
                }`}
              >
                <Clock className={`w-6 h-6 ${isDark ? "text-green-400" : "text-green-600"}`} />
                <div>
                  <p className={`text-xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                    {formatDuration(course.duration)}
                  </p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    Duration
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {course.enrolled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.03 }}
                className={`flex items-center gap-6 p-6 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? "bg-green-900/30 border-green-700/50"
                    : "bg-green-50/80 border-green-200/50"
                }`}
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="flex-1">
                  <p className={`text-lg font-semibold ${isDark ? "text-green-300" : "text-green-700"}`}>
                    Enrolled Successfully!
                  </p>
                  <p className={`text-sm ${isDark ? "text-green-400" : "text-green-600"}`}>
                    Keep up the great progress!
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <span className={`text-2xl font-bold ${isDark ? "text-green-300" : "text-green-700"}`}>
                      {course.progress || 0}%
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? "text-green-400" : "text-green-600"}`}>
                    Completed
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