
"use client";
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  Heart,
  Share2,
  Bookmark,
  CheckCircle,
  Clock,
  Users,
  Star,
  Download,
  Award,
  Globe,
  PlayCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import EnrollButton from "./EnrollButton";
import EditCourse from "./EditCourse";
import DeleteCourse from "./DeleteCourse";
import { Course } from "@/types/course";
import { useAuth } from "@/lib/auth";

const shimmerAnimation = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  },
};

interface CourseSidePanelProps {
  course: Course;
  isFavorite: boolean;
  toggleFavorite: () => void;
  isEnrolling: boolean;
  setIsEnrolling: Dispatch<SetStateAction<boolean>>;
  handleEnrollSuccess: () => void;
  isAdmin: boolean;
  handleEdit: () => void;
  handleDelete: () => void;
  isDeleting: boolean;
  formatDuration: (duration: number) => string;
}

const CourseSidePanel: React.FC<CourseSidePanelProps> = ({
  course,
  isFavorite,
  toggleFavorite,
  setIsEnrolling,
  handleEnrollSuccess,
  isAdmin,
  isEnrolling,
  handleEdit,
  handleDelete,
  isDeleting,
  formatDuration,
}) => {
  const { resolvedTheme } = useTheme();
  const { user, token } = useAuth();
  const router = useRouter();
  const isDark = resolvedTheme === "dark";
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState<boolean>(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  // Check purchase status on component mount
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!token || !course?._id) {
        setIsEnrolled(isAdmin); // Admins have access to all courses
        setIsCheckingPurchase(false);
        return;
      }

      try {
        console.log(`Checking purchase status for course ${course._id}`);
        const response = await axios.get(`${baseUrl}/api/v1/check-purchase?courseId=${course._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          console.log(`Purchase status: ${response.data.purchased}`);
          setIsEnrolled(response.data.purchased || isAdmin);
        } else {
          console.error("Failed to check purchase:", response.data.message);
          setIsEnrolled(isAdmin || (user?.courses || []).some((c: any) => String(c.courseId) === String(course._id)));
        }
      } catch (err) {
        console.error("Error checking purchase:", err);
        setIsEnrolled(isAdmin || (user?.courses || []).some((c: any) => String(c.courseId) === String(course._id)));
      } finally {
        setIsCheckingPurchase(false);
      }
    };

    checkEnrollment();
  }, [token, course._id, user?.courses, isAdmin, baseUrl]);

  const discountPercentage = course.price > 0 && course.estimatedPrice
    ? Math.round(((course.price - course.estimatedPrice) / course.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full"
    >
      <div
        className={`p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 shadow-lg ${
          isDark
            ? "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50"
            : "bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFavorite}
              className={`p-3 rounded-full transition-all duration-300 shadow-md ${
                isFavorite
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                  : isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              aria-label={isFavorite ? `Remove ${course.name} from favorites` : `Add ${course.name} to favorites`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-full transition-all duration-300 shadow-md ${
                isDark
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
              aria-label="Share this course"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-full transition-all duration-300 shadow-md ${
                isDark
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
              aria-label="Bookmark this course"
            >
              <Bookmark className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {course.estimatedPrice && course.estimatedPrice < course.price ? (
              <div className="flex items-baseline justify-center gap-3">
                <span className={`line-through text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  ${course.price}
                </span>
                <motion.span
                  variants={shimmerAnimation}
                  animate="animate"
                  className={`text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent`}
                >
                  ${course.estimatedPrice}
                </motion.span>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                >
                  Save {discountPercentage}%
                </motion.div>
              </div>
            ) : (
              <motion.span
                className={`text-3xl font-bold ${course.price === 0 ? "text-green-600" : isDark ? "text-blue-400" : "text-blue-600"}`}
              >
                {course.price === 0 ? "Free" : `$${course.price}`}
              </motion.span>
            )}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            {course.price === 0 ? "Free access • No payment required" : "One-time payment • Lifetime access"}
          </motion.p>
          {paymentError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm mt-2"
            >
              {paymentError}
            </motion.p>
          )}
        </div>

        {isCheckingPurchase ? (
          <motion.div
            className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-md ${
              isDark ? "bg-gray-700 text-gray-400" : "bg-gray-300 text-gray-500"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 animate-pulse" />
              <span>Checking enrollment...</span>
            </div>
          </motion.div>
        ) : (
          <EnrollButton
            course={course}
            handleEnrollSuccess={handleEnrollSuccess}
            isEnrolling={isEnrolling}
            setIsEnrolling={setIsEnrolling}
            setPaymentError={setPaymentError}
            isEnrolled={isEnrolled}
          />
        )}

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 space-y-4"
          >
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Admin actions for this course
            </p>
            <EditCourse courseId={course._id} onEdit={handleEdit} />
            <DeleteCourse courseId={course._id} onDelete={handleDelete} isDeleting={isDeleting} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            Whats Included
          </h3>
          <div className="space-y-4">
            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-blue-600/20" : "bg-blue-100"}`}>
                <PlayCircle className={`w-5 h-5 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {course.courseData?.length || 0} HD Video Lessons
                </p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  High-quality content
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-green-600/20" : "bg-green-100"}`}>
                <Clock className={`w-5 h-5 ${isDark ? "text-green-400" : "text-green-600"}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  {formatDuration(course.duration)} Total Content
                </p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Self-paced learning
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-purple-600/20" : "bg-purple-100"}`}>
                <Globe className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`}
                />
              </div>
              <div>
                <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  Lifetime Access
                </p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Learn at your own pace
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-yellow-600/20" : "bg-yellow-100"}`}>
                <Award className={`w-5 h-5 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  Certificate of Completion
                </p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  Shareable credential
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ x: 5 }} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? "bg-pink-600/20" : "bg-pink-100"}`}>
                <Download className={`w-5 h-5 ${isDark ? "text-pink-400" : "text-pink-600"}`} />
              </div>
              <div>
                <p className={`font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  Downloadable Resources
                </p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  PDFs, worksheets & more
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <h3 className={`text-lg font-bold mb-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            Quick Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg text-center ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}
            >
              <div className="flex items-center justify-center mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className={`text-xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                {course.rating}
              </p>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Rating
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-4 rounded-lg text-center ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}
            >
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <p className={`text-xl font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                {course.purchased > 999 ? `${Math.floor(course.purchased / 1000)}K` : course.purchased}
              </p>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Students
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CourseSidePanel;