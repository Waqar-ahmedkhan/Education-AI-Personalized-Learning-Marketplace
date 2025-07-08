import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin-dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/admin-login?error=Please log in', request.url));
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json() as { success: boolean; user: { role: string } };
      if (!data.success || data.user.role !== 'admin') {
        request.cookies.delete('access_token');
        return NextResponse.redirect(
          new URL('/forbidden?error=Access denied. Admin role required.', request.url)
        );
      }
    } catch {
      request.cookies.delete('access_token');
      return NextResponse.redirect(new URL('/forbidden?error=Invalid token', request.url));
    }
  }

  if (pathname.startsWith('/user-dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=Please log in', request.url));
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json() as { success: boolean; user: { role: string } };
      if (!data.success) {
        request.cookies.delete('access_token');
        return NextResponse.redirect(new URL('/forbidden?error=Invalid token', request.url));
      }
    } catch {
      request.cookies.delete('access_token');
      return NextResponse.redirect(new URL('/forbidden?error=Invalid token', request.url));
    }
  }

  if (pathname === '/auth/login' && token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json() as { success: boolean; user: { role: string } };
      if (data.success) {
        const redirectUrl = data.user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch {
      return NextResponse.next();
    }
  }

  if (pathname === '/initial-admin' && token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      const data = await res.json() as { success: boolean; user: { role: string } };
      if (data.success) {
        const redirectUrl = data.user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin-dashboard/:path*', '/user-dashboard/:path*', '/auth/login', '/initial-admin'],
};