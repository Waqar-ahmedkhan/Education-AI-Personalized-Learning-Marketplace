// app/admin-dashboard/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { AlertCircle, Users, BookOpen, ShoppingCart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiResponse, AnalyticsData, AuthContextType } from "@/types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Animation variants for cards
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AnalyticsSection() {
  const { token, userRole, userName, isLoading } = useAuth() as AuthContextType;
  const router = useRouter();
  const [userData, setUserData] = useState<AnalyticsData>({
    labels: [],
    data: [],
  });
  const [courseData, setCourseData] = useState<AnalyticsData>({
    labels: [],
    data: [],
  });
  const [orderData, setOrderData] = useState<AnalyticsData>({
    labels: [],
    data: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!token || userRole !== "admin")) {
      router.push("/forbidden?error=Access denied. Admin role required.");
    }
  }, [isLoading, token, userRole, router]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token || userRole !== "admin") return;

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const [usersRes, coursesRes, ordersRes] = await Promise.all([
          axios.get<ApiResponse<AnalyticsData>>(
            `${baseUrl}/api/v1/get-users-analytics`,
            { headers }
          ),
          axios.get<ApiResponse<AnalyticsData>>(
            `${baseUrl}/api/v1/get-courses-analytics`,
            { headers }
          ),
          axios.get<ApiResponse<AnalyticsData>>(
            `${baseUrl}/api/v1/get-orders-analytics`,
            { headers }
          ),
        ]);

        if (usersRes.data.success)
          setUserData(usersRes.data.data || { labels: [], data: [] });
        if (coursesRes.data.success)
          setCourseData(coursesRes.data.data || { labels: [], data: [] });
        if (ordersRes.data.success)
          setOrderData(ordersRes.data.data || { labels: [], data: [] });
      } catch (err: unknown) {
        const errorMessage =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Failed to load analytics data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && token && userRole === "admin") fetchAnalytics();
  }, [token, userRole, isLoading]);

  // Chart configuration
  const createChartData = (
    data: AnalyticsData,
    type: "users" | "courses" | "orders"
  ): ChartData<"line"> => ({
    labels: data.labels,
    datasets: [
      {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        data: data.data,
        borderColor:
          type === "users"
            ? "#4f46e5"
            : type === "courses"
            ? "#22c55e"
            : "#ef4444",
        backgroundColor:
          type === "users"
            ? "rgba(79, 70, 229, 0.2)"
            : type === "courses"
            ? "rgba(34, 197, 94, 0.2)"
            : "rgba(239, 68, 68, 0.2)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#fff",
        pointBorderColor:
          type === "users"
            ? "#4f46e5"
            : type === "courses"
            ? "#22c55e"
            : "#ef4444",
        pointHoverRadius: 8,
        pointHoverBackgroundColor:
          type === "users"
            ? "#4f46e5"
            : type === "courses"
            ? "#22c55e"
            : "#ef4444",
      },
    ],
  });

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "text-text-light dark:text-text-dark",
          font: { size: 14, weight: 500 },
        },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: "bg-gray-800 dark:bg-gray-200",
        titleColor: "text-text-light dark:text-text-dark",
        bodyColor: "text-text-light dark:text-text-dark",
        borderColor: "border-gray-200 dark:border-gray-700",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "text-text-light dark:text-text-dark",
          font: { size: 12 },
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: "text-text-light dark:text-text-dark",
          font: { size: 12 },
        },
        grid: { color: "border-gray-200 dark:border-gray-700", lineWidth: 1 },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary-light dark:border-primary-dark border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert
          variant="destructive"
          className="bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-400 max-w-md mx-auto"
        >
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          <AlertTitle className="text-red-500 dark:text-red-400 font-semibold">
            Error
          </AlertTitle>
          <AlertDescription className="text-red-500 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 lg:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark"
      >
        Analytics Overview{userName ? `, ${userName}` : ""}
      </motion.h1>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="flex items-center space-x-3 bg-gradient-to-r from-primary-light/10 to-secondary-light/10 dark:from-primary-dark/10 dark:to-secondary-dark/10 p-4">
              <div className="p-2 bg-primary-light/20 dark:bg-primary-dark/20 rounded-full">
                <Users className="w-6 h-6 text-primary-light dark:text-primary-dark" />
              </div>
              <CardTitle className="text-lg font-semibold text-text-light dark:text-text-dark">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-primary-light dark:text-primary-dark">
                {userData.data
                  .reduce((sum, count) => sum + count, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {userData.labels.length > 0
                  ? `Latest: ${userData.data[
                      userData.data.length - 1
                    ].toLocaleString()} in ${
                      userData.labels[userData.labels.length - 1]
                    }`
                  : "No data available"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="flex items-center space-x-3 bg-gradient-to-r from-green-500/10 to-green-400/10 dark:from-green-400/10 dark:to-green-300/10 p-4">
              <div className="p-2 bg-green-500/20 dark:bg-green-400/20 rounded-full">
                <BookOpen className="w-6 h-6 text-green-500 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg font-semibold text-text-light dark:text-text-dark">
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-green-500 dark:text-green-400">
                {courseData.data
                  .reduce((sum, count) => sum + count, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {courseData.labels.length > 0
                  ? `Latest: ${courseData.data[
                      courseData.data.length - 1
                    ].toLocaleString()} in ${
                      courseData.labels[courseData.labels.length - 1]
                    }`
                  : "No data available"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
            <CardHeader className="flex items-center space-x-3 bg-gradient-to-r from-red-500/10 to-red-400/10 dark:from-red-400/10 dark:to-red-300/10 p-4">
              <div className="p-2 bg-red-500/20 dark:bg-red-400/20 rounded-full">
                <ShoppingCart className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <CardTitle className="text-lg font-semibold text-text-light dark:text-text-dark">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-3xl font-bold text-red-500 dark:text-red-400">
                {orderData.data
                  .reduce((sum, count) => sum + count, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {orderData.labels.length > 0
                  ? `Latest: ${orderData.data[
                      orderData.data.length - 1
                    ].toLocaleString()} in ${
                      orderData.labels[orderData.labels.length - 1]
                    }`
                  : "No data available"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-text-light dark:text-text-dark">
                User Growth (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <Line
                data={createChartData(userData, "users")}
                options={chartOptions}
              />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-text-light dark:text-text-dark">
                Course Creation (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <Line
                data={createChartData(courseData, "courses")}
                options={chartOptions}
              />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-text-light dark:text-text-dark">
                Order Activity (Last 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <Line
                data={createChartData(orderData, "orders")}
                options={chartOptions}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
