"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function PaymentSuccess() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  useEffect(() => {
    console.log("PaymentSuccess: Initializing");
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const courseId = urlParams.get("courseId");

    if (sessionId && courseId) {
      axios
        .get(`${baseUrl}/api/v1/verify-payment?session_id=${sessionId}`, {
          withCredentials: true, // Allow cookies for session tracking
        })
        .then((response) => {
          console.log("PaymentSuccess: Verify payment response:", {
            status: response.status,
            data: response.data,
          });
          if (response.data.success) {
            console.log("PaymentSuccess: Redirecting to /courses/:courseId/content");
            router.push(`/courses/${courseId}/content`);
          } else {
            router.push(`/course/${courseId}?error=${encodeURIComponent(response.data.message || "Payment verification failed")}`);
          }
        })
        .catch((err) => {
          console.error("PaymentSuccess: Payment verification error:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          });
          router.push(`/course/${courseId}?error=Failed to verify payment`);
        });
    } else {
      console.log("PaymentSuccess: Missing params, redirecting to course page");
      router.push("/course");
    }
  }, [router, baseUrl]);

  return <div>Processing your payment... Redirecting...</div>;
}