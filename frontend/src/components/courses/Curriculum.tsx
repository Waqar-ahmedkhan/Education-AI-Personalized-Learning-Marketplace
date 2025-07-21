
"use client";

import React from "react";
import { useTheme } from "next-themes";
import { BookOpen, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Course, CourseData } from "@/types/course";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -3, transition: { duration: 0.2 } },
};

const sectionVariants = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.3, ease: "easeInOut" },
};

interface CurriculumProps {
  course: Course | null;
  activeVideo: string | null;
  setActiveVideo: (videoUrl: string | null) => void;
  expandedSection: string | null;
  toggleSection: (sectionId: string) => void;
  formatDuration: (duration: number | undefined) => string;
}

const Curriculum: React.FC<CurriculumProps> = ({
  course,
  activeVideo,
  setActiveVideo,
  expandedSection,
  toggleSection,
  formatDuration,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  if (!course || !course.courseData?.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 text-red-500 rounded-lg bg-red-500/10"
        role="alert"
        aria-label="Course data error"
      >
        Error: Course or lesson data is missing.
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`relative rounded-xl overflow-hidden shadow-xl border transition-all duration-300 ${
        isDark
          ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:shadow-gray-700/30"
          : "bg-gradient-to-br from-white/90 to-gray-100/90 border-gray-200/50 hover:shadow-gray-200/40"
      }`}
      aria-label="Course Curriculum Section"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="p-2 sm:p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 shadow-md"
          >
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Course Curriculum
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {course.courseData.length} lectures • {formatDuration(course.duration)}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div
            className={`border rounded-xl overflow-hidden ${
              isDark ? "border-gray-700/50" : "border-gray-200/50"
            }`}
          >
            <motion.button
              whileHover={{
                backgroundColor: isDark ? "#374151" : "#f9fafb",
                scale: 1.01,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSection("main")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSection("main");
                }
              }}
              className={`w-full flex justify-between items-center p-4 sm:p-6 text-left transition-all duration-300 ${
                isDark ? "bg-gray-700/50" : "bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              aria-expanded={expandedSection === "main"}
              aria-controls="curriculum-section"
              tabIndex={0}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`p-2 rounded-lg ${
                    isDark ? "bg-blue-600/50" : "bg-blue-500/20"
                  }`}
                >
                  <BookOpen
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? "text-blue-200" : "text-blue-600"}`}
                  />
                </div>
                <div>
                  <h3
                    className={`font-semibold text-base sm:text-lg ${
                      isDark ? "text-gray-100" : "text-gray-900"
                    }`}
                  >
                    Course Lessons
                  </h3>
                  <p
                    className={`text-xs sm:text-sm ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {course.courseData.length} lectures • {formatDuration(course.duration)}
                  </p>
                </div>
              </div>
              <motion.svg
                animate={{ rotate: expandedSection === "main" ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </motion.button>
            <AnimatePresence>
              {expandedSection === "main" && (
                <motion.div
                  variants={sectionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  id="curriculum-section"
                  className={`${isDark ? "bg-gray-800/90" : "bg-white/90"}`}
                >
                  <div
                    className={`divide-y ${
                      isDark ? "divide-gray-700/50" : "divide-gray-200/50"
                    }`}
                  >
                    {course.courseData.map((lecture: CourseData, index: number) => (
                      <motion.div
                        key={lecture._id || lecture.order}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 sm:p-4"
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setActiveVideo(lecture.videoUrl)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setActiveVideo(lecture.videoUrl);
                            }
                          }}
                          className={`w-full flex items-center gap-3 sm:gap-4 text-left p-3 rounded-lg transition-all duration-300 ${
                            activeVideo === lecture.videoUrl
                              ? isDark
                                ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                              : isDark
                              ? "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          aria-label={`Play lecture: ${lecture.title}`}
                          tabIndex={0}
                        >
                          <div
                            className={`p-2 rounded-full ${
                              activeVideo === lecture.videoUrl
                                ? isDark
                                  ? "bg-blue-600/50"
                                  : "bg-blue-500/20"
                                : isDark
                                ? "bg-gray-700/50"
                                : "bg-gray-100"
                            }`}
                          >
                            <PlayCircle
                              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                activeVideo === lecture.videoUrl
                                  ? "text-blue-200"
                                  : isDark
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">
                              {lecture.title}
                            </h4>
                            <p
                              className={`text-xs sm:text-sm ${
                                activeVideo === lecture.videoUrl
                                  ? "text-blue-300"
                                  : isDark
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              Lesson {lecture.order}
                              {lecture.videoLength !== undefined &&
                                ` • ${Math.floor(lecture.videoLength / 60)}:${String(
                                  lecture.videoLength % 60
                                ).padStart(2, "0")}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {lecture.isRequired && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  isDark
                                    ? "bg-red-900/30 text-red-400 border border-red-800/50"
                                    : "bg-red-100 text-red-600 border border-red-200/50"
                                }`}
                              >
                                Required
                              </span>
                            )}
                            {activeVideo === lecture.videoUrl && (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            )}
                          </div>
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-b-xl opacity-50" />
    </motion.div>
  );
};

export default Curriculum;