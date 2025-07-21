"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

const SkeletonCoursePage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4`}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-pulse space-y-8">
          <div className={`h-10 w-32 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`} />
          <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3 space-y-4">
                <div className="flex gap-2">
                  <div className={`h-6 w-16 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                  <div className={`h-6 w-20 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                </div>
                <div className={`h-8 w-3/4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                <div className={`h-4 w-full rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                <div className={`h-4 w-5/6 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              </div>
              <div className="md:w-1/3 space-y-4">
                <div className={`h-12 w-full rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
                <div className={`h-10 w-full rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3 space-y-6">
              <div className={`h-80 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`} />
              <div className={`h-64 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`} />
            </div>
            <div className="lg:w-1/3">
              <div className={`h-56 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkeletonCoursePage;