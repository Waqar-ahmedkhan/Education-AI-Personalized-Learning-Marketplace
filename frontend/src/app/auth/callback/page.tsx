'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/auth';

export default function SocialAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('SocialAuthCallback: Google auth error', error);
      router.push(`/auth/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (code) {
      axios
        .post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/social-auth`,
          { provider: 'google', code },
          { withCredentials: true }
        )
        .then((response) => {
          const { success, user, accessToken, message } = response.data;
          if (success && user && accessToken) {
            loginWithToken({ success, user, accessToken, message });
            if (!user.isVerified) {
              sessionStorage.setItem('activationToken', accessToken);
              router.push(`/activation?email=${encodeURIComponent(user.email)}`);
            } else {
              router.push(user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
            }
          } else {
            console.error('SocialAuthCallback: Invalid response data', response.data);
            router.push(`/auth/login?error=${encodeURIComponent(message || 'Social auth failed')}`);
          }
        })
        .catch((error) => {
          console.error('SocialAuthCallback: Error processing Google auth', error);
          router.push('/auth/login?error=social-auth-failed');
        });
    } else {
      console.error('SocialAuthCallback: No code provided in callback');
      router.push('/auth/login?error=no-code-provided');
    }
  }, [searchParams, router, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
      <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}