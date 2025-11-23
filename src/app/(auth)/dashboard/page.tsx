'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { getDashboard, getDashboardStats, QuickActionCard } from '@/features/dashboard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dumbbell, Users, Calendar as CalIcon, TrendingUp, MessageSquare, Target, Flame, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuthStore } from '@/lib/store/auth.store';
import { workoutsApi } from '@/features/workouts/api/api';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [overview, setOverview] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [completedThisWeek, setCompletedThisWeek] = useState<number>(0);
  const [exerciseCount, setExerciseCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dateStr = new Date().toISOString().split('T')[0];
        // Load dashboard data and workout/exercise counts
        const [ov, st, count, weekCount, exerciseCountData, currentStreak] = await Promise.all([
          getDashboard().catch(() => null),
          getDashboardStats().catch(() => null),
          user?.id ? workoutsApi.getWorkoutCount(user.id).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'week', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'all', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCurrentStreak(user.id, dateStr).catch(() => 0) : Promise.resolve(0)
        ]);

        if (!mounted) return;
        setOverview(ov);
        setStats(st);
        setWorkoutCount(count || 0);
        setCompletedThisWeek(weekCount || 0);
        setExerciseCount(exerciseCountData || 0);
        setStreak(currentStreak || 0);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  const overviewData = overview?.data || {};
  const statsData = stats?.data || {};
  
  // Dashboard overview returns: { stats: { total_workouts, total_exercises, completed_routines_this_week, streak }, recent_workouts: [], today_workout: {} }
  // Use workoutCount, exerciseCount, and streak from state (fetched via workoutsApi) as primary source
  const recentWorkouts = overviewData.recent_workouts || [];
  const todayWorkout = overviewData.today_workout;
  
  // Use completedThisWeek from state (fetched via workoutsApi.getCompletedWorkoutCount) as primary source
  // Calculate weekly goal - default to 7 workouts per week
  const weeklyGoal = 7;
  const progressPercent = Number.isFinite(completedThisWeek) && weeklyGoal > 0 
    ? Math.min(100, Math.max(0, (Number(completedThisWeek) / weeklyGoal) * 100)) 
    : 0;

  // Get next workout from recent workouts if available, or today's workout
  const nextWorkout = todayWorkout || (recentWorkouts.length > 0 ? recentWorkouts[0] : null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <LoadingSpinner size="lg" variant="dumbbell" />
        <p className="text-slate-400 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting Section - Enhanced */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-white shadow-xl">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-400/20 rounded-full -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            {t('dashboard.greeting', { name: user?.username || user?.email?.split('@')[0] || 'User' })}
          </h1>
          <p className="text-emerald-50">{t('dashboard.summary')}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Total Entrenamientos */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{workoutCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.totalWorkouts')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Objetivo semanal */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t('dashboard.workoutsThisWeek')}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{completedThisWeek}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">/ {weeklyGoal}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{Math.round(progressPercent)}% {t('common.complete', { defaultValue: 'complete' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Racha (Streak) */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{streak} {t('common.days', { defaultValue: 'days' })}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.streak', { defaultValue: 'Current Streak' })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Ejercicios */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{exerciseCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('dashboard.totalExercises')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('dashboard.quickAccess')}</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <QuickActionCard 
            icon={Dumbbell} 
            title={t('nav.workouts')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/workouts" 
            color="orange" 
          />
          <QuickActionCard 
            icon={Users} 
            title={t('nav.social')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/social" 
            color="pink" 
          />
          <QuickActionCard 
            icon={CalIcon} 
            title={t('nav.calendar')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/calendar" 
            color="blue" 
          />
          <QuickActionCard 
            icon={TrendingUp} 
            title={t('nav.progress')} 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/progress" 
            color="cyan" 
          />
          <QuickActionCard 
            icon={MessageSquare} 
            title="AI Chat" 
            description={t('dashboard.quickAccess', { defaultValue: 'Quick Access' })} 
            to="/ai-chat" 
            color="purple" 
          />
        </div>
      </div>

      {/* Next Workout */}
      {nextWorkout && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-semibold text-white">{t('dashboard.nextWorkout')}</h2>
          </div>
          <Card className="glass-card border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-gradient-to-br dark:from-slate-800/90 dark:to-slate-900/90 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{nextWorkout.name || t('workouts.today', { defaultValue: 'Workout' })}</p>
                  <div className="flex gap-3 mt-4">
                    <Link href={`/workouts/${nextWorkout.id}`}>
                      <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md">
                        {t('workouts.viewRoutine')}
                      </Button>
                    </Link>
                    <Link href="/workouts">
                      <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                        {t('common.view', { defaultValue: 'View' })} All
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
