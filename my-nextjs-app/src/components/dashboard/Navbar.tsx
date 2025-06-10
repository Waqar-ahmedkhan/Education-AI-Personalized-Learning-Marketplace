'use client'
import { useAuth } from '@/lib/auth'

export default function Navbar() {
  const { logout } = useAuth()

  return (
    <div className="h-16 bg-white shadow-md flex items-center justify-between px-6 ml-64">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  )
}