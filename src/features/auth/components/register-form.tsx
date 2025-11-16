'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AtSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputWithIcon } from '@/components/shared/input-with-icon';
import { PasswordInput } from '@/components/shared/password-input';
import { Label } from '@/components/ui/label';
import { register as registerUser } from '../api/api';

function toUsername(name: string, email: string) {
  const base = name?.trim()
    ? name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
    : '';
  if (base) return base.slice(0, 24) || 'user';
  const local = (email || '').split('@')[0] || 'user';
  return local.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'user';
}

type FormData = {
  full_name: string;
  username: string;
  email: string;
  gender?: string;
  date_of_birth?: string;
  password: string;
  password_confirm: string;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
};

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    username: '',
    email: '',
    gender: '',
    date_of_birth: '',
    password: '',
    password_confirm: '',
    terms_accepted: false,
    privacy_policy_accepted: false,
  });

  // Auto-generate username when name or email changes
  useEffect(() => {
    if (!formData.full_name && !formData.email) return;
    const generated = toUsername(formData.full_name, formData.email);
    setFormData((prev) => ({ ...prev, username: generated }));
  }, [formData.full_name, formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.full_name || formData.full_name.length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (!formData.username) {
      return 'Username is required';
    }
    if (!formData.email || !formData.email.includes('@')) {
      return 'Valid email is required';
    }
    if (!formData.password || formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.password_confirm) {
      return 'Passwords do not match';
    }
    if (!formData.terms_accepted) {
      return 'You must accept the terms and conditions';
    }
    if (!formData.privacy_policy_accepted) {
      return 'You must accept the privacy policy';
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        full_name: formData.full_name,
        date_of_birth: formData.date_of_birth || undefined,
        gender: formData.gender || undefined,
        terms_accepted: formData.terms_accepted,
        privacy_policy_accepted: formData.privacy_policy_accepted,
      };

      const res = await registerUser(payload);

      if (res?.emailConfirmationRequired) {
        setSuccess('Account created! Please check your email to verify your account.');
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Error registering');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <InputWithIcon
        icon={User}
        label="Full Name"
        placeholder="Your name"
        type="text"
        required={false}
        name="full_name"
        value={formData.full_name}
        onChange={handleChange}
      />

      <InputWithIcon
        icon={AtSign}
        label="Username"
        placeholder="username (auto-generated)"
        type="text"
        required={false}
        name="username"
        value={formData.username}
        onChange={handleChange}
      />

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

      <div className="space-y-2">
        <Label htmlFor="gender" className="text-white">
          Gender (Optional)
        </Label>
        <select
          id="gender"
          name="gender"
          className="w-full rounded-md border bg-slate-800/50 border-slate-700 text-white px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-emerald-500/30"
          value={formData.gender}
          onChange={handleChange}
          required={false}
        >
          <option value="">Select your gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth" className="text-white">
          Date of Birth (Optional)
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            id="date_of_birth"
            type="date"
            name="date_of_birth"
            className="w-full pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30 rounded-md border px-3 py-2 focus:outline-none"
            value={formData.date_of_birth}
            onChange={handleChange}
            required={false}
          />
        </div>
      </div>

      <PasswordInput
        label="Password"
        placeholder="••••••••"
        required={false}
        name="password"
        value={formData.password}
        onChange={handleChange}
      />

      <PasswordInput
        label="Confirm Password"
        placeholder="••••••••"
        required={false}
        name="password_confirm"
        value={formData.password_confirm}
        onChange={handleChange}
      />

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            name="terms_accepted"
            className="mt-1 rounded border-slate-700 bg-slate-800/50 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            checked={formData.terms_accepted}
            onChange={handleChange}
          />
          <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer">
            I accept the{' '}
            <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              terms and conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              privacy policy
            </a>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy"
            name="privacy_policy_accepted"
            className="mt-1 rounded border-slate-700 bg-slate-800/50 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
            checked={formData.privacy_policy_accepted}
            onChange={handleChange}
          />
          <label htmlFor="privacy" className="text-sm text-slate-400 cursor-pointer">
            I accept the privacy policy
          </label>
        </div>
      </div>

      {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>}

      {success && <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded p-3">{success}</div>}

      <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-medium py-2" disabled={loading || !!success}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}
