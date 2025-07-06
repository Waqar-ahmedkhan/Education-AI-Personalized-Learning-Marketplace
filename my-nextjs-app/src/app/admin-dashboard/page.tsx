'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, UserPlus } from 'lucide-react'

export default function AdminDashboard() {
  const { userRole } = useAuth()
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark'

  useEffect(() => {
    if (!userRole || userRole !== 'admin') {
      router.push('/forbidden')
    }
  }, [userRole, router])

  if (!userRole || userRole !== 'admin') {
    return null
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          Admin Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
            <CardHeader className="flex items-center space-x-3">
              <Users className="w-6 h-6 text-blue-500" />
              <CardTitle className="text-lg font-semibold">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-500">1,234</p>
              <p className="text-sm text-gray-500 mt-1">+5% from last month</p>
            </CardContent>
          </Card>
          <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
            <CardHeader className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-green-500" />
              <CardTitle className="text-lg font-semibold">Active Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">45</p>
              <p className="text-sm text-gray-500 mt-1">+3 new this week</p>
            </CardContent>
          </Card>
          <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg hover:shadow-xl transition-shadow duration-300`}>
            <CardHeader className="flex items-center space-x-3">
              <UserPlus className="w-6 h-6 text-purple-500" />
              <CardTitle className="text-lg font-semibold">New Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-500">89</p>
              <p className="text-sm text-gray-500 mt-1">+12 today</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                  <TableCell>John Doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" className="text-blue-500 hover:text-blue-700 border-blue-500">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 border-red-500">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
                {/* Add more rows dynamically from API */}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}