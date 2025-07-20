'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import NotificationList from '@/components/dashboard/NotificationList';
import axios from 'axios';

const NotificationsPage: React.FC = () => {
  const { isAdmin, isLoading, isTokenExpired, token } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!isLoading && (!isAdmin || isTokenExpired)) {
      router.push('/auth/login?error=Admin+access+required');
    }
  }, [isAdmin, isLoading, isTokenExpired, router]);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    if (!title.trim() || !message.trim()) {
      setFormError('Title and message are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.post<{ success: boolean; message: string }>(
        `${baseUrl}/api/v1/send-notification`,
        { title, message },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setFormSuccess('Notification sent successfully!');
        setTitle('');
        setMessage('');
      } else {
        setFormError('Failed to send notification.');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setFormError('Session expired. Please log in again.');
        router.push('/auth/login');
      } else {
        setFormError('Error sending notification.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
    >
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center space-x-4">
            <Bell className="h-9 w-9 text-blue-600 dark:text-blue-400" />
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Notification Center
            </h2>
          </div>
        </motion.div>

        {/* Notification Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Send New Notification
          </h3>
          <form onSubmit={handleSendNotification} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 p-3"
                placeholder="Enter notification title"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200 p-3"
                placeholder="Enter notification message"
              ></textarea>
            </div>
            {formError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 dark:text-red-400 text-sm"
              >
                {formError}
              </motion.p>
            )}
            {formSuccess && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 dark:text-green-400 text-sm"
              >
                {formSuccess}
              </motion.p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Send className="h-5 w-5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Notification'}</span>
              </button>
            </div>
          </form>
        </motion.div>

        <NotificationList />
      </div>
    </motion.div>
  );
};

export default NotificationsPage;