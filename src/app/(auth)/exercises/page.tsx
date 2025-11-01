'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exercisesApi } from '@/features/exercises/api/api';

export default function ExercisesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await exercisesApi.list();
        if (!mounted) return;
        // Handle different response formats from backend
        const items = Array.isArray(list?.data) ? list.data 
          : Array.isArray(list?.items) ? list.items 
          : Array.isArray(list?.exercises) ? list.exercises
          : Array.isArray(list) ? list : [];
        setExercises(items);
      } catch (err) {
        console.error('Error loading exercises:', err);
        if (!mounted) return;
        setExercises([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const byCategory = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const e of exercises) {
      const cat = (e.category || e.muscle_group || 'general').toString().toLowerCase();
      if (!map[cat]) map[cat] = [];
      map[cat].push({ id: String(e.id || e.uuid || e._id), name: e.name, difficulty: e.difficulty || '' });
    }
    return map;
  }, [exercises]);

  const categories = Object.keys(byCategory).length ? Object.keys(byCategory) : ['general'];

  const toggleExercise = (id: string) => {
    setSelectedExercises((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  };

  const handleSave = () => {
    router.back();
  };

  const passesSearch = (name: string) => name.toLowerCase().includes(searchQuery.trim().toLowerCase());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
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
        <Button
          onClick={handleSave}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
          disabled={selectedExercises.length === 0}
        >
          <Check className="h-4 w-4 mr-2" />
          Añadir ({selectedExercises.length})
        </Button>
      </div>

      <div>
        <h1 className="text-white mb-2">Biblioteca de Ejercicios</h1>
        <p className="text-slate-400">Selecciona los ejercicios para tu rutina</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Buscar ejercicios..."
          className="pl-10 bg-slate-800/50 border-slate-700 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Exercise Categories */}
      <Tabs defaultValue={categories[0]} className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          {categories.map((c) => (
            <TabsTrigger key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-3">
            {(byCategory[category] || []).filter((e) => passesSearch(e.name)).map((exercise: any) => {
              const isSelected = selectedExercises.includes(exercise.id);
              return (
                <Card
                  key={exercise.id}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500'
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => toggleExercise(exercise.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white mb-1">{exercise.name}</h3>
                        <p className="text-slate-400 text-sm">{exercise.difficulty}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}


