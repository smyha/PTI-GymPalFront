'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to: string;
  color: 'orange' | 'green' | 'pink' | 'blue' | 'cyan' | 'purple' | 'yellow';
}

const colorClasses = {
  orange: { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', border: 'border-orange-200 dark:border-orange-500/30' },
  green: { bg: 'bg-gradient-to-br from-green-400 to-emerald-600', border: 'border-green-200 dark:border-green-500/30' },
  pink: { bg: 'bg-gradient-to-br from-pink-400 to-rose-600', border: 'border-pink-200 dark:border-pink-500/30' },
  blue: { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', border: 'border-blue-200 dark:border-blue-500/30' },
  cyan: { bg: 'bg-gradient-to-br from-cyan-400 to-teal-600', border: 'border-cyan-200 dark:border-cyan-500/30' },
  purple: { bg: 'bg-gradient-to-br from-purple-400 to-purple-600', border: 'border-purple-200 dark:border-purple-500/30' },
  yellow: { bg: 'bg-gradient-to-br from-yellow-400 to-amber-600', border: 'border-yellow-200 dark:border-yellow-500/30' },
} as const;

export default function QuickActionCard({ icon: Icon, title, description, to, color }: QuickActionCardProps) {
  const c = colorClasses[color];
  return (
    <Link href={to}>
      <Card className={`glass-card ${c.border} bg-gradient-to-br from-slate-800/90 to-slate-900/90 hover-lift shadow-lg cursor-pointer overflow-hidden group`}>
        <CardContent className="pt-6 relative">
          <div className={`w-14 h-14 rounded-xl ${c.bg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-white mb-1 font-semibold">{title}</h3>
          <p className="text-slate-400 text-sm">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
