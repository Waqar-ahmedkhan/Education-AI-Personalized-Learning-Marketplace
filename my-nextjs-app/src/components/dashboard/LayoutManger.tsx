'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/auth'
import { toast } from 'react-hot-toast'

interface Layout {
  _id: string
  type: string
  content: string
}

export default function LayoutManager() {
  const [layouts, setLayouts] = useState<Layout[]>([])
  const [newLayout, setNewLayout] = useState({ type: '', content: '' })
  const [error, setError] = useState('')
  const { token } = useAuth()

  const fetchLayouts = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-layout/:type`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setLayouts(res.data.layouts)
    } catch (err) {
      setError('Failed to fetch layouts')
      toast.error('Failed to fetch layouts')
    }
  }

  useEffect(() => {
    fetchLayouts()
  }, [token])

  const handleCreateLayout = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/create-layout`,
        newLayout,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewLayout({ type: '', content: '' })
      fetchLayouts()
      toast.success('Layout created successfully')
    } catch (err) {
      setError('Failed to create layout')
      toast.error('Failed to create layout')
    }
  }

  return (
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Layout</h3>
        <form onSubmit={handleCreateLayout} className="flex space-x-4">
          <input
            type="text"
            placeholder="Type"
            value={newLayout.type}
            onChange={(e) => setNewLayout({ ...newLayout, type: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Content"
            value={newLayout.content}
            onChange={(e) => setNewLayout({ ...newLayout, content: e.target.value })}
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
      <ul className="bg-white shadow-md rounded">
        {layouts.map((layout) => (
          <li key={layout._id} className="p-4 border-b hover:bg-gray-100">
            <p>Type: {layout.type}</p>
            <p>Content: {layout.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}