'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/auth'

interface AnalyticsData {
  labels: string[]
  data: number[]
}

export default function AnalyticsChart() {
  const [userAnalytics, setUserAnalytics] = useState<AnalyticsData>({ labels: [], data: [] })
  // const [orderAnalytics, setOrderAnalytics] = useState<AnalyticsData>({ labels: [], data: [] })
  const [courseAnalytics, setCourseAnalytics] = useState<AnalyticsData>({ labels: [], data: [] })
  const { token } = useAuth()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [users,  courses] = await Promise.all([
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
        // setOrderAnalytics(orders.data as AnalyticsData)
        setCourseAnalytics(courses.data as AnalyticsData)
      } catch (err) {
        console.error('Failed to fetch analytics:', err)
      }
    }
    fetchAnalytics()
  }, [token])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 shadow-md rounded">
        <h3 className="text-lg font-semibold mb-4">User Analytics</h3>
        {/* Example using react-chartjs-2 */}
        {/* 
        import { Line } from 'react-chartjs-2'
        */}
        {/* 
        <Line
          data={{
            labels: userAnalytics.labels,
            datasets: [
              {
                label: "Users",
                data: userAnalytics.data,
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                fill: true,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: { y: { beginAtZero: true } },
          }}
        />
        */}
            <div className="text-gray-400 text-sm">
              Chart will be rendered here using a chart library like react-chartjs-2.
            </div>
            <div className="mt-2 text-xs text-gray-600">
              User Labels: {userAnalytics.labels.join(', ')}
            </div>
            <div className="mt-1 text-xs text-gray-600">
              User Data: {userAnalytics.data.join(', ')}
            </div>
          </div>
          <div className="bg-white p-4 shadow-md rounded">
            <h3 className="text-lg font-semibold mb-4">Course Analytics</h3>
            <div className="text-gray-400 text-sm">
              Chart will be rendered here using a chart library like react-chartjs-2.
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Course Labels: {courseAnalytics.labels.join(', ')}
            </div>
            <div className="mt-1 text-xs text-gray-600">
              Course Data: {courseAnalytics.data.join(', ')}
            </div>
          </div>
        </div>
  )
}