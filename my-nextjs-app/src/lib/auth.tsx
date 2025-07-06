"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';

interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  message?: string;
}

interface AuthContextType {
  token: string | null;
  userRole: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(Cookies.get('access_token') || null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (token && !userRole) {
      fetchUserRole();
    }
  }, [token]);

  const fetchUserRole = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log('Fetching user role from:', `${baseUrl}/api/v1/me`);
      const res = await axios.get<{ role: string }>(`${baseUrl}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log('User role fetched:', res.data.role);
      setUserRole(res.data.role);
    } catch (error: unknown) {
      const axiosError = error as  Error<{ message?: string }>;
      console.error('Failed to fetch user role:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      await logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const loginUrl = `${baseUrl}/api/v1/admin/login`;
      console.log('Sending login request to:', loginUrl);
      console.log('Request payload:', { email, password });

      const res = await axios.post<LoginResponse>(
        loginUrl,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      console.log('Login response:', res.data);

      if (!res.data.success || !res.data.accessToken || res.data.user.role !== 'admin') {
        throw new Error(res.data.message || 'Unauthorized: Admin access only');
      }

      Cookies.set('access_token', res.data.accessToken, {
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      setToken(res.data.accessToken);
      setUserRole(res.data.user.role);
      console.log('Token and role set:', { token: res.data.accessToken, role: res.data.user.role });
      router.push('/admin-dashboard');
    } catch (error: unknown) {
      const axiosError = error as Error<{ message?: string }>;
      console.error('Login error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
        config: axiosError.config,
        headers: axiosError.response?.headers,
      });

      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message || 'Request failed';
      if (status === 404) {
        throw new Error('API endpoint not found. Please check the server URL.');
      } else if (status === 401) {
        throw new Error('Invalid email or password');
      } else if (status === 403) {
        throw new Error('Unauthorized: Admin access only');
      } else if (!axiosError.response) {
        throw new Error('Network error: Unable to reach the server.');
      }
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      console.log('Attempting logout via:', `${baseUrl}/api/v1/logout-user`);
      await axios.get(`${baseUrl}/api/v1/logout-user`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    } catch (error: unknown) {
      const axiosError = error as Error<{ message?: string }>;
      console.error('Logout error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
    } finally {
      Cookies.remove('access_token');
      setToken(null);
      setUserRole(null);
      console.log('Logged out, redirecting to /login');
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout, isAdmin: userRole === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};