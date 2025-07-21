'use client';

import { useState, useCallback, useRef, useEffect, RefObject } from 'react';
import { useTheme } from 'next-themes';

interface LoginData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface LoginFormProps {
  emailInputRef: RefObject<HTMLInputElement | null>;
  initialEmail: string;
  onSuccess: (data: ApiResponse) => Promise<void>;
  generalError: string | null;
  setGeneralError: (error: string | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

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

export default function LoginForm({
  emailInputRef,
  initialEmail,
  onSuccess,
  generalError,
  setGeneralError,
  isLoading,
  setIsLoading,
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginData>({
    email: initialEmail,
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const { theme, systemTheme } = useTheme();
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDark = theme === 'system' ? systemTheme === 'dark' : theme === 'dark';

  useEffect(() => {
    console.log('LoginForm rendered');
  });

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email format';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email is too long (max 100 characters)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password is too long (max 128 characters)';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: undefined }));
      setGeneralError(null);
    },
    [setGeneralError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('handleSubmit called at:', new Date().toISOString());
      if (isLoading || !validateForm()) return;

      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }

      submitTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        setErrors({});
        setGeneralError(null);

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch('http://localhost:8080/api/v1/user/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              email: formData.email.trim(),
              password: formData.password,
            }),
            signal: controller.signal,
            credentials: 'include',
          });

          clearTimeout(timeoutId);

          console.log('Response status:', response.status, 'OK:', response.ok);
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text);
            setGeneralError('Email or password is incorrect. Please try again.');
            return;
          }

          let data: ApiResponse;
          try {
            data = await response.json();
            console.log('Parsed response:', data);
          } catch (jsonError) {
            console.error('JSON parsing error:', jsonError, 'Response text:', await response.text());
            setGeneralError('Email or password is incorrect. Please try again.');
            return;
          }

          if (data.success) {
            await onSuccess(data);
          } else {
            switch (data.message) {
              case 'Please enter both email and password':
                setErrors({
                  email: formData.email ? undefined : 'Email is required',
                  password: formData.password ? undefined : 'Password is required',
                });
                break;
              case 'Email not found':
                setErrors({ email: 'Email not found' });
                break;
              case 'Incorrect password':
                setErrors({ password: 'Incorrect password' });
                break;
              case 'Invalid session':
                setGeneralError('Your session has expired. Please log in again.');
                break;
              case 'Error during user login':
              case 'Internal server error':
              case 'Something went wrong':
                setGeneralError('Email or password is incorrect. Please try again.');
                break;
              default:
                setGeneralError(data.message || 'An error occurred during login');
            }
          }
        } catch (error: unknown) {
          console.error('Login error:', error);
          setGeneralError(
            error instanceof Error && error.name === 'AbortError'
              ? 'Request timed out. Please try again.'
              : 'Email or password is incorrect. Please try again.'
          );
        } finally {
          setIsLoading(false);
        }
      }, 300);

      return () => {
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current);
        }
      };
    },
    [formData, isLoading, validateForm, onSuccess, setGeneralError, setIsLoading]
  );

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            ref={emailInputRef}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
              errors.email
                ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500'
                : isDark
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white'
            }`}
            placeholder="you@example.com"
            disabled={isLoading}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          <svg
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              errors.email ? 'text-red-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        {errors.email && (
          <p
            id="email-error"
            className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm ${
              errors.password
                ? 'border-red-400 bg-red-50/50 dark:bg-red-900/20 dark:border-red-500'
                : isDark
                ? 'border-gray-600 bg-gray-700 text-white'
                : 'border-gray-300 bg-white'
            }`}
            placeholder="••••••••"
            disabled={isLoading}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <svg
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
              errors.password ? 'text-red-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0-2.76 2.24-5 5-5s5 2.24 5 5v6h-5m-5-6c0-2.76-2.24-5-5-5S2 8.24 2 11v6h5m5-6v6m-5-6v6"
            />
          </svg>
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p
            id="password-error"
            className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errors.password}
          </p>
        )}
      </div>

      {generalError && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {generalError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-lg font-medium text-sm transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed text-gray-600'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Signing In...
          </div>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  );
}