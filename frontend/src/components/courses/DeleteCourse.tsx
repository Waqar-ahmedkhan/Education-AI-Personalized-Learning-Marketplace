"use client";
import React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface DeleteCourseProps {
  courseId: string;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeleteCourse: React.FC<DeleteCourseProps> = ({onDelete, isDeleting }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onDelete}
      disabled={isDeleting}
      className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-md ${
        isDeleting
          ? isDark
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
          : isDark
          ? "bg-red-600 text-white hover:bg-red-700"
          : "bg-red-500 text-white hover:bg-red-600"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isDeleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Deleting...</span>
          </>
        ) : (
          <span>Delete Course</span>
        )}
      </div>
    </motion.button>
  );
};

export default DeleteCourse;