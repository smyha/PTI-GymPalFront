'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Plus, List, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { workoutsApi } from '@/features/workouts/api/api';
import { useTranslation } from 'react-i18next';

export default function WorkoutsPage() {
  const { t } = useTranslation();
  const [visibleRoutines, setVisibleRoutines] = useState(6);
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await workoutsApi.list();
        if (!mounted) return;
        const items = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : [];
        setRoutines(items);
      } catch {
        if (!mounted) return;
        setRoutines([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleShowMore = () => {
    setVisibleRoutines((prev) => prev + 6);
  };

  const handleDeleteRoutine = async () => {
    if (routineToDelete !== null) {
      try {
        await workoutsApi.remove(routineToDelete);
        setRoutines((prev) => prev.filter((r) => String(r.id || r.uuid || r._id) !== routineToDelete));
      } finally {
        setRoutineToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('workouts.title')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">{t('workouts.subtitle')}</p>
        </div>
        <Link href="/workouts/new">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            {t('workouts.createNew')}
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link href="/workouts/new">
          <Card className="glass-card border-orange-200 dark:border-orange-500/30 card-gradient-yellow hover-lift shadow-lg cursor-pointer group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-1">{t('workouts.createNew')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{t('workouts.configureRoutine')}</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/ai-chat">
          <Card className="glass-card border-purple-200 dark:border-purple-500/30 card-gradient-purple hover-lift shadow-lg cursor-pointer group">
            <CardContent className="pt-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Dumbbell className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-1">AI: {t('workouts.createNew')}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">{t('aiChat.title')}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Routines List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('workouts.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.slice(0, visibleRoutines).map((routine: any) => {
            const id = String(routine.id || routine.uuid || routine._id);
            return (
              <Card key={id} className="glass-card border-orange-200 dark:border-orange-500/30 card-gradient-yellow hover-lift shadow-lg group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRoutineToDelete(id)}
                  className="absolute top-3 right-3 z-10 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <CardHeader className="relative">
                  <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg shadow-md">
                      <Dumbbell className="h-4 w-4 text-white" />
                    </div>
                    {routine.name || 'Rutina'}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {(routine.exercises?.length ?? 0)} {t('workouts.totalExercises')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex gap-2">
                    <Link href={`/workouts/${id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                        {t('workouts.viewRoutine')}
                      </Button>
                    </Link>
                    <Button variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Show More Button */}
        {visibleRoutines < routines.length && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={handleShowMore}
              variant="outline"
              className="border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover-lift"
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              {t('workouts.showMore')} ({routines.length - visibleRoutines})
            </Button>
          </div>
        )}
        {routines.length === 0 && (
          <Card className="glass-card border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6 text-center">
              <p className="text-slate-600 dark:text-slate-400">{t('workouts.noRoutines')}</p>
              <p className="text-sm text-slate-500 mt-2">{t('workouts.noRoutinesDescription')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={routineToDelete !== null} onOpenChange={(open) => !open && setRoutineToDelete(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('workouts.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('workouts.confirmDeleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRoutine} className="bg-red-500 hover:bg-red-600 text-white">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


