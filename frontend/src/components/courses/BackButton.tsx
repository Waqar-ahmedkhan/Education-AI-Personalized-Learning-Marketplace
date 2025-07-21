"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const BackButton: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div variants={cardVariants}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => router.push('/courses')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 hover:shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
        } shadow-sm`}
        aria-label="Back to courses"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </motion.button>
    </motion.div>
  );
};

export default BackButton;