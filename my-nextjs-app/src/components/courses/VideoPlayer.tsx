"use client";
import React from 'react';
import { useTheme } from 'next-themes';
import { PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Course } from './GetSingleCoursePage';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface VideoPlayerProps {
  activeVideo: string | null;
  course: Course;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ activeVideo, course }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`rounded-2xl overflow-hidden shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
    >
      <div className="relative">
        <div className="aspect-video bg-black rounded-t-2xl overflow-hidden">
          {activeVideo ? (
            <iframe
              src={activeVideo}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Course video"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <PlayCircle className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg text-gray-400">Select a lecture to start</p>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Course Content</h2>
        <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {course.description}
        </p>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;