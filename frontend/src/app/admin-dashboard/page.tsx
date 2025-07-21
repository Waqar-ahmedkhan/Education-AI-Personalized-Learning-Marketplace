'use client';

import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { userRole,  isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 border-4 border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!userRole || userRole !== 'admin') {
    return null;
  }

  const stats = [
    {
      title: 'Total Users',
      value: '12,345',
      change: '+12.5%',
      changeType: 'positive',
      icon: Users,
      color: 'blue',
      description: 'Active registered users'
    },
    {
      title: 'Active Courses',
      value: '89',
      change: '+8.2%',
      changeType: 'positive',
      icon: BookOpen,
      color: 'emerald',
      description: 'Live course offerings'
    },
    {
      title: 'New Registrations',
      value: '2,456',
      change: '+15.3%',
      changeType: 'positive',
      icon: UserPlus,
      color: 'purple',
      description: 'This month'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+23.1%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'amber',
      description: 'Monthly earnings'
    },
    {
      title: 'Completion Rate',
      value: '78.5%',
      change: '+5.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'rose',
      description: 'Course completion'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: '+0.1%',
      changeType: 'positive',
      icon: Activity,
      color: 'slate',
      description: 'Server uptime'
    }
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Instructor', status: 'Active', joinDate: '2024-01-14' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Student', status: 'Inactive', joinDate: '2024-01-13' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Student', status: 'Active', joinDate: '2024-01-12' },
    { id: 5, name: 'David Brown', email: 'david@example.com', role: 'Instructor', status: 'Active', joinDate: '2024-01-11' }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      emerald: 'from-emerald-500 to-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      amber: 'from-amber-500 to-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
      rose: 'from-rose-500 to-rose-600 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
      slate: 'from-slate-500 to-slate-600 bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Monitor your platform&apos;s performance and user activity
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button size="sm" className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses.split(' ')[0]} ${colorClasses.split(' ')[1]}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {stat.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {stat.value}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            stat.changeType === 'positive' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            vs last month
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  Recent Users
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Latest user registrations and activity
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </Button>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">User</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Role</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Join Date</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {user.name}
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'Instructor' 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 text-slate-600 dark:text-slate-400">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2 text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}