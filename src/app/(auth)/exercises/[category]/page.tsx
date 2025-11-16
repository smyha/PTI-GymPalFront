'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exercisesApi } from '@/features/exercises/api/api';
import { useTranslation } from 'react-i18next';

export default function ExercisesCategoryPage() {
  const { t } = useTranslation();
  const params = useParams<{ category: string }>();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await exercisesApi.list();
        if (!mounted) return;
        const items = Array.isArray(list?.data) ? list.data 
          : Array.isArray(list?.items) ? list.items 
          : Array.isArray(list?.exercises) ? list.exercises
          : Array.isArray(list) ? list : [];
        // Filter by category
        const category = decodeURIComponent(params.category);
        const filtered = items.filter((e: any) => {
          const cat = (e.category || e.muscle_group || 'general').toString().toLowerCase();
          return cat === category.toLowerCase();
        });
        setExercises(filtered);
      } catch (err) {
        console.error('Error loading exercises:', err);
        if (!mounted) return;
        setExercises([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [params.category]);

  const categoryName = decodeURIComponent(params.category || '');

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
        <Link href="/exercises">
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {categoryName}
        </h1>
      </div>

      {exercises.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise: any) => (
            <Card key={String(exercise.id || exercise.uuid)} className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">{exercise.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-400">{exercise.description || ''}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6 text-center">
            <p className="text-slate-400">{t('exercises.noExercises')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
