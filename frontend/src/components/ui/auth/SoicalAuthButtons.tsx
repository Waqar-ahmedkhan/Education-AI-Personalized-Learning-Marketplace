'use client';

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

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error('Google Client ID is not defined');
      setGeneralError('Google authentication is not configured');
      setIsLoading(false);
      return;
    }

    try {
      const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
      if (typeof window !== 'undefined') {
        window.location.href = googleAuthUrl;
      }
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
          aria-label="Sign in with Google"
          aria-disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 border rounded-lg bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-gray-700 dark:text-gray-200" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-1.01 7.28-2.72l-3.57-2.77c-1.01.68-2.29 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.36 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.01 3.64 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Sign in with Google
        </button>
      </div>
    </div>
  );
}