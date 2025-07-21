import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ 
  children, 
  className = '', 
  delay = 0 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    whileHover={{ y: -8, scale: 1.03 }}
    className={`relative backdrop-blur-2xl bg-white/5 dark:bg-gray-900/5 border border-white/10 dark:border-gray-800/10 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 md:p-8 ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent rounded-3xl" />
    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl" />
    {children}
  </motion.div>
);

export default FloatingCard;