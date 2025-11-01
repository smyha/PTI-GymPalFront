'use client';

import { useState } from 'react';
import { createLogger } from '../../../lib/logger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, Mail, Lock, User, Eye, EyeOff, AtSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeToggle from '@/components/layouts/ThemeToggle';
import { register, type RegisterRequest } from '@/features/auth/api/api';

export default function RegisterPage() {
  const log = createLogger('public/register');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dateOfBirth: '',
  });

  function toUsername(name: string, email: string) {
    const base = name?.trim() ? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') : '';
    if (base) return base.slice(0, 24) || 'user';
    const local = (email || '').split('@')[0] || 'user';
    return local.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'user';
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      log.error('Passwords do not match');
      return;
    }
    const fd = new FormData(e.currentTarget);
    const consentChecked = fd.get('consent') === 'on';

    const payload: RegisterRequest = {
      email: formData.email,
      password: formData.password,
      username: formData.username || toUsername(formData.name, formData.email),
      full_name: formData.name,
      gender: formData.gender as any,
      date_of_birth: formData.dateOfBirth,
      terms_accepted: consentChecked,
      privacy_policy_accepted: consentChecked,
    };

    await register(payload);
    router.push('/onboarding');
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

        {/* Register Card */}
        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-foreground mb-2">Crear Cuenta</h1>
            <p className="text-muted-foreground">Únete a la comunidad GymPal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Nombre de usuario</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Elige tu nombre de usuario"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Correo Electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-foreground">Género</Label>
              <select
                id="gender"
                className="w-full rounded-md border bg-background/50 dark:bg-background/80 border-border text-foreground px-3 py-2 focus:outline-none"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="">Selecciona tu género</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
                <option value="prefer_not_to_say">Prefiero no decirlo</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-foreground">Fecha de nacimiento</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  placeholder="Fecha de nacimiento"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Contraseña</Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 bg-background/50 dark:bg-background/80 border-border text-foreground placeholder:text-muted-foreground"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <input 
                name="consent"
                type="checkbox" 
                className="mt-1 rounded border-border bg-background/50 text-emerald-500 focus:ring-emerald-500" 
                required 
              />
              <span className="text-sm text-muted-foreground">
                Acepto los{' '}
                <a href="#" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  política de privacidad
                </a>
              </span>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all"
            >
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
