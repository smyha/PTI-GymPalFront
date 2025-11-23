'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Dumbbell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { workoutsApi } from '@/features/workouts/api/api';
import { calendarApi } from '@/features/calendar/api/api';
import { useTranslation } from 'react-i18next';
import type { CalendarDay } from '@/features/calendar/api/types';

type CalendarEntry = CalendarDay;

export default function CalendarPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddWorkoutDialogOpen, setIsAddWorkoutDialogOpen] = useState(false);
  const [isViewWorkoutDialogOpen, setIsViewWorkoutDialogOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarEntry[]>([]);
  const [routines, setRoutines] = useState<Array<{ id: string; name: string; exercises?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState('');
  const [editingAnnotations, setEditingAnnotations] = useState('');

  useEffect(() => {
    let mounted = true;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;

    setLoading(true);

    /**
     * Fetches and updates calendar data
     */
    const loadCalendarData = async () => {
      try {
        const days = await calendarApi.getMonth(month, year);
        if (!mounted) return;
        setCalendarData(days);
        return true;
      } catch (err) {
        if (mounted) setCalendarData([]);
        return false;
      }
    };

    /**
     * Fetches and updates available workouts
     */
    const loadWorkouts = async () => {
      try {
        const list = await workoutsApi.list();
        if (!mounted) return;

        // Handle different response formats
        let workoutList = [];
        if (list?.data && Array.isArray(list.data)) {
          workoutList = list.data;
        } else if (Array.isArray(list)) {
          workoutList = list;
        }

        if (workoutList.length > 0) {
          setRoutines(
            workoutList.map((w: any) => ({
              id: String(w.id || w.uuid || w._id || w.name),
              name: w.name || 'Unnamed Workout',
              exercises: w.exercises?.length || 0,
            }))
          );
        }
        if (mounted && workoutList.length === 0) setRoutines([]);

        return true;
      } catch (err) {
        if (mounted) setRoutines([]);
        return false;
      }
    };

    // Load data in parallel
    Promise.all([loadCalendarData(), loadWorkouts()]).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [currentMonth]);

  const dayToEntry = useMemo(() => {
    const map: Record<string, CalendarEntry> = {};
    for (const e of calendarData) map[e.date] = e;
    return map;
  }, [calendarData]);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleDayClick = (dateStr: string, hasWorkout: boolean) => {
    setSelectedDate(dateStr);
    if (hasWorkout) {
      const entry = dayToEntry[dateStr];
      setEditingAnnotations(entry?.annotations || '');
      setIsViewWorkoutDialogOpen(true);
    } else {
      setAnnotations('');
      setSelectedWorkoutId(null);
      setIsAddWorkoutDialogOpen(true);
    }
  };

  const handleAddWorkout = async (routineId: string) => {
    setIsAddWorkoutDialogOpen(false);
    setAddError('');

    if (!selectedDate || !routineId) {
      setSelectedDate(null);
      setAnnotations('');
      return;
    }

    try {
      // Add the workout to the calendar date with annotations
      await calendarApi.addWorkout(routineId, selectedDate, annotations.trim() || undefined);

      // Show a brief confirmation to the user
      setAddSuccess('Workout scheduled');
      setToast({ message: 'Workout scheduled', type: 'success' });
      setTimeout(() => setAddSuccess(''), 3000);
      setTimeout(() => setToast(null), 3000);

      // Refresh the calendar data to reflect the changes
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const updatedDays = await calendarApi.getMonth(month, year);
      setCalendarData(updatedDays);
      // Close dialog already done above; ensure success state is visible briefly
    } catch (err) {
      const msg = (err as any)?.response?.data?.error?.message || (err as any)?.message || 'Failed to add workout';
      setAddError(String(msg));
      setToast({ message: String(msg), type: 'error' });
      setTimeout(() => setToast(null), 5000);
      // Optionally show a user-friendly error message here
    } finally {
      setSelectedDate(null);
      setAnnotations('');
    }
  };

  const handleSaveWorkoutData = () => {
    // Persisting set logs would use workouts session endpoints; left for workout screens
  };

  const handleCloseWorkoutDialog = (open: boolean) => {
    if (!open) handleSaveWorkoutData();
    setIsViewWorkoutDialogOpen(open);
    if (!open) setSelectedDate(null);
  };

  const handleCompleteWorkout = async () => {
    if (!selectedDate) {
      setIsViewWorkoutDialogOpen(false);
      setSelectedDate(null);
      return;
    }

    const entry = dayToEntry[selectedDate];
    const scheduledId = entry?.id;
    if (!scheduledId) {
      setToast({ message: 'Unable to locate scheduled entry id', type: 'error' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    try {
      await calendarApi.completeScheduled(String(scheduledId));
      setToast({ message: 'Workout marked as completed! 🎉', type: 'success' });
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const updatedDays = await calendarApi.getMonth(month, year);
      setCalendarData(updatedDays);
    } catch (err) {
      setToast({ message: 'Failed to mark as completed', type: 'error' });
    } finally {
      setIsViewWorkoutDialogOpen(false);
      setSelectedDate(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!selectedDate) {
      setIsViewWorkoutDialogOpen(false);
      setSelectedDate(null);
      return;
    }

    const entry = dayToEntry[selectedDate];
    const scheduledId = entry?.id;
    if (!scheduledId) {
      setToast({ message: 'Unable to locate scheduled entry id', type: 'error' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    try {
      await calendarApi.deleteScheduled(String(scheduledId));
      setToast({ message: 'Scheduled workout deleted', type: 'success' });
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const updatedDays = await calendarApi.getMonth(month, year);
      setCalendarData(updatedDays);
    } catch (err) {
      setToast({ message: 'Failed to delete scheduled workout', type: 'error' });
    } finally {
      setIsViewWorkoutDialogOpen(false);
      setSelectedDate(null);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const previousDay = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentMonth(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentMonth(newDate);
  };

  const previousWeek = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentMonth(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentMonth);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentMonth(newDate);
  };

  const previousYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentMonth(newDate);
  };

  const nextYear = () => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentMonth(newDate);
  };

  // Determine handlers for prev/next based on viewMode (avoid nested ternaries in JSX)
  const prevHandler = () => {
    if (viewMode === 'day') return previousDay;
    if (viewMode === 'week') return previousWeek;
    if (viewMode === 'year') return previousYear;
    return previousMonth;
  };

  const nextHandler = () => {
    if (viewMode === 'day') return nextDay;
    if (viewMode === 'week') return nextWeek;
    if (viewMode === 'year') return nextYear;
    return nextMonth;
  };

  // Compute CSS class for calendar cell to avoid nested ternaries
  const getCellClass = (entry: CalendarEntry | undefined, isToday: boolean, isSelected = false) => {
    // Selected state should be more opaque so it doesn't appear transparent in dialogs
    if (isToday && isSelected) return 'border-emerald-500 bg-emerald-500/20 dark:bg-emerald-500/30 ring-1 ring-emerald-300';
    if (isToday) return 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20';
    if (!entry?.hasWorkout) return 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-700/50';
    if (entry.status === 'completed') return isSelected ? 'border-blue-500 bg-blue-500/30 dark:bg-blue-500/40' : 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 hover:bg-blue-500/20 dark:hover:bg-blue-500/30';
    return isSelected ? 'border-purple-500 bg-purple-500/30 dark:bg-purple-500/40' : 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/20 dark:hover:bg-purple-500/30';
  };

  // Helper function to get the start of the week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Helper function to format display based on view mode
  const getDisplayTitle = () => {
    if (viewMode === 'day') {
      return currentMonth.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    } else if (viewMode === 'week') {
      const weekStart = getWeekStart(currentMonth);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (viewMode === 'year') {
      return currentMonth.getFullYear().toString();
    }
    return monthName;
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('calendar.title')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">{t('calendar.subtitle')}</p>
        </div>
        {addSuccess && (
          <div className="ml-6 mr-4 text-sm text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 rounded px-3 py-2">
            {addSuccess}
          </div>
        )}
        <Link href="/ai-chat">
          <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all">
            {t('calendar.aiButton', { title: t('calendar.title') })}
          </Button>
        </Link>
      </div>

      {/* View Mode Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['day', 'week', 'month', 'year'] as const).map((mode) => (
          <Button
            key={mode}
            onClick={() => setViewMode(mode)}
            variant={viewMode === mode ? 'default' : 'outline'}
            className={`capitalize ${viewMode === mode
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500'
              : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
          >
            {t(`common.${mode}` as any) === `common.${mode}` ? mode : t(`common.${mode}` as any)}
          </Button>
        ))}
      </div>

      {/* Calendar */}
      <Card className="glass-card card-gradient-blue border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white capitalize">{getDisplayTitle()}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={prevHandler()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={nextHandler()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'day' && (
            <div className="space-y-4">
              <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {currentMonth.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h3>
                {(() => {
                  const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(currentMonth.getDate()).padStart(2, '0')}`;
                  const entry = dayToEntry[dateStr];
                  return (
                    <div className="space-y-3">
                      {entry?.hasWorkout ? (
                        <div className="p-4 rounded-lg border border-emerald-500 bg-emerald-500/10">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-slate-900 dark:text-white">{entry.workoutName || t('workouts.workout')}</h4>
                              <p className={`text-sm mt-1 ${entry.status === 'completed' ? 'text-blue-500' : 'text-purple-500'}`}>
                                {t('common.status')}: {entry.status === 'completed' ? t('calendar.completed') : t('calendar.scheduled')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDayClick(dateStr, true)}
                              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded transition-colors"
                            >
                              {t('common.view')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-center">
                          <p className="text-slate-600 dark:text-slate-400 mb-3">{t('calendar.noWorkouts')}</p>
                          <button
                            onClick={() => handleDayClick(dateStr, false)}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                          >
                            {t('calendar.addWorkout')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="space-y-3">
              {(() => {
                const weekStart = getWeekStart(currentMonth);
                const weekDays = Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date(weekStart);
                  date.setDate(date.getDate() + i);
                  return date;
                });

                return weekDays.map((day) => {
                  const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                  const entry = dayToEntry[dateStr];
                  const dayName = day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

                  return (
                    <div key={dateStr} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{dayName}</h4>
                        {entry?.hasWorkout ? (
                          <p className={`text-sm mt-1 ${entry.status === 'completed' ? 'text-blue-500' : 'text-purple-500'}`}>
                            {entry.workoutName || t('workouts.workout')} ({entry.status === 'completed' ? t('calendar.completed') : t('calendar.scheduled')})
                          </p>
                        ) : (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('workouts.noWorkoutPlanned')}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDayClick(dateStr, !!entry?.hasWorkout)}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded transition-colors"
                      >
                        {entry?.hasWorkout ? t('common.view') : t('common.add')}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-slate-600 dark:text-slate-400 text-sm py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entry = dayToEntry[dateStr];
                const today = new Date();
                const isToday = day === today.getDate() &&
                  currentMonth.getMonth() === today.getMonth() &&
                  currentMonth.getFullYear() === today.getFullYear();
                const isSelected = selectedDate === dateStr;
                const cellClass = getCellClass(entry, isToday, isSelected);

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDayClick(dateStr, !!entry?.hasWorkout)}
                    className={`aspect-square p-2 rounded-lg border transition-all hover-lift ${cellClass}`}
                  >
                    <div className="text-slate-900 dark:text-white text-sm mb-1">{day}</div>
                    {entry?.hasWorkout ? (
                      <div className={`text-xs ${entry.status === 'completed' ? 'text-blue-500' : 'text-purple-500'}`}>
                        {entry.workoutName || t('workouts.workout')}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center mt-1">
                        <Plus className="h-3 w-3 text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'year' && (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, monthIndex) => {
                const monthDate = new Date(currentMonth.getFullYear(), monthIndex, 1);
                const monthDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
                const workoutsInMonth = Array.from({ length: monthDays })
                  .map((_, dayIndex) => {
                    const dateStr = `${monthDate.getFullYear()}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayIndex + 1).padStart(2, '0')}`;
                    return dayToEntry[dateStr];
                  })
                  .filter(entry => entry?.hasWorkout);

                const plural = workoutsInMonth.length === 1 ? '' : 's';

                return (
                  <div key={monthDate.toISOString()} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {monthDate.toLocaleDateString('en-US', { month: 'long' })}
                    </h4>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {workoutsInMonth.length} {t('workouts.workouts')}
                      </p>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all"
                          style={{ width: `${(workoutsInMonth.length / monthDays) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Toast container */}
      {toast && (
        <div className="fixed right-4 bottom-6 z-50">
          <div className={`max-w-sm px-4 py-3 rounded shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* Legend */}
      <Card className="glass-card card-gradient-emerald border-slate-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/10" />
              <span className="text-slate-700 dark:text-slate-300 text-sm">{t('calendar.today')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500/10" />
              <span className="text-slate-700 dark:text-slate-300 text-sm">{t('calendar.completed')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-500/10" />
              <span className="text-slate-700 dark:text-slate-300 text-sm">{t('calendar.scheduled')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-700" />
              <span className="text-slate-700 dark:text-slate-300 text-sm">{t('calendar.empty')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Workout Dialog */}
      <Dialog open={isAddWorkoutDialogOpen} onOpenChange={setIsAddWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">{t('calendar.addWorkoutTitle')}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {t('calendar.addWorkoutDescription', {
                date: selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              })}
            </DialogDescription>
          </DialogHeader>

          {addError && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded p-3 mx-4 -mt-2">
              {addError}
            </div>
          )}

          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {routines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => setSelectedWorkoutId(routine.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-all hover-lift group ${
                    selectedWorkoutId === routine.id
                      ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600" />
                        <h4 className="text-slate-900 dark:text-white">{routine.name}</h4>
                      </div>
                    </div>
                    <Plus className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </button>
              ))}

              {/* New Routine Option */}
              <button
                onClick={() => {
                  setIsAddWorkoutDialogOpen(false);
                  setSelectedDate(null);
                  router.push('/workouts/new');
                }}
                className="w-full text-left p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-500 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 dark:from-emerald-500/10 dark:to-emerald-600/10 hover:from-emerald-500/10 hover:to-emerald-600/10 dark:hover:from-emerald-500/20 dark:hover:to-emerald-600/20 transition-all hover-lift group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-2 rounded-lg group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 transition-colors">
                      <Plus className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white">{t('workouts.createNew')}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{t('workouts.createNewDescription')}</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </ScrollArea>

          {/* Annotations field */}
          {selectedWorkoutId && (
            <div className="px-6 space-y-2">
              <Label htmlFor="annotations" className="text-slate-900 dark:text-white">
                {t('calendar.annotations')} ({t('common.optional')})
              </Label>
              <Textarea
                id="annotations"
                placeholder={t('calendar.annotationsPlaceholder')}
                className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 resize-none h-20"
                value={annotations}
                onChange={(e) => setAnnotations(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddWorkoutDialogOpen(false);
                setSelectedDate(null);
                setSelectedWorkoutId(null);
                setAnnotations('');
              }}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                if (selectedWorkoutId) {
                  handleAddWorkout(selectedWorkoutId);
                }
              }}
              disabled={!selectedWorkoutId}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {t('calendar.addWorkout')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Workout Dialog */}
      <Dialog open={isViewWorkoutDialogOpen} onOpenChange={handleCloseWorkoutDialog}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden">
          {selectedDate && (() => {
            const entry = dayToEntry[selectedDate];
            if (!entry?.hasWorkout) return null;

            const isCompleted = entry.status === 'completed';
            const statusColor = isCompleted ? 'blue' : 'purple';

            return (
              <>
                {/* Header with gradient background */}
                <div className="-mx-6 -mt-6 px-6 pt-6 pb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-${statusColor}-500/10 dark:bg-${statusColor}-500/20`}>
                          <Dumbbell className={`h-5 w-5 text-${statusColor}-500`} />
                        </div>
                        <DialogTitle className="text-slate-900 dark:text-white text-xl">
                          {entry.workoutName || 'Workout'}
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </DialogDescription>
                    </div>
                    <Badge
                      className={`${isCompleted
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-purple-500 hover:bg-purple-600'} text-white border-0 shadow-lg`}
                    >
                      {isCompleted ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          {t('calendar.completed')}
                        </>
                      ) : (
                        t('calendar.scheduled')
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="py-6 space-y-4">
                  {/* Workout Info Card */}
                  <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 dark:from-emerald-500/20 dark:to-emerald-600/20 border border-emerald-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1">{t('calendar.workoutDetails')}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {t('calendar.viewFullWorkout')}
                        </p>
                      </div>
                      <Button
                        onClick={() => router.push(entry.workoutId ? `/workouts/${entry.workoutId}` : '/workouts')}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/50 transition-all"
                        size="sm"
                      >
                        {t('calendar.open')}
                      </Button>
                    </div>
                  </div>

                  {/* Annotations Section */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-annotations" className="text-slate-900 dark:text-white">
                      {t('calendar.annotations')}
                    </Label>
                    <Textarea
                      id="edit-annotations"
                      placeholder={t('calendar.annotationsPlaceholder')}
                      className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 resize-none h-24"
                      value={editingAnnotations}
                      onChange={(e) => setEditingAnnotations(e.target.value)}
                    />
                    <Button
                      onClick={async () => {
                        if (!selectedDate) return;
                        const entry = dayToEntry[selectedDate];
                        const scheduledId = entry?.id;
                        if (!scheduledId) return;
                        try {
                          await calendarApi.updateAnnotations(String(scheduledId), editingAnnotations);
                          setToast({ message: t('calendar.annotationsUpdated'), type: 'success' });
                          const year = currentMonth.getFullYear();
                          const month = currentMonth.getMonth() + 1;
                          const updatedDays = await calendarApi.getMonth(month, year);
                          setCalendarData(updatedDays);
                        } catch (err) {
                          setToast({ message: t('calendar.annotationsUpdateError'), type: 'error' });
                        } finally {
                          setTimeout(() => setToast(null), 3000);
                        }
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                      size="sm"
                    >
                      {t('calendar.saveAnnotations')}
                    </Button>
                  </div>

                  {/* Status Message */}
                  {isCompleted ? (
                    <div className="p-4 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                        <Check className="h-5 w-5" />
                        <p className="text-sm font-medium">{t('calendar.completionMessage')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20">
                      <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                        <CalendarIcon className="h-5 w-5" />
                        <p className="text-sm font-medium">{t('calendar.readyMessage')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="-mx-6 -mb-6 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="ghost"
                      onClick={handleDeleteWorkout}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {t('workouts.confirmDelete')}
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleCloseWorkoutDialog(false)}
                        className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        {t('common.close')}
                      </Button>
                      {!isCompleted && (
                        <Button
                          onClick={handleCompleteWorkout}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/50 transition-all"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {t('calendar.markComplete')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
