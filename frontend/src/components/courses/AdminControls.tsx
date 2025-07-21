"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { Edit, Trash, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminControlsProps {
  courseId: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const AdminControls: React.FC<AdminControlsProps> = ({ onEdit, onDelete, isDeleting = false }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex gap-3 mt-6">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onEdit}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isDark ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
        }`}
        aria-label="Edit course"
      >
        <Edit className="w-4 h-4" />
        Edit Course
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDelete}
        disabled={isDeleting}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          isDark
            ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg disabled:opacity-50'
            : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg disabled:opacity-50'
        }`}
        aria-label="Delete course"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
        {isDeleting ? 'Deleting...' : 'Delete Course'}
      </motion.button>
    </motion.div>
  );
};

export default AdminControls;