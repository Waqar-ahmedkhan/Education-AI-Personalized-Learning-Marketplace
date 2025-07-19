"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { Course } from "@/types/course";

// Utility function to convert YouTube URL to embed format
const getYouTubeEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?controls=1&autoplay=0&rel=0`;
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
      ease: "easeInOut",
    },
  },
};

interface VideoPlayerProps {
  activeVideo: string | null;
  course: Course;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ activeVideo, course }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Transform the activeVideo URL to YouTube embed format
  const embedUrl = getYouTubeEmbedUrl(activeVideo);

  console.log("VideoPlayer: activeVideo=", activeVideo, "embedUrl=", embedUrl);

  // Handle video state changes
  const handlePlayPause = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      if (isPlaying) {
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*"
        );
      } else {
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          "*"
        );
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteUnmute = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      if (isMuted) {
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"unMute","args":""}',
          "*"
        );
      } else {
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"mute","args":""}',
          "*"
        );
      }
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        iframeRef.current.requestFullscreen();
      }
    }
  };

  // Reset state when activeVideo changes
  useEffect(() => {
    setIsPlaying(false);
    setIsMuted(false);
    setIsLoading(true);
    setError(null);
  }, [activeVideo]);

  // Handle iframe load
  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // Simulate a reload by resetting the embed URL
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = embedUrl || "";
      }
    }, 1000);
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl ${
        isDark
          ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50"
          : "bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/50"
      }`}
    >
      <div className="relative group">
        <div className="aspect-video bg-gradient-to-br from-black to-gray-900 rounded-t-3xl overflow-hidden relative">
          {embedUrl ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="text-white"
                  >
                    <RefreshCw className="w-8 h-8" />
                  </motion.div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={embedUrl}
                className="w-full h-full transition-all duration-300"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Course video"
                onLoad={handleLoad}
                onError={() => {
                  setIsLoading(false);
                  setError("Failed to load video. Check the URL or network connection.");
                }}
              />
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePlayPause}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                      >
                        {isPlaying ? (
                          <PauseCircle className="w-6 h-6 text-white" />
                        ) : (
                          <PlayCircle className="w-6 h-6 text-white" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleMuteUnmute}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                      >
                        {isMuted ? (
                          <VolumeX className="w-6 h-6 text-white" />
                        ) : (
                          <Volume2 className="w-6 h-6 text-white" />
                        )}
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        aria-label="Settings"
                      >
                        <Settings className="w-6 h-6 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleFullscreen}
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        aria-label="Toggle fullscreen"
                      >
                        <Maximize className="w-6 h-6 text-white" />
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
                <PlayCircle className="w-24 h-24 text-blue-400 mb-6 drop-shadow-lg" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 text-center"
              >
                <p className="text-xl font-semibold text-white mb-2">Ready to Start?</p>
                <p className="text-sm text-gray-300">
                  {course.demoUrl
                    ? "Video unavailable. Please try again."
                    : "Select a lecture to begin learning!"}
                </p>
                {error && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRetry}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    aria-label="Retry loading video"
                  >
                    <RefreshCw className="w-5 h-5 inline mr-2" /> Retry
                  </motion.button>
                )}
              </motion.div>
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
              </div>
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
              <p className="text-white text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <h2
            className={`text-2xl lg:text-3xl font-bold bg-gradient-to-r ${
              isDark
                ? "from-white to-gray-300 bg-clip-text text-transparent"
                : "from-gray-900 to-gray-700 bg-clip-text text-transparent"
            }`}
          >
            Course Content
          </h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`px-3 py-1 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium ${
              isDark
                ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30"
                : "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200"
            }`}
          >
            {embedUrl ? (isPlaying ? "Playing" : "Paused") : "Preview Mode"}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-4 lg:p-6 rounded-2xl ${
            isDark
              ? "bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/50"
              : "bg-gradient-to-br from-gray-50/50 to-white/50 border border-gray-200/50"
          }`}
        >
          <p className={`text-sm lg:text-base leading-relaxed ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}>
            {course.description || "No description available."}
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
              <span className={`text-xs lg:text-sm font-medium ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Course Progress
              </span>
              <span className={`text-xs lg:text-sm font-bold ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}>
                {course.progress || 0}%
              </span>
            </div>
            <div
              className={`w-full h-1.5 lg:h-2 rounded-full overflow-hidden ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress || 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
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