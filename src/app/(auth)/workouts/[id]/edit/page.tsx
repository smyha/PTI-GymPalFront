'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { workoutsApi } from '@/features/workouts/api/api';
import { exercisesApi } from '@/features/exercises/api/api';
import { useTranslation } from 'react-i18next';

export default function EditWorkoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [workoutData, exercisesData] = await Promise.all([
          workoutsApi.get(params.id).catch(() => null),
          exercisesApi.list().catch(() => null),
        ]);
        if (!mounted) return;
        
        if (workoutData) {
          setWorkout(workoutData);
          setName(workoutData.name || '');
          setDescription(workoutData.description || '');
          setSelectedExercises((workoutData.exercises || []).map((e: any) => String(e.id || e.exercise_id || e)));
        }
        
        if (exercisesData) {
          const items = Array.isArray(exercisesData?.data) ? exercisesData.data 
            : Array.isArray(exercisesData?.items) ? exercisesData.items 
            : Array.isArray(exercisesData?.exercises) ? exercisesData.exercises
            : Array.isArray(exercisesData) ? exercisesData : [];
          setExercises(items);
        }
      } catch (err) {
        console.error('Error loading workout:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params.id]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await workoutsApi.update(params.id, {
        name: name.trim(),
        description: description.trim(),
        exercises: selectedExercises,
      });
      router.push(`/workouts/${params.id}`);
    } catch (err) {
      console.error('Error updating workout:', err);
      alert(t('errors.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center text-slate-400">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/workouts/${params.id}`}>
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('workouts.editRoutine')}</h1>
      </div>

      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">{t('workouts.routineName')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-900 dark:text-white">{t('workouts.routineName')}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('workouts.routineNamePlaceholder')}
              className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-900 dark:text-white">{t('workouts.description') || 'Description'}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('workouts.descriptionPlaceholder') || 'Workout description...'}
              className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">{t('workouts.selectedExercises')}</CardTitle>
        </CardHeader>
        <CardContent>
          {exercises.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {exercises.map((exercise: any) => {
                const exId = String(exercise.id || exercise.uuid || exercise._id);
                const isSelected = selectedExercises.includes(exId);
                return (
                  <Button
                    key={exId}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => toggleExercise(exId)}
                    className={`justify-start ${isSelected ? 'bg-emerald-500 text-white' : ''}`}
                  >
                    {exercise.name}
                  </Button>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-400">{t('workouts.noExercisesSelected')}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Link href={`/workouts/${params.id}`}>
          <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
            {t('common.cancel')}
          </Button>
        </Link>
        <Button 
          onClick={handleSave} 
          disabled={!name.trim() || saving}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? t('common.loading') : t('common.save')}
        </Button>
      </div>
    </div>
  );
}
