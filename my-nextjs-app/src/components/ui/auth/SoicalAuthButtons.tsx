'use client';

import Image from 'next/image';
import { useCallback } from 'react';

interface Props {
  setGeneralError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function SocialAuthButtons({ setGeneralError, isLoading, setIsLoading }: Props) {
  const handleGoogleAuth = useCallback(() => {
    if (isLoading) return;
    setIsLoading(true);
    setGeneralError(null);

    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google Auth Failed:', error);
      setGeneralError('Failed to initiate Google login');
      setIsLoading(false);
    }
  }, [isLoading, setGeneralError, setIsLoading]);

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

      <div className="relative mt-4 w-fit mx-auto">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/30 cursor-not-allowed rounded-md" />
        )}
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <Image src="/google-icon.svg" width={40} height={40} alt="Google" className="w-5 h-5 mr-2" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}