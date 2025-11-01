'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { workoutsApi } from '@/features/workouts/api/api';

export default function WorkoutDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [workout, setWorkout] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await workoutsApi.get(params.id);
        if (!mounted) return;
        setWorkout(data);
      } catch {
        if (!mounted) return;
        setWorkout(null);
      }
    })();
    return () => { mounted = false; };
  }, [params.id]);

  const exercises = workout?.exercises || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white mb-2">{workout?.name || 'Rutina'}</h1>
          <p className="text-slate-400">{workout?.description || ''}</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Play className="h-4 w-4 mr-2" />
            Iniciar Entrenamiento
          </Button>
          <Link href={`/workouts/${params.id}/edit`}>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" className="border-slate-600 text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-3">
        {exercises.map((exercise: any, index: number) => (
          <Card key={exercise.id || index} className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500/10 w-10 h-10 rounded-lg flex items-center justify-center">
                    <span className="text-orange-500">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-white mb-1">{exercise.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {exercise.sets ?? '-'} series × {exercise.reps ?? '-'} reps
                    </p>
                  </div>
                </div>
                <Link href={`/exercises/${exercise.id || ''}`}>
                  <Button variant="ghost" className="text-slate-400 hover:text-white">
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50">
        <CardHeader>
          <CardTitle className="text-white">Resumen del Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Ejercicios</p>
              <p className="text-white text-2xl">{exercises.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Series Totales</p>
              <p className="text-white text-2xl">
                {exercises.reduce((acc: number, ex: any) => acc + (ex.sets || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Duración Est.</p>
              <p className="text-white text-2xl">{exercises.length * 8} min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


