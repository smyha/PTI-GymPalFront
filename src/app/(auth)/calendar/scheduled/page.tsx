'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { http } from '@/lib/http';

export default function ScheduledWorkoutsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Array<{ date: string; label: string }>>([]);

  useEffect(() => {
    let mounted = true;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    (async () => {
      try {
        const res = await http.get<any>(`/api/v1/dashboard/calendar?month=${month}&year=${year}`);
        if (!mounted) return;
        const days = Array.isArray(res?.days) ? res.days : [];
        const upcoming = days
          .filter((d: any) => d?.workout)
          .map((d: any) => ({
            date: d.date as string,
            label: d?.workout?.name || d?.workout?.routine || 'Workout',
          }));
        setItems(upcoming);
      } catch {
        if (!mounted) return;
        setItems([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div>
        <h1 className="text-white mb-2">Scheduled Workouts</h1>
        <p className="text-slate-400">Your workouts for this month</p>
      </div>

      <div className="space-y-3">
        {items.map((day) => (
          <Link key={day.date} href={`/workouts`}>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-white mb-1">{fmt(day.date)}</h3>
                      <p className="text-slate-400 text-sm flex items-center gap-2">
                        <Dumbbell className="h-4 w-4" />
                        {day.label}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 text-sm">{day.date}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="text-slate-400">No scheduled workouts found.</div>
        )}
      </div>
    </div>
  );
}
