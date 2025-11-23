'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboard, getDashboardStats } from '@/features/dashboard/api/api';
import { http } from '@/lib/http';
import { Calendar, Activity, TrendingDown } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { workoutsApi } from '@/features/workouts/api/api';
import { useAuthStore } from '@/lib/store/auth.store';

/**
 * ProgressPage Component
 * 
 * Displays user progress and statistics.
 * Features:
 * - Current weight tracking
 * - Workout frequency stats (monthly/weekly)
 * - Total workout history
 * - Detailed breakdown of activity
 */
export default function ProgressPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [statsAll, setStatsAll] = useState<any>(null);
  const [weightData, setWeightData] = useState<any>(null);
  const [statsWeek, setStatsWeek] = useState<any>(null);
  const [statsMonth, setStatsMonth] = useState<any>(null);
  const [statsYear, setStatsYear] = useState<any>(null);
  const [workoutCount, setWorkoutCount] = useState<number>(0);
  const [completedWeek, setCompletedWeek] = useState<number>(0);
  const [completedMonth, setCompletedMonth] = useState<number>(0);
  const [completedYear, setCompletedYear] = useState<number>(0);
  const [completedAll, setCompletedAll] = useState<number>(0);
  const [exerciseCountWeek, setExerciseCountWeek] = useState<number>(0);
  const [exerciseCountMonth, setExerciseCountMonth] = useState<number>(0);
  const [exerciseCountYear, setExerciseCountYear] = useState<number>(0);
  const [exerciseCountAll, setExerciseCountAll] = useState<number>(0);

  /**
   * Fetch all progress data on mount
   * Loads multiple data points in parallel for better performance
   */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dateStr = new Date().toISOString().split('T')[0];
        // Fetch data from various endpoints
        const [ov, stAll, weight, weekStats, monthStats, yearStats, count, weekCount, monthCount, yearCount, allCount, exWeek, exMonth, exYear, exAll] = await Promise.all([
          getDashboard().catch(() => null),
          getDashboardStats('all').catch(() => null),
          http.get<any>('/api/v1/personal/info').catch(() => null),
          getDashboardStats('week').catch(() => null),
          getDashboardStats('month').catch(() => null),
          getDashboardStats('year').catch(() => null),
          user?.id ? workoutsApi.getWorkoutCount(user.id).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'week', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'month', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'year', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedWorkoutCount(user.id, 'all', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'week', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'month', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'year', dateStr).catch(() => 0) : Promise.resolve(0),
          user?.id ? workoutsApi.getCompletedExerciseCount(user.id, 'all', dateStr).catch(() => 0) : Promise.resolve(0),
        ]);
        
        if (!mounted) return;
        
        setOverview(ov);
        setStatsAll(stAll);
        setWeightData(weight);
        setStatsWeek(weekStats);
        setStatsMonth(monthStats);
        setStatsYear(yearStats);
        setWorkoutCount(count || 0);
        setCompletedWeek(weekCount || 0);
        setCompletedMonth(monthCount || 0);
        setCompletedYear(yearCount || 0);
        setCompletedAll(allCount || 0);
        setExerciseCountWeek(exWeek || 0);
        setExerciseCountMonth(exMonth || 0);
        setExerciseCountYear(exYear || 0);
        setExerciseCountAll(exAll || 0);
      } catch (err) {
        // Error handling logic here
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user?.id]);

  const statsAllData = statsAll?.data || {};
  const weekStatsData = statsWeek?.data || {};
  const monthStatsData = statsMonth?.data || {};
  const yearStatsData = statsYear?.data || {};
  const weightDataResponse = weightData?.data || {};
  
  // Use completed workout counts from state (fetched via workoutsApi.getCompletedWorkoutCount) as primary source
  const workoutsThisMonth = completedMonth;
  const workoutsThisWeek = completedWeek;
  const workoutsThisYear = completedYear;
  
  // Personal info returns: { weight_kg, height_cm, age, ... }
  const currentWeight = weightDataResponse.weight_kg || null;

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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('progress.title')}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">{t('progress.subtitle')}</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Weight */}
        {currentWeight !== null && (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.currentWeight')}</CardTitle>
                <TrendingDown className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{currentWeight} kg</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.registeredWeight')}</p>
            </CardContent>
          </Card>
        )}

        {/* Workouts This Month */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workouts')}</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{workoutsThisMonth}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">{t('progress.thisMonth')}</p>
            </CardContent>
        </Card>

        {/* Total Workouts (Completed) */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.totalWorkouts')}</CardTitle>
                <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{completedAll}</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">{t('progress.allTime')}</p>
            </CardContent>
        </Card>

        {/* This Week */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.thisWeek')}</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{workoutsThisWeek}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">{t('progress.workouts')}</p>
            </CardContent>
        </Card>

        {/* This Year */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-slate-600 dark:text-slate-400">{t('progress.thisYear', { defaultValue: 'This Year' })}</CardTitle>
                <Calendar className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{workoutsThisYear}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">{t('progress.workouts')}</p>
            </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">{t('progress.title')}</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">{t('progress.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.totalWorkouts')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.allTime')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{completedAll}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisMonth')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workouts')} {t('progress.thisMonth').toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisMonth}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisWeek')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.workouts')} {t('progress.thisWeek').toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{workoutsThisWeek}</p>
              </div>
            </div>
            {/* Exercise counts */}
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.totalExercises', { defaultValue: 'Total Exercises' })}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.allTime')}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountAll}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisMonth')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.exercises', { defaultValue: 'Exercises' })} {t('progress.thisMonth').toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountMonth}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-slate-900 dark:text-white font-semibold">{t('progress.thisWeek')}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('progress.exercises', { defaultValue: 'Exercises' })} {t('progress.thisWeek').toLowerCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{exerciseCountWeek}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
