'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';

export default function DietPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Zap className="h-16 w-16 text-slate-400 opacity-50" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Coming Soon
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              The Diet section is coming in a future update.
            </p>
          </div>
          <Button
            onClick={() => router.back()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
