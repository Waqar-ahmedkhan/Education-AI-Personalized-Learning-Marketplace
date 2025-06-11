import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import axios from 'axios'
import Cookies from 'js-cookie'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = res.data as { role?: string }
      if (data.role !== 'admin') {
        Cookies.remove('access_token')
        return NextResponse.redirect(new URL('/admin-login?error=Access denied. Admin role required.', request.url))
      }
    } catch{
      Cookies.remove('access_token')
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }
  }

  if (pathname === '/admin-login' && token) {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = res.data as { role?: string }
      if (data.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch{
      return NextResponse.next()
    }
  }

  if (pathname === '/Initial-admin' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin-login', '/initial-admin'],
}