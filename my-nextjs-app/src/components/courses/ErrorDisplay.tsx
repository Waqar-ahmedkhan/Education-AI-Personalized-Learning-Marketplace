"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type CourseError = 
  | 'COURSE_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'ENROLLMENT_FAILED'
  | 'PAYMENT_FAILED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

interface CoursePageError {
  type: CourseError;
  message: string;
}

interface ErrorDisplayProps {
  error: CoursePageError;
  onRetry: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const getErrorIcon = () => {
    switch (error.type) {
      case 'COURSE_NOT_FOUND':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case 'UNAUTHORIZED':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      default:
        return <AlertCircle className="w-16 h-16 text-gray-500" />;
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-6`}
    >
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">{getErrorIcon()}</div>
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {error.message}
        </h2>
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className={`w-full px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              isDark ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            Try Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className={`w-full px-6 py-3 rounded-lg text-sm font-medium transition-all ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-lg'
            }`}
          >
            Go Back
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;