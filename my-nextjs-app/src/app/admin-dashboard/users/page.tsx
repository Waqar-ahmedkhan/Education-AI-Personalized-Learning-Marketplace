'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus,  Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
}

const UserManagement: React.FC = () => {
  const { isAdmin, isLoading, isTokenExpired, token, logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!isLoading && (!isAdmin || isTokenExpired)) {
      router.push('/auth/login?error=Admin+access+required');
    } else if (token) {
      fetchUsers();
    }
  }, [isAdmin, isLoading, isTokenExpired, token, router]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get<{ success: boolean; users: User[] }>(
        `${baseUrl}/api/v1/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setUsers(res.data.users);
        setError(null);
      } else {
        setError('Failed to fetch users');
        toast.error('Failed to fetch users');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        setError('Error fetching users');
        toast.error('Error fetching users');
      }
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      const res = await axios.put<{ success: boolean; message: string }>(
        `${baseUrl}/api/v1/admin/update-user-role`,
        { id, role },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        fetchUsers();
        setSuccess('Role updated successfully');
        toast.success('Role updated successfully');
      } else {
        setError('Failed to update role');
        toast.error('Failed to update role');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        setError('Error updating role');
        toast.error('Error updating role');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axios.delete<{ success: boolean; message: string }>(
        `${baseUrl}/api/v1/admin/user-delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        fetchUsers();
        setSuccess('User deleted successfully');
        toast.success('User deleted successfully');
      } else {
        setError('Failed to delete user');
        toast.error('Failed to delete user');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        setError('Error deleting user');
        toast.error('Error deleting user');
      }
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.password.trim()) {
      setError('Name, email, and password are required.');
      toast.error('Name, email, and password are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post<{ success: boolean; message: string; user: User }>(
        `${baseUrl}/api/v1/admin/create-admin`,
        newAdmin,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setSuccess('Admin created successfully');
        toast.success('Admin created successfully');
        setNewAdmin({ name: '', email: '', password: '' });
        setUsers([...users, res.data.user]);
      } else {
        setError('Failed to create admin');
        toast.error('Failed to create admin');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        toast.error('Session expired. Please log in again.');
        logout();
      } else {
        setError(err.response?.data?.message || 'Error creating admin');
        toast.error(err.response?.data?.message || 'Error creating admin');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center p-12 bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg m-6"
      >
        <Users className="h-12 w-12 mx-auto mb-4 text-red-600 dark:text-red-400" />
        <p className="text-xl font-semibold text-red-600 dark:text-red-300">
          Access denied. Admin role required.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-6"
    >
      <div className="container mx-auto">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 dark:text-red-400 mb-4"
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-500 dark:text-green-400 mb-4"
              >
                {success}
              </motion.p>
            )}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Create New Admin
              </h3>
              <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  type="text"
                  placeholder="Name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="md:col-span-3 bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
                </Button>
              </form>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Name</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Email</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Role</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Created At</TableHead>
                  <TableHead className="font-semibold text-gray-900 dark:text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 dark:text-gray-400">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <TableCell className="text-gray-900 dark:text-white">{user.name}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{user.email}</TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleUpdateRole(user._id, value)}
                        >
                          <SelectTrigger className="w-[120px] border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">
                        {new Date(user.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            onClick={() => handleDelete(user._id)}
                            variant="destructive"
                            className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default UserManagement;