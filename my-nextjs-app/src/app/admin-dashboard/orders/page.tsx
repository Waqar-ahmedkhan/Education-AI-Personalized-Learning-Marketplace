'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { AlertCircle, Package, RefreshCw } from 'lucide-react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend } from 'chart.js';
import OrderList from '@/components/dashboard/Orderlist';

// Register Chart.js components
ChartJS.register(ArcElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

// Interfaces
interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  failedOrders: number;
  revenueTrend: { date: string; amount: number }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Mock analytics data (~700 orders)
const mockAnalyticsData: AnalyticsData = {
  totalOrders: 10,
  totalRevenue: 400.0,
  completedOrders: 6,
  pendingOrders: 0,
  failedOrders: 4,
  revenueTrend: Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    amount: Math.random() * 20000 + 5000,
  })),
};

const OrdersPage: React.FC = () => {
  const { isAdmin, isLoading: authLoading, isTokenExpired, token } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Fetch analytics data
  useEffect(() => {
    if (!isAdmin || !token) {
      setError('Access denied. Admin role required.');
      setIsLoadingAnalytics(false);
      return;
    }

    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get<ApiResponse<AnalyticsData>>(
          `${baseUrl}/api/v1/get-orders-analytics`,
          { headers, withCredentials: true }
        );

        if (res.data.success && res.data.data && res.data.data.totalOrders !== undefined) {
          setAnalytics(res.data.data);
        } else {
          setAnalytics(mockAnalyticsData);
          setError('No analytics data available. Showing sample data.');
        }
      } catch (err: any) {
        console.error('Analytics fetch error:', err);
        setAnalytics(mockAnalyticsData);
        setError('Failed to fetch analytics data. Showing sample data.');
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    if (token && isAdmin) {
      fetchAnalytics();
    }
  }, [token, isAdmin, baseUrl, refreshTrigger]);

  // Redirect if not admin or token expired
  useEffect(() => {
    if (!authLoading && (!isAdmin || isTokenExpired)) {
      router.push('/auth/login?error=Admin+access+required');
    }
  }, [isAdmin, authLoading, isTokenExpired, router]);

  // Refresh analytics and orders
  const handleRefresh = useCallback(() => {
    setError(null);
    setIsLoadingAnalytics(true);
    setAnalytics(null);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  if (authLoading || isLoadingAnalytics) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 rounded-xl shadow-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-md text-red-600 dark:text-red-200 max-w-2xl mx-auto"
      >
        <AlertCircle className="h-10 w-10 mx-auto mb-3" />
        <p className="text-xl font-semibold">Access denied. You must be an admin to view this page.</p>
      </motion.div>
    );
  }

  // Chart data for Pie (status breakdown)
  const pieData = {
    labels: ['Completed', 'Pending', 'Failed'],
    datasets: [
      {
        data: [
          analytics?.completedOrders || 0,
          analytics?.pendingOrders || 0,
          analytics?.failedOrders || 0,
        ],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for Line (revenue trend)
  const lineData = {
    labels: analytics?.revenueTrend?.map((t) => t.date) ?? [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: analytics?.revenueTrend?.map((t) => t.amount) ?? [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
    >
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 flex justify-between items-center"
        >
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Order Management
            </h2>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              Real-time insights and management for all orders.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 p-6 rounded-xl shadow-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-md text-red-600 dark:text-red-200 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6" />
              <p className="text-base font-semibold">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-100 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button>
          </motion.div>
        )}

        {/* Analytics Section */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="p-6 rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:shadow-2xl transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Orders</h3>
                <p className="mt-2 text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                  {analytics.totalOrders}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="p-6 rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:shadow-2xl transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Revenue</h3>
                <p className="mt-2 text-3xl font-extrabold text-green-600 dark:text-green-400">
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="p-6 rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:shadow-2xl transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed Orders</h3>
                <p className="mt-2 text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {analytics.completedOrders}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="p-6 rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:shadow-2xl transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Orders</h3>
                <p className="mt-2 text-3xl font-extrabold text-yellow-600 dark:text-yellow-400">
                  {analytics.pendingOrders}
                </p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Status Distribution
                </h3>
                <div className="max-w-sm mx-auto">
                  <Pie
                    data={pieData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom', labels: { color: analytics ? '#1F2937' : '#9CA3AF' } },
                      },
                    }}
                  />
                </div>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Revenue Trend (Last 7 Days)
                </h3>
                <Line
                  data={lineData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top', labels: { color: analytics ? '#1F2937' : '#9CA3AF' } },
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { color: analytics ? '#1F2937' : '#9CA3AF' } },
                      x: { ticks: { color: analytics ? '#1F2937' : '#9CA3AF' } },
                    },
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Order List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {analytics?.totalOrders === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 rounded-xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-500 dark:text-gray-300"
            >
              <Package className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-xl font-semibold">No orders available.</p>
            </motion.div>
          ) : (
            <OrderList refreshTrigger={refreshTrigger} />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrdersPage;