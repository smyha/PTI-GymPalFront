'use client';

import { Dumbbell } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/layouts/ThemeToggle';

interface AuthContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: {
    text: string;
    href: string;
  };
}

export default function AuthContainer({
  title,
  description,
  children,
  footerText,
  footerLink,
}: AuthContainerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background blur effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Header */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white hover:text-emerald-400 transition-colors">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span>GymPal</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Auth Box */}
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
              <p className="text-slate-400">{description}</p>
            </div>

            {/* Form Content */}
            <div className="space-y-6">{children}</div>

            {/* Footer Link */}
            <div className="mt-8 text-center text-slate-400">
              {footerText}{' '}
              <Link
                href={footerLink.href}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                {footerLink.text}
              </Link>
            </div>
          </div>

          {/* Bottom decoration */}
          <div className="mt-8 text-center text-sm text-slate-500">
            <p>
              Haz que tu rutina sea más divertida y productiva con{' '}
              <span className="text-emerald-400 font-semibold">GymPal</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
