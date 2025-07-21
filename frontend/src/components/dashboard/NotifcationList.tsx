// components/dashboard/NotificationList.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Bell, CheckCircle, AlertCircle } from 'lucide-react';

interface Notification {
  _id: string;
  title: string;
  message: string;
  status: 'read' | 'unread';
  createdAt: string;
}

interface NotificationListProps {
  theme: 'light' | 'dark';
}

const NotificationList: React.FC<NotificationListProps> = ({ theme }) => {
  const { token, isAdmin, isLoading: authLoading, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Fetch notifications
  useEffect(() => {
    if (!isAdmin) {
      setError('Access denied. Admin role required.');
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get<{ success: boolean; notification: Notification[] }>(
          `${baseUrl}/api/v1/get-all-notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          setNotifications(res.data.notification);
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

  // Handle marking notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await axios.put<{ success: boolean; notificaitons: Notification[] }>(
        `${baseUrl}/api/v1/update-notification/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setNotifications(res.data.notificaitons);
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
      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 p-6">
          <Bell className="h-8 w-8 mx-auto mb-2" />
          <p>No notifications available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg shadow-md ${
                theme === 'dark'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-900'
              } ${notification.status === 'read' ? 'opacity-75' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{notification.title}</h3>
                  <p className="text-sm mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {notification.status === 'unread' && (
                  <button
                    onClick={() => handleMarkAsRead(notification._id)}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Mark as read"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationList;