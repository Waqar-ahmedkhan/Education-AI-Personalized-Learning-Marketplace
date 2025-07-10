"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { Clock, BookOpen, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from './GetSingleCoursePage';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface CourseStatsProps {
  course: Course;
  formatDuration: (duration: number) => string;
  renderStars: (rating: number) => JSX.Element[];
}

const CourseStats: React.FC<CourseStatsProps> = ({ course, formatDuration, renderStars }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`rounded-2xl p-6 shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
    >
      <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Statistics</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Duration</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {formatDuration(course.duration)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-green-600' : 'bg-green-500'}`}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Lessons</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {course.courseData?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-600' : 'bg-purple-500'}`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Students</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {course.purchased.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'}`}>
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Rating</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {course.rating}/5
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseStats;