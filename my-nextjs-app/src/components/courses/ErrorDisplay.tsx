"use client";

import React from "react";
import { useTheme } from "next-themes";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type CourseError =
  | "COURSE_NOT_FOUND"
  | "UNAUTHORIZED"
  | "ENROLLMENT_FAILED"
  | "PAYMENT_FAILED"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

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
  const isDark = resolvedTheme === "dark";

  const getErrorStyle = () => {
    switch (error.type) {
      case "COURSE_NOT_FOUND":
        return { iconColor: "text-yellow-500", bgColor: "bg-yellow-50/20" };
      case "UNAUTHORIZED":
        return { iconColor: "text-red-500", bgColor: "bg-red-50/20" };
      default:
        return { iconColor: "text-gray-500", bgColor: "bg-gray-50/20" };
    }
  };

  const { iconColor} = getErrorStyle();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} flex items-center justify-center p-4 lg:p-6`}
    >
      <div className="text-center max-w-lg bg-white dark:bg-gray-800 rounded-xl p-8 lg:p-10 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="mb-6 flex justify-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className={`${iconColor}`}
          >
            <AlertCircle className="w-20 h-20" />
          </motion.div>
        </div>
        <h2
          className={`text-xl lg:text-2xl font-bold mb-6 ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}
        >
          {error.message}
        </h2>
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className={`w-full px-6 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isDark
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(107, 114, 128, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className={`w-full px-6 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              isDark
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;