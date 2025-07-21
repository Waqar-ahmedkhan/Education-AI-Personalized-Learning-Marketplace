"use client";
import React, { useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { motion } from "framer-motion";
import { CourseInstructor } from "@/types/course";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

interface InstructorInfoProps {
  instructor: CourseInstructor;
}

const InstructorInfo: React.FC<InstructorInfoProps> = ({ instructor }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [avatarSrc, setAvatarSrc] = useState(
    instructor.avatar || "/images/instructor-placeholder.jpg"
  );

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className={`rounded-2xl p-6 shadow-xl ${
        isDark
          ? "bg-gray-800 border border-gray-700"
          : "bg-white border border-gray-200"
      }`}
    >
      <h2
        className={`text-xl font-bold mb-4 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Instructor
      </h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={avatarSrc}
            alt={instructor.name || "Instructor avatar"}
            width={48}
            height={48}
            className="object-cover"
            onError={() => setAvatarSrc("/images/instructor-placeholder.jpg")}
            title={instructor.name}
          />
        </div>
        <div>
          <h3
            className={`font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {instructor.name}
          </h3>
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Course Instructor
          </p>
        </div>
      </div>
      <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        {instructor.bio}
      </p>
    </motion.div>
  );
};

export default InstructorInfo;
