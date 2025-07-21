
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarButtonProps {
  starred: boolean | undefined;
  onClick: () => void;
}

const StarButton: React.FC<StarButtonProps> = ({ starred, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`p-1 ${starred ? 'text-yellow-400' : 'text-gray-400'}`}
  >
    <Star className={`w-5 h-5 ${starred ? 'fill-current' : ''}`} />
  </motion.button>
);

export default StarButton;