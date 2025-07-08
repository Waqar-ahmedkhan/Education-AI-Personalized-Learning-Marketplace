'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { LoginResponse, CustomAxiosError } from '@/types';

interface AuthContextType {
  token: string | null;
  userRole: string | null;
  userName: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(Cookies.get('access_token') || null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      const { role, name } = JSON.parse(storedData);
      setUserRole(role);
      setUserName(name);
      setIsLoading(false);
    }
    if (token && !userRole) {
      fetchUserData();
    } else if (!token && userRole) {
      // Token is missing but role exists, likely a stale session
      logout();
    }
  }, [token]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await axios.get<{ success: boolean; user: { _id: string; name: string; role: string; email: string; isVerified: boolean } }>(
        `${baseUrl}/api/v1/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setUserRole(res.data.user.role);
        setUserName(res.data.user.name);
        sessionStorage.setItem('userData', JSON.stringify({ role: res.data.user.role, name: res.data.user.name }));
      } else {
        logout();
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError<{ message?: string }>;
      console.error('Failed to fetch user data:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await axios.post<LoginResponse>(
        `${baseUrl}/api/v1/admin/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!res.data.success || !res.data.accessToken) {
        throw new Error(res.data.message || 'Login failed');
      }

      Cookies.set('access_token', res.data.accessToken, {
        expires: 7,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Changed to 'strict' for better security
      });

      setToken(res.data.accessToken);
      setUserRole(res.data.user.role);
      setUserName(res.data.user.name);
      sessionStorage.setItem('userData', JSON.stringify({ role: res.data.user.role, name: res.data.user.name }));
      router.push(res.data.user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
    } catch (error) {
      const axiosError = error as CustomAxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'An unexpected error occurred';

      console.error('Login error:', { status, data: axiosError.response?.data, message });

      if (status === 404) throw new Error('API endpoint not found');
      if (status === 401) throw new Error('Invalid email or password');
      if (status === 403) throw new Error('Unauthorized: Admin access only');
      if (!axiosError.response) throw new Error('Network error: Unable to reach server');
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await axios.get(`${baseUrl}/api/v1/logout-user`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('access_token', { path: '/' });
      setToken(null);
      setUserRole(null);
      setUserName(null);
      sessionStorage.clear();
      router.push('/auth/login');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ token, userRole, userName, isLoading, login, logout, isAdmin: userRole === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}