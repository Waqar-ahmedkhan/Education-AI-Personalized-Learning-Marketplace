'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/auth'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface AnalyticsData {
  labels: string[]
  data: number[]
}

export default function AnalyticsChart() {
  const [userAnalytics, setUserAnalytics] = useState<AnalyticsData>({ labels: [], data: [] })
  const [orderAnalytics, setOrderAnalytics] = useState<AnalyticsData>({ labels: [], data: [] })
  const [courseAnalytics, setCourseAnalytics] = useState<AnalyticsData>({ labels: [], data: [] })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      try {
        const [users, orders, courses] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-users-analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-orders-analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-courses-analytics`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setUserAnalytics(users.data as AnalyticsData)
        setOrderAnalytics(orders.data as AnalyticsData)
        setCourseAnalytics(courses.data as AnalyticsData)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
        setError('Failed to load analytics data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    if (token) {
      fetchAnalytics()
    }
  }, [token])

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
      x: {
        grid: { display: false },
      },
    },
  }

  const createChartData = (analytics: AnalyticsData, label: string, color: string) => ({
    labels: analytics.labels,
    datasets: [
      {
        label,
        data: analytics.data,
        borderColor: color,
        backgroundColor: `${color}33`, // 20% opacity
        fill: true,
        tension: 0.4,
      },
    ],
  })

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time insights into users, orders, and courses.</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">User Analytics</h3>
              <Line
                data={createChartData(userAnalytics, 'Users', '#3b82f6')}
                options={chartOptions}
              />
              <div className="mt-4 text-sm text-gray-600">
                <p>Labels: {userAnalytics.labels.join(', ')}</p>
                <p>Data: {userAnalytics.data.join(', ')}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Order Analytics</h3>
              <Line
                data={createChartData(orderAnalytics, 'Orders', '#10b981')}
                options={chartOptions}
              />
              <div className="mt-4 text-sm text-gray-600">
                <p>Labels: {orderAnalytics.labels.join(', ')}</p>
                <p>Data: {orderAnalytics.data.join(', ')}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Course Analytics</h3>
              <Line
                data={createChartData(courseAnalytics, 'Courses', '#f97316')}
                options={chartOptions}
              />
              <div className="mt-4 text-sm text-gray-600">
                <p>Labels: {courseAnalytics.labels.join(', ')}</p>
                <p>Data: {courseAnalytics.data.join(', ')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}