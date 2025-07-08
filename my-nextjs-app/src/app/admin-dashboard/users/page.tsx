'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/auth';
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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((res.data as { users: User[] }).users);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to fetch users: ${errorMessage}`);
      toast.error('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/update-user-route`,
        { id, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      toast.success('Role updated successfully');
    } catch {
      setError('Failed to update role');
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user-delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      toast.success('User deleted successfully');
    } catch {
      setError('Failed to delete user');
      toast.error('Failed to delete user');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/create-admin`,
        newAdmin,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewAdmin({ email: '', password: '' });
      fetchUsers();
      toast.success('Admin created successfully');
    } catch {
      setError('Failed to create admin');
      toast.error('Failed to create admin');
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg m-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-text-light dark:text-text-dark">
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-text-light dark:text-text-dark">
            Create New Admin
          </h3>
          <form onSubmit={handleCreateAdmin} className="flex space-x-4">
            <Input
              type="email"
              placeholder="Email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark"
              required
            />
            <Button
              type="submit"
              className="bg-primary-light dark:bg-primary-dark text-white hover:bg-primary-dark dark:hover:bg-primary-light"
            >
              Create
            </Button>
          </form>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
              <TableHead className="font-semibold text-text-light dark:text-text-dark">Name</TableHead>
              <TableHead className="font-semibold text-text-light dark:text-text-dark">Email</TableHead>
              <TableHead className="font-semibold text-text-light dark:text-text-dark">Role</TableHead>
              <TableHead className="font-semibold text-text-light dark:text-text-dark">Created At</TableHead>
              <TableHead className="font-semibold text-text-light dark:text-text-dark">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <TableCell className="text-text-light dark:text-text-dark">{user.name}</TableCell>
                <TableCell className="text-text-light dark:text-text-dark">{user.email}</TableCell>
                <TableCell className="text-text-light dark:text-text-dark">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                    className="p-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-text-light dark:text-text-dark rounded"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </TableCell>
                <TableCell className="text-text-light dark:text-text-dark">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 px-2 py-1 rounded"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}