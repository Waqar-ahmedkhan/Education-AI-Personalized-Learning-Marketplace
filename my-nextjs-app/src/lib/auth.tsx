'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  role: string;
  email: string;
  isVerified: boolean;
  avatar?: {
    public_id: string;
    url: string;
  };
}

interface LoginResponse {
  success: boolean;
  accessToken?: string;
  user: User;
  message?: string;
}

interface CustomAxiosError<T = unknown> extends Error {
  response?: {
    status: number;
    data: T;
  };
  message: string;
}

interface AuthContextType {
  token: string | null;
  userRole: string | null;
  userName: string | null;
  userAvatar: { public_id: string; url: string } | null;
  isLoading: boolean;
  isTokenExpired: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (data: LoginResponse) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(Cookies.get('access_token') || null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<{ public_id: string; url: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!token);
  const [isTokenExpired, setIsTokenExpired] = useState<boolean>(false);
  const router = useRouter();

  const loginWithToken = (data: LoginResponse) => {
    setToken(data.accessToken!);
    setUserRole(data.user.role);
    setUserName(data.user.name);
    setUserAvatar(data.user.avatar || null);
    setIsTokenExpired(false);
    sessionStorage.setItem(
      'userData',
      JSON.stringify({
        role: data.user.role,
        name: data.user.name,
        avatar: data.user.avatar,
      })
    );
    Cookies.set('access_token', data.accessToken!, {
      expires: 7,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  };

  useEffect(() => {
    console.log('AuthProvider: Initializing with token:', token ? 'present' : 'missing');
    const storedData = sessionStorage.getItem('userData');
    if (storedData) {
      const { role, name, avatar } = JSON.parse(storedData);
      console.log('AuthProvider: Restored from sessionStorage:', { role, name, avatar });
      setUserRole(role);
      setUserName(name);
      setUserAvatar(avatar || null);
      setIsLoading(false);
    }
    if (token && !userRole) {
      console.log('AuthProvider: Fetching user data');
      fetchUserData();
    }
  }, [token]);

  const checkTokenExpiration = async () => {
    if (!token) {
      setIsTokenExpired(true);
      return;
    }
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      await axios.get(`${baseUrl}/api/v1/user/refresh`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setIsTokenExpired(false);
    } catch (error) {
      const axiosError = error as CustomAxiosError;
      console.error('AuthProvider: Token refresh error:', {
        status: axiosError.response?.status,
        message: axiosError.message,
      });
      if (axiosError.response?.status === 401) {
        setIsTokenExpired(true);
        logout();
      }
    }
  };

  useEffect(() => {
    if (token) {
      checkTokenExpiration();
      const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // Check every 5 minutes
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchUserData = async () => {
    setIsLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    try {
      console.log('AuthProvider: Attempting to fetch /api/v1/user/me');
      const res = await axios.get<{ success: boolean; user: User }>(
        `${baseUrl}/api/v1/user/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      console.log('AuthProvider: /api/v1/user/me response:', {
        status: res.status,
        success: res.data.success,
        user: res.data.user,
      });
      if (res.data.success) {
        setUserRole(res.data.user.role);
        setUserName(res.data.user.name);
        setUserAvatar(res.data.user.avatar || null);
        sessionStorage.setItem(
          'userData',
          JSON.stringify({
            role: res.data.user.role,
            name: res.data.user.name,
            avatar: res.data.user.avatar,
          })
        );
      } else {
        console.log('AuthProvider: Failed to fetch user data, logging out');
        logout();
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError<{ message?: string }>;
      console.error('AuthProvider: Error fetching /api/v1/user/me:', {
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
      console.log(`AuthProvider: Logging in via /api/v1/user/login with email: ${email}`);
      const res = await axios.post<LoginResponse>(
        `${baseUrl}/api/v1/user/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      console.log('AuthProvider: Login response:', res.data);

      if (!res.data.success || !res.data.accessToken) {
        throw new Error(res.data.message || 'Login failed');
      }

      loginWithToken(res.data);
      console.log('AuthProvider: Login successful, redirecting to /user-dashboard');
      router.push('/user-dashboard');
    } catch (error) {
      const axiosError = error as CustomAxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'An unexpected error occurred';

      console.error('AuthProvider: Login error:', { status, data: axiosError.response?.data, message });

      if (status === 404) throw new Error('API endpoint not found. Check backend routes.');
      if (status === 401) throw new Error('Invalid email or password');
      if (status === 403) throw new Error('Unauthorized: Access denied');
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
      console.log('AuthProvider: Logging out, token:', token ? 'present' : 'null');
      if (token) {
        await axios.get(`${baseUrl}/api/v1/user/logout`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        console.log('AuthProvider: Logout API call successful');
      } else {
        console.log('AuthProvider: No token, skipping logout API call');
      }
    } catch (error) {
      const axiosError = error as CustomAxiosError<{ message: string }>;
      console.error('AuthProvider: Logout error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message,
      });
    } finally {
      Cookies.remove('access_token');
      setToken(null);
      setUserRole(null);
      setUserName(null);
      setUserAvatar(null);
      setIsTokenExpired(true);
      sessionStorage.clear();
      console.log('AuthProvider: Logout complete, redirecting to /auth/login');
      router.push('/auth/login');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userRole,
        userName,
        userAvatar,
        isLoading,
        isTokenExpired,
        isAuthenticated: !!token && !isTokenExpired,
        login,
        logout,
        loginWithToken,
        isAdmin: userRole === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}