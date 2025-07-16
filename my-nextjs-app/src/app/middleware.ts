import { NextRequest, NextResponse } from 'next/server';

interface UserResponse {
  success: boolean;
  user?: {
    role: string;
  };
  message?: string;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  console.log(`Middleware: Processing ${pathname} with token: ${token ? 'present' : 'missing'}`);

  const protectedRoutes = [
    '/admin-dashboard',
    '/user-dashboard',
    '/edit-profile',
    '/update-password',
    '/change-password',
    '/avatar-upload',
    '/update-info',
    '/dashboard',
    '/orders',
    '/notifications',
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = ['/auth/login', '/auth/admin-login', '/auth/callback'].includes(pathname);

  // 🔐 Token missing for protected route
  if (isProtectedRoute && !token) {
    console.log(`Middleware: No token for ${pathname}, redirecting to /auth/login`);
    return NextResponse.redirect(new URL('/auth/login?error=Please+log+in', request.url));
  }

  // 🔐 Validate token & user role for protected routes
  if (isProtectedRoute && token) {
    try {
      const endpoint = pathname.startsWith('/admin-dashboard') ? '/api/v1/admin/me' : '/api/v1/user/me';

      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });

      const data: UserResponse = await res.json();
      console.log(`Middleware: ${endpoint} response:`, {
        status: res.status,
        success: data.success,
        role: data.user?.role,
        message: data.message,
      });

      if (!data.success) {
        console.log(`Middleware: Invalid token, redirecting to /auth/login`);
        const response = NextResponse.redirect(new URL('/auth/login?error=Invalid+token', request.url));
        if (res.status === 401) {
          response.cookies.delete('access_token');
        }
        return response;
      }

      // 🚧 Role-specific checks
      const role = data.user?.role;
      if (pathname.startsWith('/admin-dashboard') && role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/login?error=Admin+access+only', request.url));
      }

      if (pathname.startsWith('/user-dashboard') && role !== 'user') {
        return NextResponse.redirect(new URL('/auth/login?error=User+access+only', request.url));
      }

      if (
        ['/edit-profile', '/update-password', '/change-password', '/avatar-upload', '/update-info', '/dashboard'].includes(pathname) &&
        !['admin', 'user'].includes(role || '')
      ) {
        return NextResponse.redirect(new URL('/auth/login?error=Unauthorized+role', request.url));
      }
    } catch (error) {
      console.error(`Middleware: Error validating user token`, error);
      return NextResponse.next();
    }
  }

  // 🔄 Auth routes: redirect if already logged in
  if (isAuthRoute && token) {
    try {
      const endpoint = pathname.includes('admin-login') ? '/api/v1/admin/me' : '/api/v1/user/me';
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data: UserResponse = await res.json();

      if (data.success && data.user?.role) {
        const redirectUrl = data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
        console.log(`Middleware: Already authenticated. Redirecting to ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (err) {
      console.error('Middleware: Auth route token validation failed', err);
    }
  }

  console.log(`Middleware: Allowing request to ${pathname}`);
  return NextResponse.next();
}

// ✅ Matcher config
export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/user-dashboard/:path*',
    '/edit-profile',
    '/update-password',
    '/change-password',
    '/avatar-upload',
    '/update-info',
    '/dashboard',
    '/orders',
    '/notifications',
    '/auth/login',
    '/auth/admin-login',
    '/auth/callback',
    '/initial-admin',
  ],
};
