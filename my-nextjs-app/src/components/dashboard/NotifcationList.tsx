'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
}

const NotificationList: React.FC = () => {
  const { token, isAdmin, isLoading: authLoading, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Admin role required.');
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get<{ success: boolean; notifications: Notification[] }>(
          `${baseUrl}/api/v1/get-all-notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setNotifications(res.data.notifications);
        } else {
          setError('Failed to fetch notifications');
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          logout();
        } else {
          setError('Error fetching notifications');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (token && isAdmin) {
      fetchNotifications();
    }
  }, [token, isAdmin, logout, baseUrl]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await axios.put<{ success: boolean; notifications: Notification[] }>(
        `${baseUrl}/api/v1/update-notification/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setNotifications(res.data.notifications);
      } else {
        setError('Failed to update notification');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
      } else {
        setError('Error updating notification');
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center p-12 bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg"
      >
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600 dark:text-red-400" />
        <p className="text-xl font-semibold text-red-600 dark:text-red-300">
          Access denied. Admin role required.
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center p-12 bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-lg"
      >
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600 dark:text-red-400" />
        <p className="text-xl font-semibold text-red-600 dark:text-red-300">{error}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Recent Notifications
      </h3>
      {notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center p-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
        >
          <Bell className="h-12 w-12 mx-auto mb-4 text-gray-500 dark:text-gray-400" />
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">
            No notifications available.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {notifications.map((notification) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              className={`relative p-6 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                notification.status === 'unread'
                  ? 'bg-gradient-to-br from-blue-50 dark:from-blue-900/30 to-white dark:to-gray-800 border-l-4 border-blue-500 dark:border-blue-400'
                  : 'bg-gray-50 dark:bg-gray-800 opacity-90'
              } hover:shadow-xl`}
            >
              <div className="flex justify-between items-start space-x-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {notification.title}
                    </h4>
                    {notification.status === 'unread' && (
                      <span className="inline-block w-2.5 h-2.5 bg-blue-500 dark:bg-blue-400 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-300 line-clamp-3">
                    {notification.message}
                  </p>
                  <div className="flex items-center mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1.5" />
                    <span>
                      {new Date(notification.createdAt).toLocaleString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                {notification.status === 'unread' && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="p-2.5 rounded-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
                    aria-label="Mark as read"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
              {notification.status === 'unread' && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full transform translate-x-1/2 -translate-y-1/2" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;