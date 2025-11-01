'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeToggle from '@/components/layouts/ThemeToggle';
import { login, type LoginRequest } from '@/features/auth/api/api';
import { getAccessToken } from '@/lib/utils/auth';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for valid token and redirect if authenticated
    // This runs on mount to check if user already has a session
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
    
    // Run check on mount
    checkAuth();
  }, [router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload: LoginRequest = {
      email: formData.email,
      password: formData.password,
    };

    try {
      await login(payload);
      // After successful login, tokens are saved - verify we have the updated token
      // Small delay to ensure tokens are saved in localStorage and cookies
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify token was saved correctly
      const savedToken = getAccessToken();
      if (savedToken) {
        router.replace('/dashboard');
        router.refresh();
        // Fallback in case router navigation is blocked
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
            window.location.assign('/dashboard');
          }
        }, 100);
      } else {
        // Token wasn't saved, show error
        setError('Error al guardar la sesión. Por favor, intenta de nuevo.');
      }
    } catch (err: unknown) {
      let message = 'Error al iniciar sesión';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          message = parsed?.error?.message || message;
        } catch {
          message = err.message || message;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center p-4 relative transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg glow-emerald">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <span className="text-foreground">GymPal</span>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-foreground mb-2">Sign In</h1>
            <p className="text-muted-foreground">Welcome back to GymPal</p>
          </div>

          {error ? (
            <div className="mb-4 text-sm text-red-500 border border-red-500/50 bg-red-500/10 rounded-md p-3">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  className="rounded border-border bg-background/50 text-emerald-500 focus:ring-emerald-500" 
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-70"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
