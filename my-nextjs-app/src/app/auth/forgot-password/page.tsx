
'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface ForgotPasswordData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
}

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordData>({ email: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const { theme, systemTheme } = useTheme();
  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  useEffect(() => {
    setMounted(true);
    emailInputRef.current?.focus();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must not exceed 100 characters';
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
      const response = await fetch('http://localhost:8080/api/v1/user/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
        }),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setIsSuccess(true);
        setSuccessMessage(data.message || 'Password reset email sent. Please check your inbox.');
        setFormData({ email: '' });
      } else {
        setErrors({ general: data.message || 'Failed to send reset email. Please try again.' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 bg-gradient-to-br ${isDark ? 'from-gray-900 via-gray-800 to-indigo-900' : 'from-blue-50 via-indigo-50 to-purple-50'}`}>
      <Card className={`max-w-md w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border ${isDark ? 'border-gray-700/30' : 'border-gray-200/30'} rounded-2xl shadow-2xl`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-3xl font-bold bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-r from-indigo-400 to-purple-400' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
            Forgot Password
          </CardTitle>
          <CardDescription className={`${isDark ? 'text-gray-300' : 'text-gray-600'} text-base`}>
            Enter your email to receive a password reset link
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
                  <Label htmlFor="email" className={`${isDark ? 'text-gray-200' : 'text-gray-700'} font-medium`}>
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    ref={emailInputRef}
                    className={`w-full px-4 py-3 text-sm rounded-lg bg-white/80 dark:bg-gray-700/80 border ${errors.email ? 'border-red-400 dark:border-red-500' : isDark ? 'border-gray-600' : 'border-gray-300'} focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                    placeholder="Enter your email address"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 dark:text-red-400 flex items-center animate-slide-in">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {errors.general && (
                  <div className={`p-4 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-500 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
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
                  disabled={isLoading}
                  className={`w-full py-3 text-sm font-medium ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'} text-white rounded-lg transition duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Reset Email...
                    </div>
                  ) : (
                    'Send Reset Email'
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
