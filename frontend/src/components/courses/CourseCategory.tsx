"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface CourseCategoryProps {
  category: string;
}

const CourseCategory: React.FC<CourseCategoryProps> = ({ category }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`rounded-2xl p-6 shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
    >
      <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Category</h2>
      <span
        className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
          isDark ? 'bg-blue-600 text-blue-100' : 'bg-blue-500 text-white'
        }`}
      >
        {category}
      </span>
    </motion.div>
  );
};

export default CourseCategory;