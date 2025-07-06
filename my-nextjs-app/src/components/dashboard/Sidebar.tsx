'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { FaUsers, FaBook, FaChartBar, FaBell, FaShoppingCart, FaCogs } from 'react-icons/fa'

export default function Sidebar() {
  const router = useRouter()
  const { logout } = useAuth()

  const menuItems = [
    { name: 'Users', path: '/admin-dashboard/users', icon: <FaUsers /> },
    { name: 'Courses', path: '/admin-dashboard/courses', icon: <FaBook /> },
    { name: 'Analytics', path: '/admin-dashboard/analytics', icon: <FaChartBar /> },
    { name: 'Notifications', path: '/admin-dashboard/notifications', icon: <FaBell /> },
    { name: 'Orders', path: '/admin-dashboard/orders', icon: <FaShoppingCart /> },
    { name: 'Layouts', path: '/admin-dashboard/layouts', icon: <FaCogs /> },
  ]

  return (
    <div className="w-64 h-screen bg-gray-800 text-white fixed">
      <div className="p-4">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center p-4 hover:bg-gray-700 cursor-pointer"
            onClick={() => router.push(item.path)}
          >
            {item.icon}
            <span className="ml-2">{item.name}</span>
          </div>
        ))}
        <div
          className="flex items-center p-4 hover:bg-gray-700 cursor-pointer"
          onClick={logout}
        >
          <span>Logout</span>
        </div>
      </nav>
    </div>
  )
}