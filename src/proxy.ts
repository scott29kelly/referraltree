import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/admin'];

// Routes that require admin role
const adminRoutes = ['/admin'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth cookie
  const authCookie = request.cookies.get('guardianship_auth')?.value;

  // Parse auth data (format: repId:role)
  let isAuthenticated = false;
  let isAdmin = false;

  if (authCookie) {
    const [, role] = authCookie.split(':');
    isAuthenticated = true;
    isAdmin = role === 'admin';
  }

  // Check if trying to access auth routes while authenticated
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // Redirect to appropriate dashboard
      const redirectUrl = isAdmin ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Check if trying to access protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (!isAdmin) {
        // Non-admin trying to access admin routes - redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
