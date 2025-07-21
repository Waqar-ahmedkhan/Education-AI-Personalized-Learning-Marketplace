"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '@/types/course';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface LessonNavigationProps {
  course: Course;
  activeVideo: string | null;
  handleNextLesson: () => void;
  handlePreviousLesson: () => void;
  handleMarkComplete: (lessonOrder: number) => void;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  course,
  activeVideo,
  handleNextLesson,
  handlePreviousLesson,
  handleMarkComplete,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const currentLessonIndex = course.courseData?.findIndex(lesson => lesson.videoUrl === activeVideo) || 0;
  const currentLesson = course.courseData?.[currentLessonIndex];
  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === (course.courseData?.length || 1) - 1;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`flex items-center justify-between p-4 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-xl`}
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePreviousLesson}
        disabled={isFirstLesson}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isFirstLesson
            ? isDark
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : isDark
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
        }`}
        aria-label="Previous lesson"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => currentLesson && handleMarkComplete(currentLesson.order)}
        disabled={currentLesson?.completed}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          currentLesson?.completed
            ? isDark
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : isDark
            ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
            : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg'
        }`}
        aria-label={currentLesson?.completed ? 'Lesson completed' : 'Mark lesson as completed'}
      >
        <CheckCircle className="w-4 h-4" />
        {currentLesson?.completed ? 'Completed' : 'Mark Complete'}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNextLesson}
        disabled={isLastLesson}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isLastLesson
            ? isDark
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : isDark
            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
        }`}
        aria-label="Next lesson"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};

export default LessonNavigation;