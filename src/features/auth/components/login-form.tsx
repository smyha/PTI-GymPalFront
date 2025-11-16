'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/shared/input-with-icon';
import { PasswordInput } from '@/components/shared/password-input';
import { login } from '../api/api';

type FormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.email.includes('@')) {
      return 'Valid email is required';
    }
    if (!formData.password || formData.password.length < 6) {
      return 'Password is required';
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const res = await login(formData);
      console.log('Login response:', res);

      if (res?.token) {
        console.log('Token received, redirecting to dashboard');

        // Save user info to localStorage for immediate use in dashboard
        if (res?.user) {
          const userName = res.user.fullName || res.user.full_name || res.user.username || res.user.email || 'User';
          localStorage.setItem('user_name', userName);
          localStorage.setItem('user_email', res.user.email);
          if (res.user.id) localStorage.setItem('user_id', res.user.id);
          console.log('User info saved:', userName);
        }

        router.push('/dashboard');
      } else {
        setError('No authentication token received. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorCode = err?.response?.data?.code;
      const errorMessage = err?.response?.data?.error?.message || err?.message || 'Error signing in';

      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
      } else if (errorCode === 'INVALID_CREDENTIALS') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <InputWithIcon
        icon={Mail}
        label="Email Address"
        placeholder="your@email.com"
        type="email"
        required={false}
        name="email"
        value={formData.email}
        onChange={handleChange}
      />

      <PasswordInput
        label="Password"
        placeholder="••••••••"
        required={false}
        name="password"
        value={formData.password}
        onChange={handleChange}
      />

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-medium py-2" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
