'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/auth'
import { toast } from 'react-hot-toast'

interface Notification {
  _id: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [error, setError] = useState('')
  const { token } = useAuth()

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-all-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications((res.data as { notifications: Notification[] }).notifications)
    } catch {
      setError('Failed to fetch notifications')
      toast.error('Failed to fetch notifications')
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [token])

  const handleUpdateNotification = async (id: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/update-notification/${id}`,
        { isRead: true },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchNotifications()
      toast.success('Notification marked as read')
    } catch {
      setError('Failed to update notification')
      toast.error('Failed to update notification')
    }
  }

  return (
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul className="bg-white shadow-md rounded">
        {notifications.map((notification) => (
          <li key={notification._id} className="p-4 border-b hover:bg-gray-100">
            <p>{notification.message}</p>
            <p className="text-sm text-gray-500">
              {new Date(notification.createdAt).toLocaleDateString()}
            </p>
            {!notification.isRead && (
              <button
                onClick={() => handleUpdateNotification(notification._id)}
                className="mt-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Mark as Read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}