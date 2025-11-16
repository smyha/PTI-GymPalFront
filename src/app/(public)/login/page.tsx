'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContainer } from '@/components/shared';
import { LoginForm } from '@/features/auth';
import { getAccessToken } from '@/lib/utils/auth';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Check for valid token and redirect if authenticated
    const checkAuth = () => {
      try {
        // Check localStorage first (most up-to-date after login)
        const token = getAccessToken();

        // Also check cookies as fallback (for SSR/middleware compatibility)
        let cookieToken: string | null = null;
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split('; ');
          const accessTokenCookie = cookies.find(row => row.startsWith('access_token='));
          const sbTokenCookie = cookies.find(row => row.startsWith('sb-access-token='));
          cookieToken = accessTokenCookie?.split('=')[1] || sbTokenCookie?.split('=')[1] || null;
        }

        // If we have a valid token (from localStorage or cookies), redirect to dashboard
        if (token || cookieToken) {
          router.replace('/dashboard');
          router.refresh();
        }
      } catch (err) {
        // If token check fails, stay on login page
        console.debug('Token check failed, staying on login page');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <AuthContainer
      title="Sign In"
      description="Welcome back to GymPal"
      footerText="Don't have an account?"
      footerLink={{ text: 'Sign up', href: '/register' }}
    >
      <LoginForm />
    </AuthContainer>
  );
}
