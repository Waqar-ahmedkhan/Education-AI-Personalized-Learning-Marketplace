'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/auth'
import { toast } from 'react-hot-toast'

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { token } = useAuth()

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUsers((res.data as { users: User[] }).users)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Failed to fetch users: ${err.message}`)
      } else {
        setError('Failed to fetch users')
      }
      toast.error('Failed to fetch users')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const handleUpdateRole = async (id: string, role: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/update-user-route`,
        { id, role },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchUsers()
      toast.success('Role updated successfully')
    } catch {
      setError('Failed to update role')
      toast.error('Failed to update role')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/user-delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchUsers()
      toast.success('User deleted successfully')
    } catch {
      setError('Failed to delete user')
      toast.error('Failed to delete user')
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/create-admin`,
        newAdmin,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewAdmin({ email: '', password: '' })
      fetchUsers()
      toast.success('Admin created successfully')
    } catch {
      setError('Failed to create admin')
      toast.error('Failed to create admin')
    }
  }

  return (
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Admin</h3>
        <form onSubmit={handleCreateAdmin} className="flex space-x-4">
          <input
            type="email"
            placeholder="Email"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create
          </button>
        </form>
      </div>
      <table className="w-full border-collapse bg-white shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-100">
              <td className="p-2 border">{user.name}</td>
              <td className="p-2 border">{user.email}</td>
              <td className="p-2 border">
                <select
                  value={user.role}
                  onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                  className="p-1 border rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="p-2 border">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}