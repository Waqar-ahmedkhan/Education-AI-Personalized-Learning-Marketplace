"use client";
import React from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

interface EditCourseProps {
  courseId: string;
  onEdit: () => void;
}

const EditCourse: React.FC<EditCourseProps> = ({  onEdit }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onEdit}
      className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-md ${
        isDark
          ? "bg-yellow-600 text-white hover:bg-yellow-700"
          : "bg-yellow-500 text-white hover:bg-yellow-600"
      }`}
    >
      Edit Course
    </motion.button>
  );
};

export default EditCourse;