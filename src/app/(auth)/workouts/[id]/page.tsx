'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { workoutsApi } from '@/features/workouts/api/api';
import { exercisesApi } from '@/features/exercises/api/api';
import { useAuthStore } from '@/lib/store/auth.store';
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
import { useTranslation } from 'react-i18next';
import { WorkoutTimer } from '@/components/shared/WorkoutTimer';

/**
 * WorkoutDetailPage Component
 * 
 * Displays detailed information about a specific workout routine.
 * Features:
 * - Workout title and description
 * - List of exercises with sets/reps
 * - Action buttons (Start, Edit, Delete)
 * - Workout summary statistics (Total sets, estimated duration)
 */
export default function WorkoutDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [workout, setWorkout] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  
  // Check if accessed from Social (workout from another user)
  const fromSocial = searchParams.get('from') === 'social';
  
  // Get exercises from workout (initialize early to avoid reference errors)
  const exercises = workout?.exercises || [];
  
  // Check if current user owns this workout
  const isOwner = user?.id && workout?.user_id === user.id;
  
  // Show edit/delete buttons only if user owns the workout and not from social
  const showEditDelete = isOwner && !fromSocial;
  
  // Calculate workout duration (use duration_minutes if available, otherwise estimate)
  const workoutDuration = workout?.duration_minutes || (exercises.length * 8) || 60;

  /**
   * Fetch workout details on mount
   * Handles fetching additional exercise data if not fully populated
   */
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await workoutsApi.get(params.id);
        if (!mounted) return;
        
        // If workout exercises were returned only as ids or without nested exercise objects,
        // fetch exercise details for each missing exercise to display names/details.
        const exercises = data?.exercises || [];
        const needFetch = exercises
          .filter((e: any) => !e.exercise || !e.exercise.name)
          .map((e: any) => e.exerciseId || e.exerciseId || e.exercise_id || e.exercise?.id || e.id);

        if (needFetch.length > 0) {
          try {
            // Deduplicate IDs to fetch
            const uniqueIds = Array.from(new Set(needFetch.filter(Boolean)));
            const fetched = await Promise.all(uniqueIds.map((id) => exercisesApi.get(String(id)).catch(() => null)));
            
            // Map fetched exercises by ID
            const fetchedById: Record<string, any> = {};
            fetched.forEach((f) => { if (f?.id) fetchedById[f.id] = f; });
            
            // Merge fetched exercise objects back into workout exercises
            data.exercises = exercises.map((ex: any) => {
              const exId = ex.exerciseId || ex.exercise_id || ex.exercise?.id || ex.id;
              const full = fetchedById[exId] || ex.exercise || null;
              return {
                ...ex,
                exercise: full ?? ex.exercise,
                id: ex.id ?? exId,
              };
            });
          } catch (err) {
            // ignore fetch errors and continue with whatever data we have
          }
        }

        setWorkout(data);
      } catch {
        if (!mounted) return;
        setWorkout(null);
      }
    })();
    return () => { mounted = false; };
  }, [params.id]);

  /**
   * Handle edit button click - redirect to edit page
   */
  const handleEdit = () => {
    router.push(`/workouts/${params.id}/edit`);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async () => {
    if (!workout) return;
    
    setIsDeleting(true);
    try {
      await workoutsApi.delete(params.id);
      // Redirect to workouts list after successful deletion
      router.push('/workouts');
    } catch (error: any) {
      console.error('Failed to delete workout:', error);
      alert(t('workouts.deleteError', { defaultValue: 'Failed to delete workout' }));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back', { defaultValue: 'Volver' })}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-slate-900 dark:text-white mb-2 text-3xl font-bold">{workout?.name || t('workouts.routine', { defaultValue: 'Rutina' })}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">{workout?.description || ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!fromSocial && (
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-shadow"
              onClick={() => setShowTimer(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              {t('workouts.startWorkout', { defaultValue: 'Iniciar Entrenamiento' })}
            </Button>
          )}
          {showEditDelete && (
            <>
              <Button 
                variant="outline" 
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('workouts.edit', { defaultValue: 'Editar' })}
              </Button>
              <Button 
                variant="outline" 
                className="border-red-300 dark:border-slate-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-400 dark:hover:border-red-500"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('workouts.delete', { defaultValue: 'Eliminar' })}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Workout Timer Dialog */}
      <WorkoutTimer
        open={showTimer}
        onOpenChange={setShowTimer}
        durationMinutes={workoutDuration}
        workoutName={workout?.name}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('workouts.deleteConfirmTitle', { defaultValue: 'Delete Workout' })}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('workouts.deleteConfirmMessage', { 
                defaultValue: 'Are you sure you want to delete this workout? This action cannot be undone.',
                name: workout?.name || t('workouts.workout', { defaultValue: 'workout' })
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? t('common.deleting', { defaultValue: 'Deleting...' }) : t('workouts.delete', { defaultValue: 'Delete' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exercises List */}
      <div className="space-y-3">
        {exercises.map((exercise: any, index: number) => (
          <Card 
            key={exercise.id || index} 
            className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-600/20 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-orange-600 dark:text-orange-400 font-bold text-lg">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 dark:text-white mb-1 font-semibold text-lg">{exercise.exercise?.name || exercise.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {exercise.sets ?? '-'} {t('workouts.sets', { defaultValue: 'series' })} × {exercise.reps ?? '-'} {t('workouts.reps', { defaultValue: 'reps' })}
                    </p>
                  </div>
                </div>
                <Link href={`/exercises/${exercise.exercise?.id || exercise.id || ''}`}>
                  <Button 
                    variant="ghost" 
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 whitespace-nowrap"
                  >
                    {t('common.viewDetails', { defaultValue: 'Ver Detalles' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Statistics */}
      <Card className="bg-gradient-to-r from-orange-50 via-pink-50 to-orange-50 dark:from-orange-500/20 dark:via-red-500/20 dark:to-orange-500/20 border-orange-300 dark:border-orange-500/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white text-xl font-bold">{t('workouts.workoutSummary', { defaultValue: 'Resumen del Entrenamiento' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/60 dark:bg-slate-800/40 rounded-lg p-4 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium">{t('workouts.totalExercises', { defaultValue: 'Ejercicios' })}</p>
              <p className="text-slate-900 dark:text-white text-3xl font-bold">{exercises.length}</p>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/40 rounded-lg p-4 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium">{t('workouts.totalSets', { defaultValue: 'Series Totales' })}</p>
              <p className="text-slate-900 dark:text-white text-3xl font-bold">
                {exercises.reduce((acc: number, ex: any) => acc + (ex.sets || 0), 0)}
              </p>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/40 rounded-lg p-4 shadow-sm">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium">{t('workouts.estimatedDuration', { defaultValue: 'Duración Est.' })}</p>
              <p className="text-slate-900 dark:text-white text-3xl font-bold">{workoutDuration} {t('workouts.minutes', { defaultValue: 'min' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
