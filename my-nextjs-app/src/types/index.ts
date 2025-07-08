export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CustomAxiosError<T = unknown> {
  isAxiosError: boolean;
  message: string;
  response?: {
    data?: T;
    status?: number;
    headers?: Record<string, unknown>;
  };
  config?: Record<string, unknown>;
}