'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label?: string;
  error?: string;
}

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon: Icon, label, error, className, ...props }, ref) => {
    const borderColor = error ? 'border-red-500' : 'border-slate-700';
    const ringColor = error ? 'focus:ring-red-500/30' : 'focus:ring-emerald-500/30';

    return (
      <div className="space-y-2">
        {label && <Label className="text-white">{label}</Label>}
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            ref={ref}
            className={`pl-10 bg-slate-800/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 ${borderColor} ${ringColor}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

InputWithIcon.displayName = 'InputWithIcon';
