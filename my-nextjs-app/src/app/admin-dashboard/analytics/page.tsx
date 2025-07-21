"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import axios from "axios";
import { toast } from "react-hot-toast";
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
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Users,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Activity,
  BarChart3,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Cookies from "js-cookie";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Interface definitions
interface RawAnalyticsData {
  last12Months: { month: string; count: number }[];
}

interface AnalyticsData {
  labels: string[];
  data: number[];
}

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  users?: RawAnalyticsData;
  courses?: RawAnalyticsData;
  orders?: RawAnalyticsData;
  message?: string;
}

interface LatestUsersResponse {
  success: boolean;
  latestUsers?: User[];
  message?: string;
}

interface RefreshTokenResponse {
  status: string;
  access_token: string;
}

interface AuthContextType {
  token: string | null;
  userRole: string | null;
  userName: string | null;
  isLoading: boolean;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.3 },
  },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AnalyticsSection() {
  const { token, userRole, userName, isLoading } = useAuth() as AuthContextType;
  const router = useRouter();
  const [userData, setUserData] = useState<AnalyticsData>({ labels: [], data: [] });
  const [courseData, setCourseData] = useState<AnalyticsData>({ labels: [], data: [] });
  const [orderData, setOrderData] = useState<AnalyticsData>({ labels: [], data: [] });
  const [latestUsers, setLatestUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!token || userRole !== "admin")) {
      router.push("/forbidden?error=Access denied. Admin role required.");
    }
  }, [isLoading, token, userRole, router]);

  // Refresh token function
  const refreshToken = async (): Promise<string | null> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await axios.get<RefreshTokenResponse>(
        `${baseUrl}/api/v1/user/refresh`,
        { withCredentials: true }
      );

      if (res.data.status === "success" && res.data.access_token) {
        Cookies.set("access_token", res.data.access_token, {
          expires: 7,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
        return res.data.access_token;
      }
      throw new Error("Failed to refresh token");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error during token refresh";
      console.error("Token refresh error:", errorMessage);
      toast.error("Session expired. Please log in again.");
      router.push("/auth/admin-login?error=Session expired. Please log in again.");
      return null;
    }
  };

  // Transform analytics data
  const transformAnalyticsData = (rawData: RawAnalyticsData | undefined): AnalyticsData => {
    if (!rawData?.last12Months) {
      return { labels: [], data: [] };
    }
    const sortedMonths = rawData.last12Months.sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );
    return {
      labels: sortedMonths.map((item) => item.month),
      data: sortedMonths.map((item) => item.count),
    };
  };

  // Fetch analytics data
  const fetchAnalytics = async (currentToken: string) => {
    if (!currentToken || userRole !== "admin") return;

    try {
      setLoading(true);
      setError("");
      const headers = { Authorization: `Bearer ${currentToken}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const fetchWithErrorHandling = async (
        url: string,
        endpointName: string,
        dataKey: "users" | "courses" | "orders"
      ): Promise<AnalyticsData> => {
        try {
          const res = await axios.get<ApiResponse>(url, { headers });
          if (res.data.success) {
            return transformAnalyticsData(res.data[dataKey]);
          }
          toast.error(`${endpointName} request failed: ${res.data.message || "Unknown error"}`);
          return { labels: [], data: [] };
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Unknown error";
          if (err.response?.status === 404) {
            toast.error(`${endpointName} endpoint not found`);
            return { labels: [], data: [] };
          }
          if (err.response?.status === 500) {
            toast.error(`${endpointName} server error`);
            return { labels: [], data: [] };
          }
          throw err;
        }
      };

      const fetchLatestUsers = async (): Promise<User[]> => {
        try {
          const res = await axios.get<LatestUsersResponse>(
            `${baseUrl}/api/v1/get-latest-users?limit=5`,
            { headers }
          );
          if (res.data.success && res.data.latestUsers) {
            return res.data.latestUsers;
          }
          toast.error(`Latest users request failed: ${res.data.message || "Unknown error"}`);
          return [];
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || "Failed to fetch latest users";
          toast.error(errorMessage);
          return [];
        }
      };

      const [usersData, coursesData, ordersData, latestUsersData] = await Promise.all([
        fetchWithErrorHandling(`${baseUrl}/api/v1/get-users-analytics`, "Users analytics", "users"),
        fetchWithErrorHandling(`${baseUrl}/api/v1/get-courses-analytics`, "Courses analytics", "courses"),
        fetchWithErrorHandling(`${baseUrl}/api/v1/get-orders-analytics`, "Orders analytics", "orders"),
        fetchLatestUsers(),
      ]);

      setUserData(usersData);
      setCourseData(coursesData);
      setOrderData(ordersData);
      setLatestUsers(latestUsersData);

      const warnings: string[] = [];
      if (!usersData.labels.length) warnings.push("Users analytics unavailable");
      if (!coursesData.labels.length) warnings.push("Courses analytics unavailable");
      if (!ordersData.labels.length) warnings.push("Orders analytics unavailable");
      if (!latestUsersData.length) warnings.push("Latest users unavailable");

      if (warnings.length > 0) {
        const warningMessage = `Some data unavailable: ${warnings.join(", ")}`;
        setError(warningMessage);
        toast.error(warningMessage);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to load analytics data.";
      if (err.response?.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
          fetchAnalytics(newToken);
          return;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!isLoading && token && userRole === "admin") {
      fetchAnalytics(token);
    }
  }, [token, userRole, isLoading]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await fetchAnalytics(token);
  };

  // Calculate metrics
  const calculateMetrics = (data: AnalyticsData) => {
    const total = data.data.reduce((sum, count) => sum + count, 0);
    const latest = data.data[data.data.length - 1] || 0;
    const previous = data.data[data.data.length - 2] || 0;
    const growth = previous > 0 ? ((latest - previous) / previous) * 100 : 0;
    return { total, latest, growth };
  };

  // Chart data configuration
  const createChartData = (data: AnalyticsData, type: "users" | "courses" | "orders"): ChartData<"line"> => {
    const colors = {
      users: { border: "#3b82f6", background: "rgba(59, 130, 246, 0.1)", gradient: "rgba(59, 130, 246, 0.3)" },
      courses: { border: "#10b981", background: "rgba(16, 185, 129, 0.1)", gradient: "rgba(16, 185, 129, 0.3)" },
      orders: { border: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", gradient: "rgba(245, 158, 11, 0.3)" },
    };

    return {
      labels: data.labels,
      datasets: [
        {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          data: data.data,
          borderColor: colors[type].border,
          backgroundColor: colors[type].gradient,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: colors[type].border,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 3,
        },
      ],
    };
  };

  // Chart options
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, pointStyle: "circle", padding: 15, font: { size: 14, family: "'Inter', sans-serif" } },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12, family: "'Inter', sans-serif" }, maxRotation: 45, minRotation: 45 },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          font: { size: 12, family: "'Inter', sans-serif" },
          callback: (value) => value.toLocaleString(),
          stepSize: Math.max(...userData.data, ...courseData.data, ...orderData.data) / 5,
        },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuad",
    },
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-12 w-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 dark:text-gray-300">Loading Analytics...</p>
        </motion.div>
      </div>
    );
  }

  const userMetrics = calculateMetrics(userData);
  const courseMetrics = calculateMetrics(courseData);
  const orderMetrics = calculateMetrics(orderData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={headerVariants} initial="hidden" animate="visible" className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {userName ? `Welcome, ${userName}` : "Admin Analytics Overview"}
          </p>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8"
            >
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 max-w-2xl mx-auto rounded-lg shadow-md">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800 dark:text-red-300 font-semibold">Error</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-400">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-300" />
              <CardHeader className="bg-blue-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <CardTitle className="text-lg font-semibold">Users</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span className={`font-medium ${userMetrics.growth >= 0 ? "text-green-200" : "text-red-200"}`}>
                      {userMetrics.growth >= 0 ? "+" : ""}{userMetrics.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-end space-x-2">
                    <span className="text-2xl font-bold text-blue-600">{userMetrics.total.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">total</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Latest Month</span>
                    <span className="font-medium text-blue-600">{userMetrics.latest.toLocaleString()}</span>
                  </div>
                  {userData.labels.length > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {userData.labels[userData.labels.length - 1]}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover" transition={{ delay: 0.1 }}>
            <Card className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-all duration-300" />
              <CardHeader className="bg-emerald-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <CardTitle className="text-lg font-semibold">Courses</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span className={`font-medium ${courseMetrics.growth >= 0 ? "text-green-200" : "text-red-200"}`}>
                      {courseMetrics.growth >= 0 ? "+" : ""}{courseMetrics.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-end space-x-2">
                    <span className="text-2xl font-bold text-emerald-600">{courseMetrics.total.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">total</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Latest Month</span>
                    <span className="font-medium text-emerald-600">{courseMetrics.latest.toLocaleString()}</span>
                  </div>
                  {courseData.labels.length > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {courseData.labels[courseData.labels.length - 1]}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants} whileHover="hover" transition={{ delay: 0.2 }}>
            <Card className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-red-500/10 group-hover:from-amber-500/20 group-hover:to-red-500/20 transition-all duration-300" />
              <CardHeader className="bg-amber-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-5 h-5" />
                    <CardTitle className="text-lg font-semibold">Orders</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span className={`font-medium ${orderMetrics.growth >= 0 ? "text-green-200" : "text-red-200"}`}>
                      {orderMetrics.growth >= 0 ? "+" : ""}{orderMetrics.growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-end space-x-2">
                    <span className="text-2xl font-bold text-amber-600">{orderMetrics.total.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">total</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Latest Month</span>
                    <span className="font-medium text-amber-600">{orderMetrics.latest.toLocaleString()}</span>
                  </div>
                  {orderData.labels.length > 0 && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      {orderData.labels[orderData.labels.length - 1]}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Latest Users Table */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8">
          <Card className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Latest Users (Last Month)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {latestUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-600 dark:text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-600 dark:text-gray-300">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latestUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-gray-800 dark:text-gray-200">{user.name}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">{user.email}</TableCell>
                        <TableCell className="text-gray-800 dark:text-gray-200">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-[150px] text-gray-500">
                  <div className="text-center">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No recent users available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={chartVariants}>
            <Card className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="p-4 bg-blue-50 dark:bg-blue-900/20">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    User Growth Trend
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[350px]">
                  {userData.labels.length ? (
                    <Line data={createChartData(userData, "users")} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No user data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={chartVariants}>
            <Card className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="p-4 bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Course Creation Trend
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[350px]">
                  {courseData.labels.length ? (
                    <Line data={createChartData(courseData, "courses")} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No course data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={chartVariants} className="lg:col-span-2">
            <Card className="relative bg-white dark:bg-gray-800/90 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="p-4 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Order Activity Trend
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[400px]">
                  {orderData.labels.length ? (
                    <Line data={createChartData(orderData, "orders")} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No order data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}