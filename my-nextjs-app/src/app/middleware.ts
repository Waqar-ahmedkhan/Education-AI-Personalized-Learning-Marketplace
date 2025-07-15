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
    '/admin-dashboard/:path*',
    '/user-dashboard/:path*',
    '/edit-profile',
    '/update-password',
    '/dashboard',
    '/orders',
    '/notifications',
  ];
  const isProtectedRoute = protectedRoutes.some((route) => {
    const regex = new RegExp(`^${route.replace(':path*', '.*')}$`);
    return regex.test(pathname);
  });
  const isAuthRoute = ['/auth/login', '/auth/admin-login', '/auth/callback'].includes(pathname);

  if (isProtectedRoute && !token) {
    console.log(`Middleware: No token for protected route ${pathname}, redirecting to /auth/login`);
    return NextResponse.redirect(new URL('/auth/login?error=Please+log+in', request.url));
  }

  if (isProtectedRoute && token) {
    try {
      const endpoint: string = pathname.startsWith('/admin-dashboard') ? '/api/v1/admin/me' : '/api/v1/user/me';
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
        console.log(`Middleware: Invalid token for ${pathname}, redirecting to /auth/login`);
        const response = NextResponse.redirect(new URL('/auth/login?error=Invalid+token', request.url));
        if (res.status === 401) {
          response.cookies.delete('access_token');
          console.log('Middleware: Deleted access_token cookie due to 401 Unauthorized');
        }
        return response;
      }

      if (pathname === '/edit-profile' || pathname === '/update-password' || pathname === '/dashboard') {
        if (!['user', 'admin'].includes(data.user?.role || '')) {
          console.log(`Middleware: Invalid role ${data.user?.role} for ${pathname}, redirecting to /auth/login`);
          return NextResponse.redirect(new URL('/auth/login?error=Invalid+role', request.url));
        }
      } else if (pathname.startsWith('/admin-dashboard') && data.user?.role !== 'admin') {
        console.log('Middleware: Non-admin accessing /admin-dashboard, redirecting to /auth/login');
        return NextResponse.redirect(new URL('/auth/login?error=Access+denied.+Admin+role+required', request.url));
      } else if (pathname.startsWith('/user-dashboard') && data.user?.role !== 'user') {
        console.log('Middleware: Non-user accessing /user-dashboard, redirecting to /auth/login');
        return NextResponse.redirect(new URL('/auth/login?error=Access+denied.+User+access+only', request.url));
      }
    } catch (error) {
      console.error(`Middleware: Error fetching ${pathname}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`Middleware: Allowing request to ${pathname} despite fetch error`);
      return NextResponse.next();
    }
  }

  if (isAuthRoute && token) {
    try {
      const endpoint: string = pathname.includes('admin-login') ? '/api/v1/admin/me' : '/api/v1/user/me';
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
      if (data.success && data.user?.role) {
        const redirectUrl = data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
        console.log(`Middleware: Valid token, redirecting to ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (error) {
      console.error(`Middleware: Error fetching ${pathname}:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`Middleware: Allowing request to ${pathname} despite fetch error`);
      return NextResponse.next();
    }
  }

  console.log(`Middleware: Allowing request to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/user-dashboard/:path*',
    '/edit-profile',
    '/change-password',
    'avatar-upload',
    '/update-info',
    '/update-password',
    '/dashboard',
    '/orders',
    '/notifications',
    '/auth/login',
    '/auth/admin-login',
    '/auth/callback',
    '/initial-admin',
  ],
};