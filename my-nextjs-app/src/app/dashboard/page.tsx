"use client'"
import { useAuth } from '@/lib/auth'

export default function DashboardPage() {
  const { userRole } = useAuth()

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard Overview</h2>
      <p>Welcome, Admin! Your role is: {userRole}</p>
    </div>
  )
}