'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/lib/auth';

export default function SocialAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth(); // Use login to update AuthProvider state

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');
    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        // Store token in cookies
        Cookies.set('access_token', token, {
          expires: 7,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
        // Store user data in sessionStorage for AuthProvider
        sessionStorage.setItem('userData', JSON.stringify({
          role: userData.role,
          name: userData.name,
          avatar: userData.avatar,
        }));
        console.log('SocialAuthCallback: Token and user data stored', { token, user: userData });
        // Update AuthProvider state
        login('', '', userData.role === 'admin'); // Dummy login to update state
        router.push(userData.role === 'admin' ? '/admin-dashboard' : '/dashboard');
      } catch (error) {
        console.error('SocialAuthCallback: Error parsing user data', error);
        router.push('/auth/login?error=social-auth-failed');
      }
    } else {
      console.error('SocialAuthCallback: Missing token or user', { token, user });
      router.push('/auth/login?error=social-auth-failed');
    }
  }, [searchParams, router, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
      <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
} 