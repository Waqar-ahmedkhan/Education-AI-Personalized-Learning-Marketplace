
"use client";
import React from "react";
import { useTheme } from "next-themes";
import { Clock, BookOpen, Users, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Course } from "@/types/course";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 5 },
};

interface CourseStatsProps {
  course: Course;
  formatDuration: (duration: number) => string;
  renderStars: (rating: number) => React.ReactNode;
}

const CourseStats: React.FC<CourseStatsProps> = ({ course, formatDuration, renderStars }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const stats = [
    {
      icon: Clock,
      label: "Duration",
      value: formatDuration(course.duration),
      color: "from-blue-500 to-cyan-500",
      bgColor: isDark ? "bg-gradient-to-br from-blue-500/10 to-cyan-500/10" : "bg-gradient-to-br from-blue-50 to-cyan-50",
      borderColor: "border-blue-500/20",
    },
    {
      icon: BookOpen,
      label: "Lessons",
      value: course.courseData?.length || 0,
      color: "from-emerald-500 to-teal-500",
      bgColor: isDark ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10" : "bg-gradient-to-br from-emerald-50 to-teal-50",
      borderColor: "border-emerald-500/20",
    },
    {
      icon: Users,
      label: "Students",
      value: typeof course.purchased === "number" ? course.purchased.toLocaleString() : "0",
      color: "from-violet-500 to-purple-500",
      bgColor: isDark ? "bg-gradient-to-br from-violet-500/10 to-purple-500/10" : "bg-gradient-to-br from-violet-50 to-purple-50",
      borderColor: "border-violet-500/20",
    },
    {
      icon: Star,
      label: "Rating",
      value: `${course.rating}/5`,
      color: "from-amber-500 to-orange-500",
      bgColor: isDark ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10" : "bg-gradient-to-br from-amber-50 to-orange-50",
      borderColor: "border-amber-500/20",
      extra: <div className="flex gap-1 mt-2">{renderStars(course.rating)}</div>,
    },
  ];

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`relative rounded-3xl p-8 shadow-2xl backdrop-blur-xl border transition-all duration-300 hover:shadow-3xl ${
        isDark 
          ? "bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-gray-700/50" 
          : "bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
        >
          <TrendingUp className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Course Statistics
          </h2>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Performance metrics & insights
          </p>
        </div>
      </div>
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
              stat.bgColor
            } ${stat.borderColor} hover:border-opacity-40 hover:shadow-lg`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            <div className="relative z-10 flex items-start gap-4">
              <motion.div
                variants={iconVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </motion.div>
              <div className="flex-1">
                <p className={`text-sm font-medium mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {stat.value}
                </p>
                {stat.extra && stat.extra}
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </motion.div>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-b-3xl opacity-60" />
    </motion.div>
  );
};

export default CourseStats;
