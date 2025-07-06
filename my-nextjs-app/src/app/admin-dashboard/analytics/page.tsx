'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Sun, Moon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

Chart.register(...registerables);

// TypeScript interfaces
interface AnalyticsData {
  month: string;
  count: number;
}

interface AnalyticsResponse {
  success: boolean;
  users?: AnalyticsData[];
  courses?: AnalyticsData[];
  orders?: AnalyticsData[];
}

// Component
const AnalyticsPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [analytics, setAnalytics] = useState<{
    users: AnalyticsData[];
    courses: AnalyticsData[];
    orders: AnalyticsData[];
  }>({ users: [], courses: [], orders: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for canvas elements
  const userChartRef = useRef<HTMLCanvasElement>(null);
  const courseChartRef = useRef<HTMLCanvasElement>(null);
  const orderChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<Chart[]>([]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, coursesRes, ordersRes] = await Promise.all([
          axios.get<AnalyticsResponse>('/api/users-analytics'),
          axios.get<AnalyticsResponse>('/api/courses-analytics'),
          axios.get<AnalyticsResponse>('/api/orders-analytics'),
        ]);

        setAnalytics({
          users: usersRes.data.success ? usersRes.data.users ?? [] : [],
          courses: coursesRes.data.success ? coursesRes.data.courses ?? [] : [],
          orders: ordersRes.data.success ? ordersRes.data.orders ?? [] : [],
        });
      } catch (err) {
        const error = err as { message?: string };
        setError(error?.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Create charts
  useEffect(() => {
    const createChart = (
      canvas: HTMLCanvasElement | null,
      data: AnalyticsData[],
      label: string,
      color: string
    ): Chart | null => {
      if (!canvas || !data.length) return null;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: data.map((item) => item.month),
          datasets: [
            {
              label,
              data: data.map((item) => item.count),
              borderColor: color,
              backgroundColor: `${color}33`,
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointHoverRadius: 8,
              pointBackgroundColor: color,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: theme === 'dark' ? '#d1d5db' : '#111827',
                font: { size: 14, weight: 500 },
              },
            },
            tooltip: {
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              titleColor: theme === 'dark' ? '#ffffff' : '#111827',
              bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              borderWidth: 1,
              padding: 12,
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw}`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: theme === 'dark' ? '#374151' : '#e5e7eb' },
              title: {
                display: true,
                text: 'Count',
                color: theme === 'dark' ? '#d1d5db' : '#111827',
                font: { size: 14 },
              },
              ticks: { color: theme === 'dark' ? '#d1d5db' : '#374151' },
            },
            x: {
              grid: { display: false },
              title: {
                display: true,
                text: 'Month',
                color: theme === 'dark' ? '#d1d5db' : '#111827',
                font: { size: 14 },
              },
              ticks: { color: theme === 'dark' ? '#d1d5db' : '#374151' },
            },
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart',
          },
        },
      };

      const chart = new Chart(ctx, config);
      chartInstances.current.push(chart);
      return chart;
    };

    // Cleanup existing charts
    chartInstances.current.forEach((chart) => chart.destroy());
    chartInstances.current = [];

    // Create new charts
    createChart(userChartRef.current, analytics.users, 'Users', '#3b82f6');
    createChart(courseChartRef.current, analytics.courses, 'Courses', '#10b981');
    createChart(orderChartRef.current, analytics.orders, 'Orders', '#f43f5e');

    return () => {
      chartInstances.current.forEach((chart) => chart.destroy());
    };
  }, [analytics, theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-500`}
    >
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Analytics Dashboard
          </motion.h2>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-gray-800" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm animate-pulse"
                >
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center p-12 bg-red-50 dark:bg-red-900/30 rounded-xl"
            >
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-red-600 dark:text-red-400">{error}</span>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-6">Users Analytics</h3>
                {analytics.users.length ? (
                  <canvas ref={userChartRef}></canvas>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">No user data available</p>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-6">Courses Analytics</h3>
                {analytics.courses.length ? (
                  <canvas ref={courseChartRef}></canvas>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">No course data available</p>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="text-xl font-semibold mb-6">Orders Analytics</h3>
                {analytics.orders.length ? (
                  <canvas ref={orderChartRef}></canvas>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">No order data available</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AnalyticsPage;