'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/auth'
import { toast } from 'react-hot-toast'

interface Course {
  _id: string
  title: string
  instructor: string
  createdAt: string
}

export default function CourseTable() {
  const [courses, setCourses] = useState<Course[]>([])
  const [newCourse, setNewCourse] = useState({ title: '', instructor: '' })
  const [error, setError] = useState('')
  const { token } = useAuth()

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/get-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCourses((res.data as { courses: Course[] }).courses)
    } catch {
      setError('Failed to fetch courses')
      toast.error('Failed to fetch courses')
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [token])

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/upload-course`,
        newCourse,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewCourse({ title: '', instructor: '' })
      fetchCourses()
      toast.success('Course uploaded successfully')
    } catch {
      setError('Failed to upload course')
      toast.error('Failed to upload course')
    }
  }

  const handleDeleteCourse = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/delete-course`, {
        headers: { Authorization: `Bearer ${token}` },
        ...(axios.defaults && { data: { id } }),
      })
      fetchCourses()
      toast.success('Course deleted successfully')
    } catch {
      setError('Failed to delete course')
      toast.error('Failed to delete course')
    }
  }

  return (
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Upload New Course</h3>
        <form onSubmit={handleUploadCourse} className="flex space-x-4">
          <input
            type="text"
            placeholder="Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Instructor"
            value={newCourse.instructor}
            onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </form>
      </div>
      <table className="w-full border-collapse bg-white shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Instructor</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course._id} className="hover:bg-gray-100">
              <td className="p-2 border">{course.title}</td>
              <td className="p-2 border">{course.instructor}</td>
              <td className="p-2 border">{new Date(course.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleDeleteCourse(course._id)}
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