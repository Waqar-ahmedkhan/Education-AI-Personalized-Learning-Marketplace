"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { Heart, Share2, PlayCircle, Award, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminControls from './AdminControls';
import { Course } from './GetSingleCoursePage';

interface CourseActionPanelProps {
  course: Course;
  isFavorite: boolean;
  toggleFavorite: () => void;
  isEnrolling: boolean;
  handleEnroll: () => void;
  isAdmin: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
  isDeleting: boolean;
  formatDuration: (duration: number) => string;
}

const CourseActionPanel: React.FC<CourseActionPanelProps> = ({
  course,
  isFavorite,
  toggleFavorite,
  isEnrolling,
  handleEnroll,
  isAdmin,
  handleEdit,
  handleDelete,
  isDeleting,
  formatDuration,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="md:w-1/3"
    >
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className={`p-3 rounded-full transition-all ${
                isFavorite
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  : isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } shadow-sm`}
              aria-label={isFavorite ? `Remove ${course.name} from favorites` : `Add ${course.name} to favorites`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-full transition-all ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } shadow-sm`}
              aria-label="Share this course"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        <div className="text-center mb-6">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-4xl font-bold ${
              course.price === 0 ? 'text-green-600' : isDark ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </motion.span>
          {course.price > 0 && (
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              One-time payment
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleEnroll}
          disabled={course.enrolled || isEnrolling}
          className={`w-full py-4 px-6 rounded-xl text-lg font-semibold transition-all ${
            course.enrolled
              ? isDark
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isDark
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
          }`}
          aria-label={course.enrolled ? 'Already enrolled' : course.price === 0 ? `Start ${course.name}` : `Enroll in ${course.name}`}
        >
          {isEnrolling ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </div>
          ) : course.enrolled ? (
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Enrolled
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {course.price === 0 ? (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Start Learning
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  Enroll Now
                </>
              )}
            </div>
          )}
        </motion.button>
        {isAdmin && (
          <AdminControls
            courseId={course._id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            This course includes:
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PlayCircle className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {course.courseData?.length || 0} video lessons
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {formatDuration(course.duration)} total content
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PlayCircle className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Lifetime access
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Award className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Certificate of completion
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseActionPanel;