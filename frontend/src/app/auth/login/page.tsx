'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth';
import LoginForm from '@/components/ui/auth/LoginForm';
import SocialAuthButtons from '@/components/ui/auth/SoicalAuthButtons'; // Fixed typo: SoicalAuthButtons -> SocialAuthButtons
import AuthLinks from '@/components/ui/auth/AuthLinks';

interface ApiResponse {
  success: boolean;
  message?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    avatar?: {
      public_id: string;
      url: string;
    };
  };
  accessToken: string;
}

interface CustomAxiosError extends Error {
  response?: {
    status: number;
    data: {
      message?: string;
    };
  };
  message: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, systemTheme } = useTheme();
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { loginWithToken } = useAuth();

  useEffect(() => {
    setMounted(true);
    emailInputRef.current?.focus();
  }, []);

  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  const handleLoginSuccess = async (data: ApiResponse) => {
    if (data.success && data.user && data.accessToken) {
      try {
        loginWithToken({
          success: data.success,
          accessToken: data.accessToken,
          user: data.user,
          message: data.message,
        });
        if (!data.user.isVerified) {
          sessionStorage.setItem('activationToken', data.accessToken);
          router.push(`/activation?email=${encodeURIComponent(data.user.email)}`);
        } else {
          router.push('/user-dashboard');
        }
      } catch (error: unknown) {
        const axiosError = error as CustomAxiosError;
        setGeneralError(axiosError.response?.data?.message || axiosError.message || 'Failed to process login');
      }
    } else {
      setGeneralError(data.message || 'Invalid email or password');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${isDark ? 'bg-indigo-900' : 'bg-indigo-100'}`}>
            <svg className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-2.76 2.24-5 5-5s5 2.24 5 5v6h-5m-5-6c0-2.76-2.24-5-5-5S2 8.24 2 11v6h5m5-6v6m-5-6v6" />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome Back
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Sign in to continue your learning journey
          </p>
        </div>

        <LoginForm
          emailInputRef={emailInputRef}
          initialEmail={searchParams.get('email') || ''}
          onSuccess={handleLoginSuccess}
          setGeneralError={setGeneralError}
          generalError={generalError}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {generalError && (
          <div className={`mt-4 p-3 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
            <p className="text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {generalError}
            </p>
          </div>
        )}

        <SocialAuthButtons setGeneralError={setGeneralError} isLoading={isLoading} setIsLoading={setIsLoading} />

        <AuthLinks />
      </div>
    </div>
  );
}