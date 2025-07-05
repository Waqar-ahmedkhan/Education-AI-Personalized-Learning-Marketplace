"use client"
import Sidebar from '@/components/dashboard/Sidebar'
import Navbar from '@/components/dashboard/Navbar'
import { AuthProvider } from '@/lib/auth'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Navbar />
          <main className="p-6 bg-gray-100 min-h-screen">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}