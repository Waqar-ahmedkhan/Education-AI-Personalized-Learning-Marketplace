"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Course } from './GetSingleCoursePage';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface DescriptionProps {
  course: Course;
}

const Description: React.FC<DescriptionProps> = ({ course }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`rounded-2xl p-8 shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
    >
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>About This Course</h2>
      <div className="relative w-full aspect-[16/9] mb-6">
        <Image
          src={course.thumbnail.url}
          alt={course.name || 'Course thumbnail'}
          fill
          className="object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = '/images/fallback-course.jpg';
          }}
        />
      </div>
      <div className={`prose ${isDark ? 'prose-invert' : 'prose-gray'} max-w-none`}>
        <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {course.description}
        </p>
      </div>
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
        <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🎯 What You'll Learn
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Enroll now to access the complete course curriculum and start your learning journey!
        </p>
      </div>
    </motion.div>
  );
};

export default Description;