'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTheme } from 'next-themes'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark'

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/forbidden')
    }
  }, [user, router])

  if (!user || user.role !== 'admin') {
    return null // Prevent rendering until redirect
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`w-64 p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
          <nav className="space-y-2">
            <a href="#dashboard" className={`block p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>Dashboard</a>
            <a href="#users" className={`block p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>Users</a>
            <a href="#courses" className={`block p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>Courses</a>
            <button onClick={logout} className={`w-full text-left p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>Logout</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className={isDark ? 'bg-gray-800' : 'bg-white'}>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl">1,234</p>
              </CardContent>
            </Card>
            <Card className={isDark ? 'bg-gray-800' : 'bg-white'}>
              <CardHeader>
                <CardTitle>Active Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl">45</p>
              </CardContent>
            </Card>
            <Card className={isDark ? 'bg-gray-800' : 'bg-white'}>
              <CardHeader>
                <CardTitle>New Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl">89</p>
              </CardContent>
            </Card>
          </div>
          <Card className={isDark ? 'bg-gray-800' : 'bg-white'}>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>john@example.com</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>
                      <button className="text-blue-500 hover:text-blue-700">Edit</button>
                      <button className="ml-2 text-red-500 hover:text-red-700">Delete</button>
                    </TableCell>
                  </TableRow>
                  {/* Add more rows dynamically from API */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}