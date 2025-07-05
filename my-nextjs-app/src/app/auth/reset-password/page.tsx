
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [formData, setFormData] = useState<ResetPasswordData>({
    token,
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  // Handle hydration and token validation
  useEffect(() => {
    setMounted(true);
    if (!token) {
      setErrors({ general: 'Invalid or missing reset token. Please request a new password reset link.' });
    } else {
      passwordInputRef.current?.focus();
      setFormData((prev) => ({ ...prev, token }));
    }
  }, [token]);

  // Redirect after success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => router.push('/auth/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.token) {
      newErrors.general = 'Invalid or missing reset token';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters long';
    } else if (formData.newPassword.length > 128) {
      newErrors.newPassword = 'Password must not exceed 128 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('http://localhost:8080/api/v1/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token: formData.token,
          newPassword: formData.newPassword,
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setSuccessMessage(data.message || 'Password reset successfully. You can now log in.');
      } else {
        setErrors({ general: data.message || 'Failed to reset password. Please try again.' });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800 to-indigo-900' : 'from-blue-50 via-indigo-50 to-purple-50'}`}>
      <Card className={`max-w-md w-full bg-white/70 dark:bg-gray-800/70 border ${isDark ? 'border-gray-700/30' : 'border-gray-200/30'} rounded-2xl shadow-2xl animate-slide-in`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-3xl font-bold bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
            Reset Password
          </CardTitle>
          <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base`}>
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className={`text-lg font-medium ${isDark ? 'text-green-400' : 'text-green-500'} animate-slide-in`}>
                {successMessage}
              </p>
              <Link
                href="/auth/login"
                className="inline-block text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition duration-200"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className={`${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      ref={passwordInputRef}
                      className={`w-full px-4 py-3 pr-12 text-sm rounded-lg bg-white/80 dark:bg-gray-700/80 border ${errors.newPassword ? 'border-red-400 dark:border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter new password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-500 dark:text-red-400 flex items-center animate-slide-in">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className={`${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 pr-12 text-sm rounded-lg bg-white/80 dark:bg-gray-700/80 border ${errors.confirmPassword ? 'border-red-400 dark:border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500 dark:text-red-400 flex items-center animate-slide-in">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {errors.general && (
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} animate-slide-in`}>
                    <p className="text-sm flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.general}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !formData.token}
                  className={`w-full py-3 text-sm font-medium ${isLoading || !formData.token ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'} text-white rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Remember your password?{' '}
                  <Link href="/auth/login" className="font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition duration-200">
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
