"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import type { Course } from "@/types/course";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { y: -5, transition: { duration: 0.3 } },
};

interface DescriptionProps {
  course: Course;
}

const Description: React.FC<DescriptionProps> = ({ course }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [thumbnailSrc, setThumbnailSrc] = useState(
    course.thumbnail?.url || "/images/fallback-course.jpg"
  );

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={`rounded-xl p-6 lg:p-8 shadow-lg border transition-all duration-300 ${
        isDark
          ? "bg-gray-800/90 border-gray-700/50 hover:shadow-gray-700/20"
          : "bg-white/90 border-gray-200/50 hover:shadow-gray-200/30"
      }`}
    >
      <h2
        className={`text-2xl lg:text-3xl font-extrabold mb-6 ${
          isDark ? "text-gray-100" : "text-gray-900"
        } bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
      >
        About This Course
      </h2>
      <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden border border-gray-200/50">
        <Image
          src={thumbnailSrc}
          alt={course.name || "Course thumbnail"}
          fill
          className="object-cover transition-opacity duration-300"
          onError={() => setThumbnailSrc("/images/fallback-course.jpg")}
        />
        {!course.enrolled && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 hover:opacity-80">
            <PlayCircle className="w-16 h-16 text-white opacity-70 hover:opacity-100" />
          </div>
        )}
      </div>
      <div className={`prose max-w-none ${isDark ? "prose-invert" : "prose-gray"}`}>
        <p
          className={`text-base lg:text-lg leading-relaxed ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {course.description || "No detailed description available. Enroll to explore more!"}
        </p>
      </div>
      <div className="mt-8 p-5 lg:p-6 rounded-xl bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/30">
        <h3
          className={`text-lg lg:text-xl font-semibold mb-4 ${
            isDark ? "text-gray-200" : "text-gray-800"
          } flex items-center gap-2`}
        >
          <PlayCircle className="w-5 h-5 text-blue-500" /> Learning Outcomes
        </h3>
        <p
          className={`text-sm lg:text-base ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Unlock a structured curriculum designed to boost your skills. Enroll today to begin your
          learning journey and access exclusive content!
        </p>
      </div>
    </motion.div>
  );
};

export default Description;