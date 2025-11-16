'use client';

import { AuthContainer } from '@/components/shared';
import { RegisterForm } from '@/features/auth';

export default function RegisterPage() {
  return (
    <AuthContainer
      title="Create Account"
      description="Join the GymPal community"
      footerText="Already have an account?"
      footerLink={{ text: 'Sign in', href: '/login' }}
    >
      <RegisterForm />
    </AuthContainer>
  );
}
