"use server"
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import axios from 'axios'

interface AuthContextType {
  token: string | null
  userRole: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(Cookies.get('access_token') || null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (token) fetchUserRole()
  }, [token])

  const fetchUserRole = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUserRole((res.data as { role: string }).role)
    } catch (error) {
      console.error('Failed to fetch user role:', error)
      logout()
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post<{ accessToken: string; user: { role: string } }>(
        `${process.env.NEXT_PUBLIC_API_URL}/login-user`,
        { email, password }
      )
      const { accessToken, user } = res.data
      Cookies.set('access_token', accessToken, { expires: 7, path: '/' })
      setToken(accessToken)
      if (user.role !== 'admin') {
        Cookies.remove('access_token')
        throw new Error('Access denied. Admin role required.')
      }
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/logout-user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      Cookies.remove('access_token')
      setToken(null)
      setUserRole(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout, isAdmin: userRole === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}