// app/admin-dashboard/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';

// Interface for analytics data (labels and data points for charts)
interface AnalyticsData {
  labels: string[];
  data: number[];
}

// Interface for API responses from analytics endpoints
interface ApiResponse<T> {
  success: boolean;
  users?: T;
  courses?: T;
  orders?: T;
  data?: T;
  message?: string;
}

// Interface for token refresh response
interface RefreshTokenResponse {
  status: string;
  access_token: string;
}

// Interface for auth context
interface AuthContextType {
  token: string | null;
  userRole: string | null;
  userName: string | null;
  isLoading: boolean;
}

// Register Chart.js components for line charts
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Enhanced animation variants for smoother transitions
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

const chartVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

export default function AnalyticsSection() {
  const { token, userRole, userName, isLoading } = useAuth() as AuthContextType;
  const router = useRouter();

  // Initialize state with valid AnalyticsData to prevent undefined
  const [userData, setUserData] = useState<AnalyticsData>({ labels: [], data: [] });
  const [courseData, setCourseData] = useState<AnalyticsData>({ labels: [], data: [] });
  const [orderData, setOrderData] = useState<AnalyticsData>({ labels: [], data: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Redirect non-admin users or unauthenticated users to forbidden page
  useEffect(() => {
    if (!isLoading && (!token || userRole !== 'admin')) {
      router.push('/forbidden?error=Access denied. Admin role required.');
    }
  }, [isLoading, token, userRole, router]);

  // Function to refresh access token when 401 error occurs
  const refreshToken = async (): Promise<string | null> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await axios.get<RefreshTokenResponse>(
        `${baseUrl}/api/v1/user/refresh`,
        { withCredentials: true }
      );

      if (res.data.status === 'success' && res.data.access_token) {
        Cookies.set('access_token', res.data.access_token, {
          expires: 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        return res.data.access_token;
      }
      throw new Error('Failed to refresh token: Invalid response');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && 'response' in err
          ? // @ts-ignore
            err.response?.data?.message || err.message
          : 'Unknown error during token refresh';
      console.error('Token refresh error:', errorMessage);
      toast.error('Session expired. Please log in again.');
      router.push('/auth/admin-login?error=Session expired. Please log in again.');
      return null;
    }
  };

  // Fetch analytics data function
  const fetchAnalytics = async (currentToken: string) => {
    if (!currentToken || userRole !== 'admin') return;

    try {
      setLoading(true);
      setError('');
      const headers = { Authorization: `Bearer ${currentToken}` };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const fetchWithErrorHandling = async (
        url: string,
        endpointName: string,
        dataKey: 'users' | 'courses' | 'orders'
      ): Promise<AnalyticsData> => {
        try {
          const res = await axios.get<ApiResponse<AnalyticsData>>(url, { headers });
          if (res.data.success) {
            const data = res.data[dataKey] || res.data.data;
            return data && Array.isArray(data.labels) && Array.isArray(data.data)
              ? data
              : { labels: [], data: [] };
          }
          toast.error(`${endpointName} request failed: ${res.data.message || 'Unknown error'}`);
          return { labels: [], data: [] };
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error && 'response' in err
              ? // @ts-ignore
                err.response?.data?.message || err.message
              : 'Unknown error';
          if (err instanceof Error && 'response' in err && err.response?.status === 404) {
            toast.error(`${endpointName} endpoint not found`);
            return { labels: [], data: [] };
          }
          if (err instanceof Error && 'response' in err && err.response?.status === 500) {
            toast.error(`${endpointName} server error`);
            return { labels: [], data: [] };
          }
          throw err;
        }
      };

      const [usersData, coursesData, ordersData] = await Promise.all([
        fetchWithErrorHandling(`${baseUrl}/api/v1/get-users-analytics`, 'Users analytics', 'users'),
        fetchWithErrorHandling(`${baseUrl}/api/v1/get-courses-analytics`, 'Courses analytics', 'courses'),
        fetchWithErrorHandling(`${baseUrl}/api/v1/get-orders-analytics`, 'Orders analytics', 'orders'),
      ]);

      setUserData(usersData);
      setCourseData(coursesData);
      setOrderData(ordersData);

      const warnings: string[] = [];
      if (!usersData.labels.length) warnings.push('Users analytics unavailable');
      if (!coursesData.labels.length) warnings.push('Courses analytics unavailable');
      if (!ordersData.labels.length) warnings.push('Orders analytics unavailable');

      if (warnings.length > 0) {
        const warningMessage = `Some data unavailable: ${warnings.join(', ')}`;
        setError(warningMessage);
        toast.error(warningMessage);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && 'response' in err
          ? // @ts-ignore
            err.response?.data?.message || err.message
          : 'Failed to load analytics data. Check server configuration.';
      if (err instanceof Error && 'response' in err && err.response?.status === 401) {
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
    if (!isLoading && token && userRole === 'admin') fetchAnalytics(token);
  }, [token, userRole, isLoading, router]);

  // Manual refresh function
  const handleRefresh = async () => {
    if (!token) return;
    setRefreshing(true);
    await fetchAnalytics(token);
  };

  // Calculate total and growth metrics
  const calculateMetrics = (data: AnalyticsData) => {
    const total = data.data.reduce((sum, count) => sum + count, 0);
    const latest = data.data[data.data.length - 1] || 0;
    const previous = data.data[data.data.length - 2] || 0;
    const growth = previous > 0 ? ((latest - previous) / previous) * 100 : 0;

    return { total, latest, growth };
  };

  // Configure chart data for line charts
  const createChartData = (data: AnalyticsData, type: 'users' | 'courses' | 'orders'): ChartData<'line'> => {
    const colors = {
      users: {
        border: '#6366f1',
        background: 'rgba(99, 102, 241, 0.1)',
        gradient: 'rgba(99, 102, 241, 0.3)',
      },
      courses: {
        border: '#10b981',
        background: 'rgba(16, 185, 129, 0.1)',
        gradient: 'rgba(16, 185, 129, 0.3)',
      },
      orders: {
        border: '#f59e0b',
        background: 'rgba(245, 158, 11, 0.1)',
        gradient: 'rgba(245, 158, 11, 0.3)',
      },
    };

    return {
      labels: data.labels,
      datasets: [
        {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          data: data.data,
          borderColor: colors[type].border,
          backgroundColor: colors[type].background,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: colors[type].border,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: colors[type].border,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
          borderWidth: 3,
        },
      ],
    };
  };

  // Enhanced chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 14, weight: 600 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 }, maxRotation: 45 },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: {
          font: { size: 12 },
          callback: (value) => value.toLocaleString(),
        },
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
  };

  // Show loading spinner
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-slate-600 dark:text-slate-400"
          >
            Loading Analytics...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const userMetrics = calculateMetrics(userData);
  const courseMetrics = calculateMetrics(courseData);
  const orderMetrics = calculateMetrics(orderData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header Section */}
        <motion.div variants={headerVariants} initial="hidden" animate="visible" className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            {userName ? `Welcome back, ${userName}` : 'Welcome to your analytics overview'}
          </p>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-8">
              <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 max-w-2xl mx-auto">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertTitle className="text-red-800 dark:text-red-400">Warning</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Users Card */}
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-full">
                        <Users className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-semibold">Users</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span className={`font-medium ${userMetrics.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                        {userMetrics.growth >= 0 ? '+' : ''}{userMetrics.growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-end space-x-2">
                      <span className="text-3xl font-bold text-indigo-600">{userMetrics.total.toLocaleString()}</span>
                      <span className="text-sm text-slate-500 mb-1">total</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Latest Month</span>
                      <span className="font-medium text-indigo-600">{userMetrics.latest.toLocaleString()}</span>
                    </div>
                    {userData.labels.length > 0 && (
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {userData.labels[userData.labels.length - 1]}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Courses Card */}
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-full">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-semibold">Courses</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span className={`font-medium ${courseMetrics.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                        {courseMetrics.growth >= 0 ? '+' : ''}{courseMetrics.growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-end space-x-2">
                      <span className="text-3xl font-bold text-emerald-600">{courseMetrics.total.toLocaleString()}</span>
                      <span className="text-sm text-slate-500 mb-1">total</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Latest Month</span>
                      <span className="font-medium text-emerald-600">{courseMetrics.latest.toLocaleString()}</span>
                    </div>
                    {courseData.labels.length > 0 && (
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {courseData.labels[courseData.labels.length - 1]}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Orders Card */}
            <motion.div variants={cardVariants} whileHover="hover">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden md:col-span-2 lg:col-span-1">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-full">
                        <ShoppingCart className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg font-semibold">Orders</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span className={`font-medium ${orderMetrics.growth >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                        {orderMetrics.growth >= 0 ? '+' : ''}{orderMetrics.growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-end space-x-2">
                      <span className="text-3xl font-bold text-amber-600">{orderMetrics.total.toLocaleString()}</span>
                      <span className="text-sm text-slate-500 mb-1">total</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Latest Month</span>
                      <span className="font-medium text-amber-600">{orderMetrics.latest.toLocaleString()}</span>
                    </div>
                    {orderData.labels.length > 0 && (
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {orderData.labels[orderData.labels.length - 1]}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Growth Chart */}
            <motion.div variants={chartVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      User Growth Trend
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    {userData.labels.length ? (
                      <Line data={createChartData(userData, 'users')} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-slate-500">
                          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No user data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Creation Chart */}
            <motion.div variants={chartVariants}>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      Course Creation
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="h-80">
                    {courseData.labels.length ? (
                      <Line data={createChartData(courseData, 'courses')} options={chartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center text-slate-500">
                          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No course data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Orders Chart - Full Width */}
          <motion.div variants={chartVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <ShoppingCart className="w-5 h-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                    Order Activity Overview
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-96">
                  {orderData.labels.length ? (
                    <Line data={createChartData(orderData, 'orders')} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-slate-500">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
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