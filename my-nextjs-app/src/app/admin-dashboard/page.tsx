'use client';

import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { userRole, userName, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 border-4 border-indigo-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!userRole || userRole !== 'admin') {
    return null; // Middleware handles redirect to /forbidden
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark">
        Admin Dashboard - Welcome, {userName || 'Admin'}!
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-primary-light dark:text-primary-dark" />
            <CardTitle className="text-lg font-semibold text-text-light dark:text-text-dark">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-light dark:text-primary-dark">1,234</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">+5% from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-green-500 dark:text-green-400" />
            <CardTitle className="text-lg font-semibold text-text-light dark:text-text-dark">
              Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500 dark:text-green-400">45</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">+3 new this week</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex items-center space-x-3">
            <UserPlus className="w-6 h-6 text-secondary-light dark:text-secondary-dark" />
            <CardTitle className="text-lg font-semibold text-text-light dark:text-text-dark">
              New Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-secondary-light dark:text-secondary-dark">89</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">+12 today</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-text-light dark:text-text-dark">
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableHead className="font-semibold text-text-light dark:text-text-dark">Name</TableHead>
                <TableHead className="font-semibold text-text-light dark:text-text-dark">Email</TableHead>
                <TableHead className="font-semibold text-text-light dark:text-text-dark">Role</TableHead>
                <TableHead className="font-semibold text-text-light dark:text-text-dark">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="text-text-light dark:text-text-dark">John Doe</TableCell>
                <TableCell className="text-text-light dark:text-text-dark">john@example.com</TableCell>
                <TableCell className="text-text-light dark:text-text-dark">User</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary-light dark:text-primary-dark border-primary-light dark:border-primary-dark hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 dark:text-red-400 border-red-500 dark:border-red-400 hover:bg-red-500 dark:hover:bg-red-400 hover:text-white"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}