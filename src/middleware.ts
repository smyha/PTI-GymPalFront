import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/workouts',
    '/profile',
    '/exercises',
    '/diet',
    '/social',
    '/calendar',
    '/ai-chat',
    '/plans',
    '/progress'
  ];

  // Routes only for unauthenticated users
  const authPaths = ['/login', '/register'];
  const onboardingPaths = ['/onboarding'];

  // Check if current path matches protected routes
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // Check if current path is an auth route
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Check if current path is onboarding
  const isOnboardingPath = onboardingPaths.some((path) => pathname.startsWith(path));

  // Check for backend JWT token in cookies (set by frontend after login)
  const accessToken = req.cookies.get('access_token')?.value;
  const isAuthenticated = !!accessToken;

  // Protect authenticated routes - redirect to login if no token
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Redirect authenticated users away from onboarding
  if (isOnboardingPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next({
    request: {
      headers: req.headers,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};


