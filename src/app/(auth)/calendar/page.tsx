'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Dumbbell, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { http } from '@/lib/http';
import { workoutsApi } from '@/features/workouts/api/api';
import { useTranslation } from 'react-i18next';

type CalendarEntry = {
  date: string; // YYYY-MM-DD
  hasWorkout?: boolean;
  status?: 'scheduled' | 'completed';
  routineName?: string;
};

export default function CalendarPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddWorkoutDialogOpen, setIsAddWorkoutDialogOpen] = useState(false);
  const [isViewWorkoutDialogOpen, setIsViewWorkoutDialogOpen] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarEntry[]>([]);
  const [routines, setRoutines] = useState<Array<{ id: string; name: string; exercises?: number }>>([]);

  useEffect(() => {
    let mounted = true;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    (async () => {
      try {
        // GET /api/v1/dashboard/calendar
        const res = await http.get<any>(`/api/v1/dashboard/calendar?month=${month}&year=${year}`);
        if (!mounted) return;
        const entries: CalendarEntry[] = Array.isArray(res?.days)
          ? res.days.map((d: any) => ({
              date: d?.date,
              hasWorkout: !!d?.workout,
              status: d?.workout?.completed ? 'completed' : d?.workout ? 'scheduled' : undefined,
              routineName: d?.workout?.name || d?.workout?.routine || undefined,
            }))
          : [];
        setCalendarData(entries);
      } catch {
        if (!mounted) return;
        setCalendarData([]);
      }
    })();

    (async () => {
      try {
        // GET /api/v1/workouts
        const list = await workoutsApi.list();
        if (!mounted) return;
        const mapped = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : [];
        setRoutines(mapped.map((w: any) => ({ id: String(w.id || w.uuid || w._id || w.name), name: w.name || 'Workout' })));
      } catch {
        if (!mounted) return;
        setRoutines([]);
      }
    })();

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
      setIsViewWorkoutDialogOpen(true);
    } else {
      setIsAddWorkoutDialogOpen(true);
    }
  };

  const handleAddWorkout = (routineId: string) => {
    // No calendar POST endpoint in spec; navigate to create workflow with preselected date
    setIsAddWorkoutDialogOpen(false);
    const qs = selectedDate ? `?date=${encodeURIComponent(selectedDate)}&template=${encodeURIComponent(routineId)}` : '';
    router.push(`/workouts/new${qs}`);
    setSelectedDate(null);
  };

  const handleSaveWorkoutData = () => {
    // Persisting set logs would use workouts session endpoints; left for workout screens
  };

  const handleCloseWorkoutDialog = (open: boolean) => {
    if (!open) handleSaveWorkoutData();
    setIsViewWorkoutDialogOpen(open);
    if (!open) setSelectedDate(null);
  };

  const handleCompleteWorkout = () => {
    // Completion handled within workout session pages in spec
    setIsViewWorkoutDialogOpen(false);
    setSelectedDate(null);
  };

  const handleDeleteWorkout = () => {
    // Removing scheduled workout would be done via workouts APIs on the workout detail page
    setIsViewWorkoutDialogOpen(false);
    setSelectedDate(null);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 dark:text-white mb-2">{t('calendar.title')}</h1>
          <p className="text-slate-600 dark:text-slate-400">{t('calendar.subtitle')}</p>
        </div>
        <Link href="/ai-chat">
          <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/50 transition-all">
            AI: {t('calendar.title')}
          </Button>
        </Link>
      </div>

      {/* Calendar */}
      <Card className="glass-card card-gradient-blue border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-900 dark:text-white capitalize">{monthName}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={previousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-slate-600 dark:text-slate-400 text-sm py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const entry = dayToEntry[dateStr];
              const today = new Date();
              const isToday = day === today.getDate() &&
                             currentMonth.getMonth() === today.getMonth() &&
                             currentMonth.getFullYear() === today.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(dateStr, !!entry?.hasWorkout)}
                  className={`aspect-square p-2 rounded-lg border transition-all hover-lift ${
                    isToday
                      ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20'
                      : entry?.hasWorkout
                      ? entry.status === 'completed'
                        ? 'border-blue-500 bg-blue-500/10 dark:bg-blue-500/20 hover:bg-blue-500/20 dark:hover:bg-blue-500/30'
                        : 'border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 hover:bg-purple-500/20 dark:hover:bg-purple-500/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="text-slate-900 dark:text-white text-sm mb-1">{day}</div>
                  {entry?.hasWorkout ? (
                    <div className={`text-xs ${entry.status === 'completed' ? 'text-blue-500' : 'text-purple-500'}`}>
                      {entry.routineName || 'Workout'}
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
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="glass-card card-gradient-emerald border-slate-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/10" />
              <span className="text-slate-700 dark:text-slate-300 text-sm">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-500/10" />
              <span className="text-slate-700 dark:text-slate-300 text-sm">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-500/10" />
              <span className="text-slate-700 dark:text-slate-300 text-sm">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-700" />
              <span className="text-slate-700 dark:text-slate-300 text-sm">Empty</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Workout Dialog */}
      <Dialog open={isAddWorkoutDialogOpen} onOpenChange={setIsAddWorkoutDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Workout</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select a routine to add on{' '}
              {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {routines.map((routine) => (
                <button
                  key={routine.id}
                  onClick={() => handleAddWorkout(routine.id)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:border-emerald-500 dark:hover:border-emerald-500 bg-card hover:bg-accent transition-all hover-lift group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="h-4 w-4 text-emerald-500 group-hover:text-emerald-600" />
                        <h4 className="text-foreground">{routine.name}</h4>
                      </div>
                    </div>
                    <Plus className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
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
                className="w-full text-left p-4 rounded-lg border-2 border-dashed border-border hover:border-emerald-500 dark:hover:border-emerald-500 bg-gradient-to-r from-emerald-500/5 to-emerald-600/5 hover:from-emerald-500/10 hover:to-emerald-600/10 transition-all hover-lift group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 dark:bg-emerald-500/20 p-2 rounded-lg group-hover:bg-emerald-500/20 dark:group-hover:bg-emerald-500/30 transition-colors">
                      <Plus className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-foreground">New Routine</h4>
                      <p className="text-sm text-muted-foreground">Create a custom routine</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddWorkoutDialogOpen(false);
                setSelectedDate(null);
              }}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Workout Dialog */}
      <Dialog open={isViewWorkoutDialogOpen} onOpenChange={handleCloseWorkoutDialog}>
        <DialogContent className="sm:max-w-[700px] bg-background border-border">
          {selectedDate && (() => {
            const entry = dayToEntry[selectedDate];
            if (!entry?.hasWorkout) return null;

            return (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <DialogTitle className="text-foreground mb-2">
                        {entry.routineName || 'Workout'}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </DialogDescription>
                    </div>
                    <Badge
                      variant={entry.status === 'completed' ? 'default' : 'secondary'}
                      className={entry.status === 'completed' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}
                    >
                      {entry.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </Badge>
                  </div>
                </DialogHeader>

                <ScrollArea className="max-h-[500px] pr-4">
                  <div className="space-y-4">
                    <Card className="glass-card card-gradient-emerald border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                          <Dumbbell className="h-5 w-5 text-emerald-500" />
                          Go to workout details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => router.push('/workouts')} className="mt-2">Open Workouts</Button>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>

                <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={handleDeleteWorkout}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 sm:mr-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <div className="flex gap-2 flex-1 sm:flex-initial">
                    <Button
                      variant="outline"
                      onClick={() => handleCloseWorkoutDialog(false)}
                      className="border-border text-foreground hover:bg-accent flex-1 sm:flex-initial"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleCompleteWorkout}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white flex-1 sm:flex-initial"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
