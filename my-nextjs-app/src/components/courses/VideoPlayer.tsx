'use client';
import React from 'react';
import { useTheme } from 'next-themes';
import { PlayCircle, Volume2, Maximize, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from '@/types/course';

// Utility function to convert YouTube URL to embed format
const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  // Handle both youtu.be and youtube.com URLs
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url; // Return original URL if not a YouTube URL
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

interface VideoPlayerProps {
  activeVideo: string | null;
  course: Course;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ activeVideo, course }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Transform the activeVideo URL to YouTube embed format
  const embedUrl = getYouTubeEmbedUrl(activeVideo);

  console.log('VideoPlayer: activeVideo=', activeVideo, 'embedUrl=', embedUrl);

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl ${
        isDark
          ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50'
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50'
      }`}
    >
      <div className="relative group">
        <div className="aspect-video bg-gradient-to-br from-black to-gray-900 rounded-t-3xl overflow-hidden relative">
          {embedUrl ? (
            <>
              <iframe
                src={embedUrl}
                className="w-full h-full transition-all duration-300"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Course video"
              />
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        <Volume2 className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                      >
                        <Maximize className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
              <motion.div variants={pulseVariants} animate="animate" className="relative z-10">
                <PlayCircle className="w-20 h-20 text-blue-400 mb-6 drop-shadow-lg" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 text-center"
              >
                <p className="text-xl font-semibold text-white mb-2">Ready to Start Learning?</p>
                <p className="text-sm text-gray-300">
                  {course.demoUrl
                    ? 'Unable to load video. Please try again.'
                    : 'Select a lecture from the curriculum to begin'}
                </p>
              </motion.div>
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <h2
            className={`text-3xl font-bold bg-gradient-to-r ${
              isDark
                ? 'from-white to-gray-300 bg-clip-text text-transparent'
                : 'from-gray-900 to-gray-700 bg-clip-text text-transparent'
            }`}
          >
            Course Content
          </h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isDark
                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200'
            }`}
          >
            {embedUrl ? 'Now Playing' : 'Preview Mode'}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-2xl ${
            isDark
              ? 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50'
              : 'bg-gradient-to-br from-gray-50/50 to-white/50 border border-gray-200/50'
          }`}
        >
          <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {course.description}
          </p>
        </motion.div>

        {/* Progress Indicator */}
        {embedUrl && course.enrolled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Course Progress
              </span>
              <span className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {course.progress || 0}%
              </span>
            </div>
            <div
              className={`w-full h-2 rounded-full overflow-hidden ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress || 0}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoPlayer;