'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { workoutsApi } from '@/features/workouts/api/api';

export default function WorkoutCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Load selected exercises from sessionStorage when component mounts
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('selectedWorkoutExercises');
      if (stored) {
        const exercises = JSON.parse(stored);
        console.log('Loaded exercises from sessionStorage:', exercises);
        setSelectedExercises(exercises);
        // Clear sessionStorage after loading
        sessionStorage.removeItem('selectedWorkoutExercises');
      }
    } catch (err) {
      console.error('Error loading selected exercises:', err);
    }
  }, []);

  const handleSubmit = async () => {
    if (!routineName.trim()) {
      setError('Routine name is required');
      return;
    }
    if (selectedExercises.length === 0) {
      setError('You must add at least one exercise');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Format exercises according to backend expectations
      // Exercises should have: exercise_id, sets, reps, weight (optional)
      const exercises = selectedExercises.map((ex) => {
        // Try multiple possible ID fields
        const exerciseId = ex.id || ex.exercise_id || ex.uuid || ex._id;

        if (!exerciseId) {
          throw new Error(`Exercise "${ex.name}" is missing an ID`);
        }

        return {
          exercise_id: exerciseId,
          sets: parseInt(ex.sets) || 3,
          reps: parseInt(ex.reps) || 10,
          weight: parseFloat(ex.weight) || 0,
        };
      });

      // Prepare payload
      const payload: any = {
        name: routineName.trim(),
        description: description.trim() || '',
        exercises,
      };

      // Add optional fields if provided
      if (difficulty) {
        payload.difficulty = difficulty;
      }

      console.log('Creating workout with payload:', payload);

      const result = await workoutsApi.create(payload);

      console.log('Workout created successfully:', result);

      // Show success and redirect
      setError(''); // Clear error
      router.push('/workouts');
    } catch (err: any) {
      console.error('Error creating workout:', err);

      let msg = 'Error creating routine';

      if (err?.response?.data?.error?.message) {
        msg = err.response.data.error.message;
      } else if (err?.response?.data?.details) {
        msg = err.response.data.details;
      } else if (err?.message) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      }

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
        Back
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Routine</h1>
        <p className="text-slate-400">Configure your custom routine</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Routine Name *</Label>
                <Input
                  id="name"
                  placeholder="E.g: Push Pull Legs"
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="E.g: My weekly training plan"
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty} disabled={loading}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Selected Exercises *
                <Button
                  onClick={() => router.push('/exercises')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={loading}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exercises
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>No exercises selected yet</p>
                  <p className="text-xs mt-2">Click "Add Exercises" to select exercises for your routine</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedExercises.map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                      <div className="flex-1">
                        <span className="text-white block font-medium">{exercise.name}</span>
                        <span className="text-xs text-slate-400">
                          ID: {exercise.id || exercise.exercise_id || exercise.uuid || 'unknown'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => setSelectedExercises((prev) => prev.filter((_, i) => i !== index))}
                        disabled={loading}
                      >
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
              <CardTitle className="text-white">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Total Exercises</p>
                <p className="text-white text-2xl font-bold">{selectedExercises.length}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Estimated Duration</p>
                <p className="text-white text-2xl font-bold">{estimatedDuration} min</p>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded p-3 max-h-20 overflow-y-auto">
                  <p className="font-medium mb-1">Error:</p>
                  <p>{error}</p>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                disabled={!routineName.trim() || selectedExercises.length === 0 || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" variant="dumbbell" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Save Routine'
                )}
              </Button>

              {loading && (
                <div className="flex items-center justify-center py-2">
                  <p className="text-xs text-slate-400">Processing your routine...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
