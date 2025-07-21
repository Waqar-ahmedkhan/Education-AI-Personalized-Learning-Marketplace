import { NextRequest, NextResponse } from "next/server";

interface UserResponse {
  success: boolean;
  user?: {
    role: string;
  };
  message?: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  console.log(`Middleware: Processing ${pathname} with token: ${token ? "present" : "missing"}`);

  const protectedRoutes = [
    "/admin-dashboard",
    "/user-dashboard",
    "/edit-profile",
    "/update-password",
    "/change-password",
    "/avatar-upload",
    "/update-info",
    "/dashboard",
    "/orders",
    "/notifications",
  ];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = ["/auth/login", "/auth/admin-login", "/auth/callback"].includes(pathname);

  if (pathname === "/auth/callback") {
    console.log("Middleware: Allowing /auth/callback without token validation");
    return NextResponse.next();
  }

  if (isProtectedRoute && !token) {
    console.log(`Middleware: No token for ${pathname}, redirecting to /auth/login`);
    return NextResponse.redirect(new URL("/auth/login?error=Please+log+in", request.url));
  }

  if (isProtectedRoute && token) {
    try {
      const endpoint = pathname.startsWith("/admin-dashboard") ? "/api/v1/admin/me" : "/api/v1/user/me";
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      let data: UserResponse = { success: false };
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error(`Middleware: Failed to parse JSON from ${endpoint}`, jsonError);
        return NextResponse.redirect(new URL("/auth/login?error=Invalid+response", request.url));
      }

      console.log(`Middleware: ${endpoint} response:`, {
        status: res.status,
        success: data.success,
        role: data.user?.role,
        message: data.message,
      });

      if (!data.success || !data.user?.role) {
        console.log(`Middleware: Invalid token, redirecting to /auth/login`);
        const response = NextResponse.redirect(new URL("/auth/login?error=Invalid+token", request.url));
        if (res.status === 401) {
          response.cookies.delete("access_token");
          response.cookies.delete("refresh_token");
        }
        return response;
      }

      const role = data.user.role;
      if (pathname.startsWith("/admin-dashboard") && role !== "admin") {
        console.log(`Middleware: Role ${role} not allowed for /admin-dashboard`);
        return NextResponse.redirect(new URL("/auth/login?error=Admin+access+only", request.url));
      }
      if (pathname.startsWith("/user-dashboard") && role !== "user") {
        console.log(`Middleware: Role ${role} not allowed for /user-dashboard`);
        return NextResponse.redirect(new URL("/auth/login?error=User+access+only", request.url));
      }
      if (
        ["/edit-profile", "/update-password", "/change-password", "/avatar-upload", "/update-info", "/dashboard"].includes(
          pathname
        ) &&
        !["admin", "user"].includes(role)
      ) {
        console.log(`Middleware: Role ${role} not allowed for ${pathname}`);
        return NextResponse.redirect(new URL("/auth/login?error=Unauthorized+role", request.url));
      }
    } catch (error) {
      console.error(`Middleware: Error validating token for ${pathname}`, error);
      const response = NextResponse.redirect(new URL("/auth/login?error=Token+validation+failed", request.url));
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }
  }

  if (isAuthRoute && token) {
    try {
      const endpoint = pathname.includes("admin-login") ? "/api/v1/admin/me" : "/api/v1/user/me";
      const res = await fetch(`${baseUrl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      let data: UserResponse = { success: false };
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error(`Middleware: Failed to parse JSON from ${endpoint}`, jsonError);
        return NextResponse.next();
      }

      if (data.success && data.user?.role) {
        const redirectUrl = data.user.role === "admin" ? "/admin-dashboard" : "/user-dashboard";
        console.log(`Middleware: Already authenticated. Redirecting to ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } catch (err) {
      console.error("Middleware: Auth route token validation failed", err);
      return NextResponse.next();
    }
  }

  console.log(`Middleware: Allowing request to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/user-dashboard/:path*",
    "/edit-profile",
    "/update-password",
    "/change-password",
    "/avatar-upload",
    "/update-info",
    "/dashboard",
    "/orders",
    "/notifications",
    "/auth/login",
    "/auth/admin-login",
    "/auth/callback",
    "/initial-admin",
  ],
};