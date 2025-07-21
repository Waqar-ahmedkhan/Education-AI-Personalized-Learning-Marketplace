import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  percentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => (
  <div className="relative w-full h-4 bg-gray-200/30 dark:bg-gray-800/30 rounded-full overflow-hidden backdrop-blur-md shadow-sm">
    <motion.div
      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-md relative"
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
    </motion.div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
  </div>
);

export default ProgressBar;