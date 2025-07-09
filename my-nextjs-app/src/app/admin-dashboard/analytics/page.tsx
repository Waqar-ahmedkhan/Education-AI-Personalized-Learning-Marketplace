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
import { AlertCircle, Users, BookOpen, ShoppingCart } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Cookies from 'js-cookie';
import {     } from  '@/types/Analytics'


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

// Animation variants for smooth card transitions
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
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
      // Send request to refresh endpoint with cookies
      const res = await axios.get<RefreshTokenResponse>(
        `${baseUrl}/api/v1/user/refresh`,
        { withCredentials: true }
      );
      console.log('Token refresh response:', res.data);
      if (res.data.status === 'success' && res.data.access_token) {
        // Set new access token in cookies
        Cookies.set('access_token', res.data.access_token, {
          expires: 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        // Note: refresh_token is set as httpOnly by backend
        return res.data.access_token;
      }
      throw new Error('Failed to refresh token: Invalid response');
    } catch (err: unknown) {
      // Handle errors safely
      const errorMessage = err instanceof Error && 'response' in err
        ? err.response?.data?.message || err.message
        : 'Unknown error during token refresh';
      console.error('Token refresh error:', errorMessage);
      toast.error('Session expired. Please log in again.');
      router.push('/auth/admin-login?error=Session expired. Please log in again.');
      return null;
    }
  };

  // Fetch analytics data for users, courses, and orders
  useEffect(() => {
    const fetchAnalytics = async (currentToken: string) => {
      if (!currentToken || userRole !== 'admin') return;

      try {
        setLoading(true);
        setError('');
        const headers = { Authorization: `Bearer ${currentToken}` };
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        // Helper function to fetch data from an endpoint with error handling
        const fetchWithErrorHandling = async (url: string, endpointName: string, dataKey: 'users' | 'courses' | 'orders'): Promise<AnalyticsData> => {
          try {
            console.log(`Fetching ${endpointName}: ${url}`);
            const res = await axios.get<ApiResponse<AnalyticsData>>(url, { headers });
            console.log(`${endpointName} response:`, res.data);
            if (res.data.success) {
              // Ensure valid AnalyticsData structure
              const data = res.data[dataKey] || res.data.data;
              return data && Array.isArray(data.labels) && Array.isArray(data.data)
                ? data
                : { labels: [], data: [] };
            }
            console.warn(`${endpointName} request failed: success=false`, res.data.message);
            toast.error(`${endpointName} request failed: ${res.data.message || 'Unknown error'}`);
            return { labels: [], data: [] };
          } catch (err: unknown) {
            // Type-safe error handling
            const errorMessage = err instanceof Error && 'response' in err
              ? err.response?.data?.message || err.message
              : 'Unknown error';
            console.error(`${endpointName} error:`, {
              status: err instanceof Error && 'response' in err ? err.response?.status : 'unknown',
              message: errorMessage,
              data: err instanceof Error && 'response' in err ? err.response?.data : null,
            });
            if (err instanceof Error && 'response' in err && err.response?.status === 404) {
              toast.error(`${endpointName} endpoint not found`);
              return { labels: [], data: [] };
            }
            if (err instanceof Error && 'response' in err && err.response?.status === 500) {
              toast.error(`${endpointName} server error`);
              return { labels: [], data: [] };
            }
            throw err; // Rethrow for 401 handling
          }
        };

        // Fetch all analytics endpoints concurrently
        const [usersData, coursesData, ordersData] = await Promise.all([
          fetchWithErrorHandling(`${baseUrl}/api/v1/get-users-analytics`, 'Users analytics', 'users'),
          fetchWithErrorHandling(`${baseUrl}/api/v1/get-courses-analytics`, 'Courses analytics', 'courses'),
          fetchWithErrorHandling(`${baseUrl}/api/v1/get-orders-analytics`, 'Orders analytics', 'orders'),
        ]);

        // Update state with validated data
        setUserData(usersData);
        setCourseData(coursesData);
        setOrderData(ordersData);

        // Collect warnings for failed endpoints
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
        // Handle global errors, including 401 for token refresh
        const errorMessage = err instanceof Error && 'response' in err
          ? err.response?.data?.message || err.message
          : 'Failed to load analytics data. Check server configuration.';
        if (err instanceof Error && 'response' in err && err.response?.status === 401) {
          const newToken = await refreshToken();
          if (newToken) {
            fetchAnalytics(newToken); // Retry with new token
            return;
          }
        }
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading && token && userRole === 'admin') fetchAnalytics(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userRole, isLoading, router]);

  // Configure chart data for line charts
  const createChartData = (
    data: AnalyticsData,
    type: 'users' | 'courses' | 'orders'
  ): ChartData<'line'> => ({
    labels: data.labels,
    datasets: [
      {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        data: data.data,
        borderColor: type === 'users' ? '#4f46e5' : type === 'courses' ? '#22c55e' : '#ef4444',
        backgroundColor:
          type === 'users' ? 'rgba(79, 70, 229, 0.2)' : type === 'courses' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: type === 'users' ? '#4f46e5' : type === 'courses' ? '#22c55e' : '#ef4444',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: type === 'users' ? '#4f46e5' : type === 'courses' ? '#22c55e' : '#ef4444',
      },
    ],
  });

  // Chart options for consistent styling
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'text-text',
          font: { size: 14, weight: 500 },
        },
      },
      title: {
        display: true,
        text: 'Count',
        color: 'text-text',
        font: { size: 14 },
      },
      tooltip: {
        backgroundColor: 'bg-gray-800',
        titleColor: 'text-text',
        bodyColor: 'text-text',
        borderColor: 'border-border',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
          color: 'text-text',
          font: { size: 14 },
        },
        ticks: { color: 'text-text', font: { size: 12 } },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: 'Count',
          color: 'text-text',
          font: { size: 14 },
        },
        ticks: { color: 'text-text', font: { size: 12 } },
        grid: { color: 'border-border', lineWidth: 1 },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Show loading spinner while data is being fetched
  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Render analytics dashboard
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-4xl font-extrabold mb-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
      >
        Analytics Overview{userName ? `, ${userName}` : ''}
      </motion.h1>

      {/* Display warning if some data is unavailable */}
      {error && (
        <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive max-w-md mx-auto">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-semibold">Warning</AlertTitle>
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* Users Card */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-background border-border shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="flex items-center space-x-3 bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold text-text">Total Users</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-3xl font-bold text-primary">
                  {userData.data && Array.isArray(userData.data)
                    ? userData.data.reduce((sum, count) => sum + count, 0).toLocaleString()
                    : '0'}
                </p>
                <p className="text-sm text-muted mt-1">
                  {userData.labels.length > 0
                    ? `Latest: ${userData.data[userData.data.length - 1].toLocaleString()} in ${userData.labels[userData.labels.length - 1]}`
                    : 'No user data available'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Courses Card */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card className="bg-background border-border shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="flex items-center space-x-3 bg-gradient-to-r from-green-500/10 to-green-400/10 p-4">
                <div className="p-2 bg-green-500/20 rounded-full">
                  <BookOpen className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-lg font-semibold text-text">Total Courses</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-3xl font-bold text-green-500">
                  {courseData.data && Array.isArray(courseData.data)
                    ? courseData.data.reduce((sum, count) => sum + count, 0).toLocaleString()
                    : '0'}
                </p>
                <p className="text-sm text-muted mt-1">
                  {courseData.labels.length > 0
                    ? `Latest: ${courseData.data[courseData.data.length - 1].toLocaleString()} in ${courseData.labels[courseData.labels.length - 1]}`
                    : 'No course data available'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Orders Card */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Card className="bg-background border-border shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
              <CardHeader className="flex items-center space-x-3 bg-gradient-to-r from-red-500/10 to-red-400/10 p-4">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <ShoppingCart className="w-6 h-6 text-red-500" />
                </div>
                <CardTitle className="text-lg font-semibold text-text">Total Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-3xl font-bold text-red-500">
                  {orderData.data && Array.isArray(orderData.data)
                    ? orderData.data.reduce((sum, count) => sum + count, 0).toLocaleString()
                    : '0'}
                </p>
                <p className="text-sm text-muted mt-1">
                  {orderData.labels.length > 0
                    ? `Latest: ${orderData.data[orderData.data.length - 1].toLocaleString()} in ${orderData.labels[orderData.labels.length - 1]}`
                    : 'No order data available'}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="lg:col-span-2">
            <Card className="bg-background border-border shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-text">User Growth (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {userData.labels.length ? (
                  <Line data={createChartData(userData, 'users')} options={chartOptions} />
                ) : (
                  <p className="text-center text-muted">No user data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <Card className="bg-background border-border shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-text">Course Creation (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {courseData.labels.length ? (
                  <Line data={createChartData(courseData, 'courses')} options={chartOptions} />
                ) : (
                  <p className="text-center text-muted">No course data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="lg:col-span-3">
            <Card className="bg-background border-border shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-text">Order Activity (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {orderData.labels.length ? (
                  <Line data={createChartData(orderData, 'orders')} options={chartOptions} />
                ) : (
                  <p className="text-center text-muted">No order data available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}