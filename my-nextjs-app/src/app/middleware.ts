import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  console.log(`Middleware: Processing ${pathname} with token: ${token ? 'present' : 'missing'}`);

  const protectedRoutes = ['/admin-dashboard', '/user-dashboard', '/edit-profile', '/update-password', '/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = pathname === '/auth/login' || pathname === '/auth/admin-login' || pathname === '/auth/callback';

  if (isProtectedRoute && !token) {
    console.log(`Middleware: No token for protected route ${pathname}, redirecting to /auth/login`);
    return NextResponse.redirect(new URL(`/auth/login?error=Please+log+in&redirect=${encodeURIComponent(pathname)}`, request.url));
  }

  if (isProtectedRoute) {
    try {
      const endpoint = pathname.startsWith('/admin-dashboard') ? '/api/v1/admin/me' : '/api/v1/user/me';
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json() as { success: boolean; user?: { role: string } };
      console.log(`Middleware: ${endpoint} response:`, { status: res.status, success: data.success, role: data.user?.role });

      if (!data.success) {
        console.log(`Middleware: Invalid response for ${pathname}, clearing token and redirecting to /auth/login`);
        const response = NextResponse.redirect(new URL(`/auth/login?error=Invalid+token&redirect=${encodeURIComponent(pathname)}`, request.url));
        response.cookies.delete('access_token');
        return response;
      }

      if (['/edit-profile', '/update-password', '/dashboard'].some(route => pathname.startsWith(route))) {
        if (!['user', 'admin'].includes(data.user?.role || '')) {
          console.log(`Middleware: Invalid role for ${pathname}, redirecting to /forbidden`);
          const response = NextResponse.redirect(new URL('/forbidden?error=Invalid+role', request.url));
          response.cookies.delete('access_token');
          return response;
        }
      } else if (pathname.startsWith('/admin-dashboard') && data.user?.role !== 'admin') {
        console.log('Middleware: Non-admin accessing /admin-dashboard, redirecting to /forbidden');
        const response = NextResponse.redirect(new URL('/forbidden?error=Access+denied.+Admin+role+required', request.url));
        response.cookies.delete('access_token');
        return response;
      } else if (pathname.startsWith('/user-dashboard') && data.user?.role !== 'user') {
        console.log('Middleware: Non-user accessing /user-dashboard, redirecting to /forbidden');
        const response = NextResponse.redirect(new URL('/forbidden?error=Access+denied.+User+access+only', request.url));
        response.cookies.delete('access_token');
        return response;
      }
    } catch (error) {
      console.error(`Middleware: Error fetching ${pathname}:`, error);
      const response = NextResponse.redirect(new URL(`/auth/login?error=Invalid+token&redirect=${encodeURIComponent(pathname)}`, request.url));
      response.cookies.delete('access_token');
      return response;
    }
  }

  if (isAuthRoute && token) {
    try {
      const endpoint = pathname.includes('admin-login') ? '/api/v1/admin/me' : '/api/v1/user/me';
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json() as { success: boolean; user?: { role: string } };
      console.log(`Middleware: ${endpoint} response:`, { status: res.status, success: data.success, role: data.user?.role });
      if (data.success && data.user?.role) {
        const redirectUrl = data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
        console.log(`Middleware: Valid token, redirecting to ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (error) {
      console.error(`Middleware: Error fetching :`, error);
      return NextResponse.next();
    }
  }

  console.log(`Middleware: Allowing request to ${pathname}`);
  return NextResponse.next();
}

// middleware.ts
export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/user-dashboard/:path*',
    '/edit-profile',
    '/update-password',
    '/dashboard',
    '/orders', // Added for admin order page
    '/notifications', // Added for admin notification page
    '/auth/login',
    '/auth/admin-login',
    '/auth/callback',
    '/initial-admin',
  ],
};