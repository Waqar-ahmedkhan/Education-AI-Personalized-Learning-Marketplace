'use client';

import { useCallback } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

interface Props {
  setGeneralError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  accessToken?: string;
}

export default function SocialAuthButtons({
  setGeneralError,
  isLoading,
  setIsLoading,
}: Props) {
  const handleGoogleAuth = useCallback(
    async (credentialResponse: CredentialResponse) => {
      if (!credentialResponse?.credential) {
        setGeneralError('Missing Google credential');
        return;
      }

      if (isLoading) return;
      setIsLoading(true);
      setGeneralError(null);

      try {
        const response = await axios.post<ApiResponse>(
          'http://localhost:8080/api/v1/user/social-auth',
          {
            provider: 'google',
            token: credentialResponse.credential,
          },
          { withCredentials: true }
        );

        const { success, user, accessToken, message } = response.data;

        if (success && user && accessToken) {
          sessionStorage.setItem(
            'userData',
            JSON.stringify({
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            })
          );
          sessionStorage.setItem('accessToken', accessToken);

          // Optional: redirect based on role
          if (user.role === 'admin') {
            window.location.href = '/admin-dashboard';
          } else {
            window.location.href = '/user-dashboard';
          }
        } else {
          setGeneralError(message || 'Google login failed.');
        }
      } catch (error: unknown) {
        console.error('Google Auth Failed:', error);
        
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, setGeneralError, setIsLoading]
  );

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-800 text-gray-300 dark:bg-gray-900 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>

      <div className="relative mt-4 w-fit">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/30 cursor-not-allowed rounded-md" />
        )}

        <GoogleLogin
          onSuccess={handleGoogleAuth}
          onError={() => {
            setGeneralError('Google login failed.');
            setIsLoading(false);
          }}
          text="signin_with"
          shape="rectangular"
          width="300"
        />
      </div>
    </div>
  );
}
