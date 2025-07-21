// components/dashboard/OrderList.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Package, AlertCircle } from 'lucide-react';

interface Order {
  _id: string;
  courseId: string;
  userId: string;
  payment_info?: {
    id: string;
    status: string;
    amount: number;
  };
  createdAt: string;
  courseName?: string; // Added for display (assumed to be populated by backend or joined data)
  userName?: string; // Added for display
}

interface OrderListProps {
  theme: 'light' | 'dark';
}

const OrderList: React.FC<OrderListProps> = ({ theme }) => {
  const { token, isAdmin, isLoading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Fetch orders
  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Admin role required.');
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await axios.post<{ success: boolean; orders: Order[] }>(
          `${baseUrl}/api/v1/get-orders`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setOrders(res.data.orders);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          logout();
        } else {
          setError('Error fetching orders');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token && isAdmin) {
      fetchOrders();
    }
  }, [token, isAdmin, logout, baseUrl]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center text-red-500 p-6">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Access denied. You must be an admin to view this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-6">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 p-6">
          <Package className="h-8 w-8 mx-auto mb-2" />
          <p>No orders available.</p>
        </div>
      ) : (
        <>
          {/* Desktop: Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table
              className={`min-w-full rounded-lg shadow-md ${
                theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              }`}
            >
              <thead>
                <tr
                  className={`${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <th className="px-4 py-3 text-left text-sm font-semibold">Order ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Course</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-3 text-sm">{order._id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm">{order.courseName || order.courseId}</td>
                    <td className="px-4 py-3 text-sm">{order.userName || order.userId}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.payment_info?.amount
                        ? `$${(order.payment_info.amount / 100).toFixed(2)}`
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.payment_info?.status || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile: Card View */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg shadow-md ${
                  theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                }`}
              >
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Order ID:</span> {order._id.slice(0, 8)}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Course:</span>{' '}
                    {order.courseName || order.courseId}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">User:</span> {order.userName || order.userId}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Amount:</span>{' '}
                    {order.payment_info?.amount
                      ? `$${(order.payment_info.amount / 100).toFixed(2)}`
                      : 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Status:</span>{' '}
                    {order.payment_info?.status || 'N/A'}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Date:</span>{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderList;