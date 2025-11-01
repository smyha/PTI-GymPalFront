import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

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
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  
  const isLoggedIn = Boolean(
    req.cookies.get('sb-access-token')?.value ||
    req.cookies.get('access_token')?.value
  );

  // Protect authenticated routes
  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect authenticated users away from register page (but allow login page)
  if (pathname.startsWith('/register') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow onboarding only for non-authenticated users (after registration)
  // If authenticated, redirect to dashboard
  if (pathname.startsWith('/onboarding') && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};


