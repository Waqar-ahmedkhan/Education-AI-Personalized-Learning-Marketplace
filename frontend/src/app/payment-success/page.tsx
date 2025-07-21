"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function PaymentSuccess() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("Processing your payment...");

  useEffect(() => {
    console.log("PaymentSuccess: Initializing");
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const courseId = urlParams.get("courseId");

    if (sessionId && courseId) {
      axios
        .get(`${baseUrl}/api/v1/verify-payment?session_id=${sessionId}`, {
          withCredentials: true,
        })
        .then((response) => {
          console.log("PaymentSuccess: Verify payment response:", {
            status: response.status,
            data: response.data,
          });
          if (response.data.success) {
            setStatus("success");
            setMessage("Payment verified! Redirecting to course content...");
            setTimeout(() => {
              router.push(`/courses/${courseId}/content`);
            }, 2000);
          } else {
            setStatus("error");
            setMessage(response.data.message || "Payment verification failed");
            setTimeout(() => {
              router.push(`/course/${courseId}?error=${encodeURIComponent(response.data.message || "Payment verification failed")}`);
            }, 3000);
          }
        })
        .catch((err) => {
          console.error("PaymentSuccess: Payment verification error:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status,
          });
          setStatus("error");
          setMessage("Failed to verify payment. Please try again.");
          setTimeout(() => {
            router.push(`/course/${courseId}?error=Failed to verify payment`);
          }, 3000);
        });
    } else {
      console.log("PaymentSuccess: Missing params, redirecting to course page");
      setStatus("error");
      setMessage("Invalid payment parameters. Redirecting...");
      setTimeout(() => {
        router.push("/course");
      }, 3000);
    }
  }, [router, baseUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          {status === "processing" && (
            <svg
              className="animate-spin h-12 w-12 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {status === "success" && (
            <svg
              className="h-12 w-12 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {status === "error" && (
            <svg
              className="h-12 w-12 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {status === "processing" && "Processing Payment"}
          {status === "success" && "Payment Successful"}
          {status === "error" && "Payment Error"}
        </h1>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              status === "success" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-blue-500"
            } ${status === "processing" ? "animate-pulse" : "w-full"}`}
          ></div>
        </div>
      </div>
    </div>
  );
}