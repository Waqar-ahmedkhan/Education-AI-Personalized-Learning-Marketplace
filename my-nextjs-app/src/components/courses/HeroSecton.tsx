"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { Star, Users, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from './GetSingleCoursePage';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -2, transition: { duration: 0.2 } },
};

interface HeroSectionProps {
  course: Course;
  isFavorite: boolean;
  toggleFavorite: () => void;
  renderStars: (rating: number) => JSX.Element[];
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
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`relative rounded-2xl p-8 shadow-xl transition-all ${
        isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="flex items-center gap-3 mb-4">
            {course.tags.map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDark ? 'bg-blue-600 text-blue-100' : 'bg-blue-500 text-white'
                }`}
              >
                {tag}
              </motion.span>
            ))}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: course.tags.length * 0.1 }}
              className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}
            >
              {course.level}
            </motion.span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            id="course-title"
            className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {course.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {course.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
          >
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-yellow-500">{course.rating}</span>
                <div className="flex gap-1">{renderStars(course.rating)}</div>
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                ({course.purchased.toLocaleString()} reviews)
              </span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
              <Users className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {course.purchased.toLocaleString()} enrolled
              </span>
            </div>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white/50'}`}>
              <Clock className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {formatDuration(course.duration)}
              </span>
            </div>
          </motion.div>
          {course.enrolled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`flex items-center gap-3 p-4 rounded-lg ${
                isDark ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
              }`}
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>Enrolled Successfully!</p>
                <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-500'}`}>
                  Progress: {course.progress || 0}% complete
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HeroSection;