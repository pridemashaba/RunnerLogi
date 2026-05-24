import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function runs on every request
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/tracking'];

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Check if auth token exists in cookies
  const token = request.cookies.get('token')?.value;

  // If user is not logged in and tries to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

// If user is logged in and tries to access login/register, we could redirect but we'll allow access
// Users can log out from the navbar if needed

  return NextResponse.next();
}

// Configure which routes this proxy should run on
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/tracking/:path*',
    '/dashboard/:path*',
    '/deliveries/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/admin/:path*',
  ],
};
