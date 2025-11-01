"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/layouts/ThemeToggle';

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background gradient-mesh flex items-center justify-center p-4 relative transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg glass-card rounded-2xl p-8 shadow-xl">
        <h1 className="text-foreground mb-2">¡Bienvenido a GymPal!</h1>
        <p className="text-muted-foreground mb-6">Completa tu perfil para comenzar.</p>

        <div className="space-y-3">
          <Button className="w-full" onClick={() => router.push('/login')}>Ir a Iniciar sesión</Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/')}>Volver al inicio</Button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Saltar por ahora
          </Link>
        </div>
      </div>
    </div>
  );
}
