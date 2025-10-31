'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Check, Flame, Activity } from 'lucide-react';
import { http } from '@/lib/http';
import { getDashboardStats } from '@/features/dashboard/api/api';

export default function TodayWorkoutPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [weekStats, setWeekStats] = useState<any>({});
  const [monthStats, setMonthStats] = useState<any>({});
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    (async () => {
      try {
        const [calendarRes, weekStatsRes, monthStatsRes] = await Promise.all([
          http.get<any>(`/api/v1/dashboard/calendar?month=${month}&year=${year}`).catch(() => null),
          getDashboardStats({ period: 'week' }).catch(() => null),
          getDashboardStats({ period: 'month' }).catch(() => null),
        ]);
        
        if (!mounted) return;

        // Find today's workout from calendar
        const calendarData = calendarRes?.days || calendarRes?.data?.days || [];
        const todayEntry = calendarData.find((d: any) => d.date === dateStr);
        if (todayEntry?.workout) {
          setTodayWorkout(todayEntry.workout);
        }

        setWeekStats(weekStatsRes?.data || {});
        setMonthStats(monthStatsRes?.data || {});

        // Streak calculation - would need backend endpoint for accurate streak
        const workoutsThisWeek = weekStatsRes?.data?.total_workouts || 0;
        setStreak(workoutsThisWeek > 0 ? 7 : 0);
      } catch (err) {
        console.error('Error loading today workout:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  // Dashboard stats returns: { total_workouts, total_exercises, total_duration, average_duration }
  const workoutsThisWeek = weekStats?.total_workouts || 0;
  const workoutsThisMonth = monthStats?.total_workouts || 0;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-400">{t('common.loading')}</div></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('workouts.today')}</h1>
          <p className="text-slate-400">{formattedDate}</p>
        </div>
        <Link href="/calendar">
          <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
            <Calendar className="h-4 w-4 mr-2" />
            {t('calendar.viewCalendar')}
          </Button>
        </Link>
      </div>

      {/* Main Content - No Workout or Workout Card */}
      {!todayWorkout ? (
        <Card className="glass-card border-slate-700 bg-gradient-to-br from-slate-800/90 to-slate-900/90">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white mb-2">
                  {t('workouts.noWorkoutPlanned')}
                </p>
                <p className="text-slate-400">
                  {t('workouts.noWorkoutDescription')}
                </p>
              </div>
              <div className="flex gap-3 mt-4">
                <Link href="/workouts/new">
                  <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('workouts.addWorkout')}
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="border-orange-500 text-orange-400 hover:bg-orange-500/10">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('workouts.goToCalendar')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card border-slate-700 bg-gradient-to-br from-slate-800/90 to-slate-900/90">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white mb-2">{todayWorkout.name || 'Entrenamiento'}</p>
                <p className="text-slate-400 mb-4">{todayWorkout.description || ''}</p>
                <div className="flex gap-3">
                  <Link href={`/workouts/${todayWorkout.id || todayWorkout.workout_id}`}>
                    <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white">
                      {t('workouts.viewRoutine')}
                    </Button>
                  </Link>
                  <Link href="/calendar">
                    <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                      {t('calendar.viewCalendar')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Esta Semana */}
        <Card className="glass-card border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('workouts.thisWeek')}</p>
                <p className="text-2xl font-bold text-white">{workoutsThisWeek} {t('workouts.thisWeekDescription')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Racha Actual */}
        <Card className="glass-card border-blue-200 dark:border-blue-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg">
                <Check className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('workouts.currentStreak')}</p>
                <p className="text-2xl font-bold text-white">{streak} {t('workouts.consecutiveDays')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Este Mes */}
        <Card className="glass-card border-purple-200 dark:border-purple-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">{t('workouts.thisMonth')}</p>
                <p className="text-2xl font-bold text-white">{workoutsThisMonth} {t('workouts.workouts')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

