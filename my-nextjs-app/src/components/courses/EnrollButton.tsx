
"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { PlayCircle, DollarSign, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/lib/auth";

interface Course {
  _id: string;
  name: string;
  price: number;
}

interface EnrollButtonProps {
  course: Course;
  handleEnrollSuccess: () => void;
  isEnrolling: boolean;
  setIsEnrolling: React.Dispatch<React.SetStateAction<boolean>>;
  setPaymentError: React.Dispatch<React.SetStateAction<string | null>>;
  isEnrolled: boolean; // New prop to receive enrollment status from parent
}

const EnrollButton: React.FC<EnrollButtonProps> = ({
  course,
  handleEnrollSuccess,
  isEnrolling,
  setIsEnrolling,
  setPaymentError,
  isEnrolled,
}) => {
  const { resolvedTheme } = useTheme();
  const { token, refreshUserData } = useAuth();
  const router = useRouter();
  const isDark = resolvedTheme === "dark";
  const [paymentLoading, setPaymentLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const handleEnroll = async () => {
    if (!token) {
      sessionStorage.setItem("redirectAfterLogin", `/course/${course._id}`);
      router.push("/auth/login");
      return;
    }

    setIsEnrolling(true);
    setPaymentError(null);
    setPaymentLoading(true);

    try {
      if (course.price === 0) {
        const response = await axios.post(
          `${baseUrl}/api/v1/enroll-course`,
          { courseId: course._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to enroll");
        }
        await refreshUserData();
        handleEnrollSuccess();
        console.log(`Enrolled in free course ${course._id}, redirecting to content`);
        router.push(`/courses/${course._id}/content`);
      } else {
        const response = await axios.post(
          `${baseUrl}/api/v1/create-checkout-session`,
          { courseId: course._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to create session");
        }
        if (response.data.sessionUrl) {
          console.log(`Redirecting to Stripe session for course ${course._id}`);
          router.push(response.data.sessionUrl);
        } else {
          throw new Error("Stripe session URL not received");
        }
      }
    } catch (err: any) {
      console.error("Enrollment error:", err);
      setPaymentError(err.message || "Failed to process enrollment");
    } finally {
      setIsEnrolling(false);
      setPaymentLoading(false);
    }
  };

  // Handle payment verification after Stripe redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const courseId = urlParams.get("courseId");

    if (sessionId && courseId && token) {
      const verifyPayment = async () => {
        try {
          const response = await axios.get(
            `${baseUrl}/api/v1/verify-payment?session_id=${sessionId}&courseId=${courseId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.data.success && response.data.user) {
            console.log(`Payment verified for course ${courseId}`);
            await refreshUserData();
            handleEnrollSuccess();
            router.push(`/courses/${courseId}/content`);
          } else {
            setPaymentError("Payment verification failed");
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          setPaymentError(
            axios.isAxiosError(err) && err.response?.status === 404
              ? "Payment verification endpoint not found"
              : "Failed to verify payment"
          );
        }
      };
      verifyPayment();
    }
  }, [token, handleEnrollSuccess, router, setPaymentError, baseUrl]);

  if (isEnrolled) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          console.log(`Redirecting to course content for course ${course._id}`);
          router.push(`/courses/${course._id}/content`);
        }}
        className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-md ${
          isDark
            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
            : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
        }`}
        aria-label="View course content"
      >
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>View Course</span>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleEnroll}
      disabled={isEnrolling || paymentLoading}
      className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-md ${
        isEnrolling || paymentLoading
          ? isDark
            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
          : isDark
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isEnrolling || paymentLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : course.price === 0 ? (
          <>
            <PlayCircle className="w-4 h-4" />
            <span>Start Free</span>
          </>
        ) : (
          <>
            <DollarSign className="w-4 h-4" />
            <span>Enroll Now</span>
          </>
        )}
      </div>
    </motion.button>
  );
};

export default EnrollButton;
