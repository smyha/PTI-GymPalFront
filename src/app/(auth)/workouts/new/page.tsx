'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { workoutsApi } from '@/features/workouts/api/api';

export default function WorkoutCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!routineName.trim()) {
      setError('El nombre de la rutina es obligatorio');
      return;
    }
    if (selectedExercises.length === 0) {
      setError('Debes añadir al menos un ejercicio');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Format exercises according to CreateWorkoutRequest schema
      const exercises = selectedExercises.map((ex, index) => ({
        exerciseId: ex.id || ex.exerciseId || ex.uuid,
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        weight: ex.weight || 0,
        order: ex.order ?? index,
        ...(ex.duration && { duration: ex.duration }),
        ...(ex.restTime && { restTime: ex.restTime }),
      }));

      await workoutsApi.create({ 
        name: routineName.trim(),
        description: '',
        exercises 
      });
      router.push('/workouts');
    } catch (err: any) {
      const msg = err?.message || err?.error?.message || 'Error al crear la rutina';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  const estimatedDuration = selectedExercises.length > 0 ? selectedExercises.length * 8 : 0;

  return (
    <div className="space-y-8">
      <Link href="/workouts" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('common.back')}
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{t('workouts.createNew')}</h1>
        <p className="text-slate-400">{t('workouts.configureRoutine')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">{t('workouts.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">{t('workouts.routineName')}</Label>
                <Input
                  id="name"
                  placeholder={t('workouts.routineNamePlaceholder')}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">{t('workouts.frequency')}</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 {t('workouts.perWeek')}</SelectItem>
                      <SelectItem value="4">4 {t('workouts.perWeek')}</SelectItem>
                      <SelectItem value="5">5 {t('workouts.perWeek')}</SelectItem>
                      <SelectItem value="6">6 {t('workouts.perWeek')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">{t('workouts.level')}</Label>
                  <Select>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder={t('common.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">{t('workouts.beginner')}</SelectItem>
                      <SelectItem value="intermediate">{t('workouts.intermediate')}</SelectItem>
                      <SelectItem value="advanced">{t('workouts.advanced')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                {t('workouts.selectedExercises')}
                <Button
                  onClick={() => router.push('/exercises')}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('workouts.addExercises')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  {t('workouts.noExercisesSelected')}
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedExercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-white">{exercise.name}</span>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/50 sticky top-4">
            <CardHeader>
              <CardTitle className="text-white">{t('workouts.summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">{t('workouts.totalExercises')}</p>
                <p className="text-white text-2xl">{selectedExercises.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">{t('workouts.estimatedDuration')}</p>
                <p className="text-white text-2xl">{estimatedDuration} {t('workouts.minutes')}</p>
              </div>
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded p-2">
                  {error}
                </div>
              )}
              <Button
                onClick={handleSubmit}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                disabled={!routineName.trim() || selectedExercises.length === 0 || loading}
              >
                {loading ? t('common.loading') : t('workouts.saveRoutine')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


