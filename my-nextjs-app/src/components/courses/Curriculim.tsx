"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { BookOpen, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course } from './GetSingleCoursePage';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface CurriculumProps {
  course: Course;
  activeVideo: string | null;
  setActiveVideo: (videoUrl: string | null) => void;
  expandedSection: string | null;
  toggleSection: (sectionId: string) => void;
  formatDuration: (duration: number) => string;
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
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`rounded-2xl overflow-hidden shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
    >
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Curriculum</h2>
        <div className="space-y-4">
          <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <motion.button
              whileHover={{ backgroundColor: isDark ? '#374151' : '#f9fafb' }}
              onClick={() => toggleSection('main')}
              className={`w-full flex justify-between items-center p-6 text-left transition-all ${
                isDark ? 'bg-gray-700/50 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-600' : 'bg-blue-500'}`}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Course Lessons
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {course.courseData?.length} lectures • {formatDuration(course.duration)}
                  </p>
                </div>
              </div>
              <motion.div animate={{ rotate: expandedSection === 'main' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <svg
                  className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {expandedSection === 'main' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {course.courseData?.map((lecture, index) => (
                      <motion.div
                        key={lecture.order}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4"
                      >
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setActiveVideo(lecture.videoUrl)}
                          className={`w-full flex items-center gap-4 text-left p-3 rounded-lg transition-all ${
                            activeVideo === lecture.videoUrl
                              ? isDark
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'bg-blue-50 text-blue-600 border border-blue-200'
                              : isDark
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full ${
                              activeVideo === lecture.videoUrl
                                ? isDark
                                  ? 'bg-blue-600'
                                  : 'bg-blue-500'
                                : isDark
                                ? 'bg-gray-700'
                                : 'bg-gray-100'
                            }`}
                          >
                            <PlayCircle
                              className={`w-4 h-4 ${
                                activeVideo === lecture.videoUrl
                                  ? 'text-white'
                                  : isDark
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{lecture.title}</h4>
                            <p
                              className={`text-sm ${
                                activeVideo === lecture.videoUrl
                                  ? 'text-blue-500'
                                  : isDark
                                  ? 'text-gray-400'
                                  : 'text-gray-500'
                              }`}
                            >
                              Lesson {lecture.order}
                              {lecture.duration && ` • ${Math.floor(lecture.duration / 60)}:${String(lecture.duration % 60).padStart(2, '0')}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {lecture.isRequired && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  isDark ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-100 text-red-600 border border-red-200'
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
    </motion.div>
  );
};

export default Curriculum;