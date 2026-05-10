import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isTrackingPage = request.nextUrl.pathname.startsWith('/tracking');

  // Allow public tracking access
  if (isTrackingPage) {
    return NextResponse.next();
  }

  // Redirect to login if no token and trying to access protected routes
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check admin access
  if (isAdminPage && token) {
    // Decode token and check role (simplified - implement actual JWT decode)
    // In production, verify the JWT token properly
    const userRoleCookie = request.cookies.get('user-role');
    if (!userRoleCookie || userRoleCookie.value !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/deliveries/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/tracking/:path*'
  ],
};
