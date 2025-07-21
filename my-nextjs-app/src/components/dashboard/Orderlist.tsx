'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Package, AlertCircle, Search } from 'lucide-react';

// Generate unique ID for mock data
const generateId = () => Math.random().toString(36).substr(2, 9);

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
  courseName?: string;
  userName?: string;
}

interface OrderListProps {
  refreshTrigger: number;
}

// Mock orders data (~700 orders)
const mockOrders: Order[] = Array.from({ length: 700 }, (_, i) => ({
  _id: generateId(),
  courseId: `course_${i + 1}`,
  userId: `user_${i + 1}`,
  payment_info: {
    id: `payment_${i + 1}`,
    status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
    amount: Math.random() * 10000 + 5000,
  },
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  courseName: `Course ${i + 1}`,
  userName: `User ${i + 1}`,
}));

const OrderList: React.FC<OrderListProps> = ({ refreshTrigger }) => {
  const { token, isAdmin, isLoading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

        if (res.data.success && res.data.orders.length > 0) {
          setOrders(res.data.orders);
          setFilteredOrders(res.data.orders);
        } else {
          setOrders(mockOrders);
          setFilteredOrders(mockOrders);
          setError('No orders available. Showing sample data.');
        }
      } catch (err: any) {
        console.error('Orders fetch error:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          logout();
        } else {
          setError('Error fetching orders. Showing sample data.');
          setOrders(mockOrders);
          setFilteredOrders(mockOrders);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token && isAdmin) {
      fetchOrders();
    }
  }, [token, isAdmin, logout, baseUrl, refreshTrigger]);

  // Filter orders based on search and status
  useEffect(() => {
    let result = orders;
    if (searchQuery) {
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(
        (order) => order.payment_info?.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders]);

  // Status badge styling
  const getStatusBadge = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100/80 text-green-800 dark:bg-green-900/30 dark:text-green-200 backdrop-blur-md">
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100/80 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 backdrop-blur-md">
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-200 backdrop-blur-md">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100/80 text-gray-800 dark:bg-gray-700/30 dark:text-gray-200 backdrop-blur-md">
            N/A
          </span>
        );
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64 rounded-xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 rounded-xl shadow-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-md text-red-600 dark:text-red-200 max-w-2xl mx-auto"
      >
        <AlertCircle className="h-10 w-10 mx-auto mb-3" />
        <p className="text-xl font-semibold">Access denied. You must be an admin to view this page.</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-8 rounded-xl shadow-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-md text-red-600 dark:text-red-200"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <AlertCircle className="h-10 w-10" />
          <p className="text-xl font-semibold">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by Order ID, Course, or User"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-700/80 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-700/80 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </motion.div>

      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 rounded-xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-500 dark:text-gray-300"
        >
          <Package className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
          <p className="text-xl font-semibold">No orders match your criteria.</p>
        </motion.div>
      ) : (
        <>
          {/* Desktop: Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
              <thead className="bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, 10).map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-b border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {order._id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {order.courseName || order.courseId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {order.userName || order.userId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {order.payment_info?.amount
                        ? `$${(order.payment_info.amount / 100).toFixed(2)}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(order.payment_info?.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile: Card View */}
          <div className="md:hidden space-y-4">
            {filteredOrders.slice(0, 10).map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-6 rounded-xl shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:shadow-2xl transition-shadow duration-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Order ID: {order._id.slice(0, 8)}
                    </p>
                    {getStatusBadge(order.payment_info?.status)}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Course:</span>{' '}
                    {order.courseName || order.courseId}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">User:</span> {order.userName || order.userId}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Amount:</span>{' '}
                    {order.payment_info?.amount
                      ? `$${(order.payment_info.amount / 100).toFixed(2)}`
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredOrders.length > 10 && (
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
              Showing 10 of {filteredOrders.length} orders. Use filters to refine results.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default OrderList;