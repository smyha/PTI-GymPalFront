'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { workoutsApi } from '@/features/workouts/api/api';

/**
 * WorkoutCreatePage Component
 * 
 * Form for creating a new workout routine.
 * Features:
 * - Basic info (Name, Description, Difficulty)
 * - Advanced settings (Type, Frequency, Notes)
 * - Exercise selection (persisted via localStorage to survive navigation)
 * - Form validation and submission
 */
export default function WorkoutCreatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  // Form State
  const [workoutName, setWorkoutName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  
  // New fields
  const [workoutType, setWorkoutType] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [isPublic, setIsPublic] = useState(true); // Default to public
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  /**
   * Load form data from localStorage on mount.
   * This allows users to navigate to the exercise selector and back without losing data.
   * Also supports editing existing workouts (when workoutEditId is set).
   */
  useEffect(() => {
    try {
      // Check if this is an edit operation
      const editId = localStorage.getItem('workoutEditId');
      const isEdit = !!editId;
      
      // Load exercises
      const storedExercises = localStorage.getItem('workoutFormExercises');
      if (storedExercises) {
        const exercises = JSON.parse(storedExercises);
        setSelectedExercises(exercises);
      }

      // Load form fields
      const storedRoutineName = localStorage.getItem('workoutFormName');
      if (storedRoutineName) setWorkoutName(storedRoutineName);

      const storedDescription = localStorage.getItem('workoutFormDescription');
      if (storedDescription) setDescription(storedDescription);

      const storedDifficulty = localStorage.getItem('workoutFormDifficulty');
      if (storedDifficulty) setDifficulty(storedDifficulty);

      // Load new fields
      const storedType = localStorage.getItem('workoutFormType');
      if (storedType) setWorkoutType(storedType);
      
      const storedDays = localStorage.getItem('workoutFormDays');
      if (storedDays) setDaysPerWeek(storedDays);
      
      const storedNotes = localStorage.getItem('workoutFormNotes');
      if (storedNotes) setUserNotes(storedNotes);

      const storedIsPublic = localStorage.getItem('workoutFormIsPublic');
      if (storedIsPublic !== null) setIsPublic(storedIsPublic === 'true');

      // Store edit ID in component state if editing
      if (isEdit) {
        // The edit ID is already in localStorage, we'll use it in handleSubmit
      }

      setIsInitialized(true);
    } catch (err) {
      setIsInitialized(true);
    }
  }, []);

  // --- Persistence Effects: Save form data to localStorage on change ---

  useEffect(() => {
    if (isInitialized) localStorage.setItem('workoutFormName', workoutName);
  }, [workoutName, isInitialized]);

  useEffect(() => {
    if (isInitialized) localStorage.setItem('workoutFormDescription', description);
  }, [description, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('workoutFormDifficulty', difficulty);
      localStorage.setItem('workoutFormType', workoutType);
      localStorage.setItem('workoutFormDays', daysPerWeek);
      localStorage.setItem('workoutFormNotes', userNotes);
      localStorage.setItem('workoutFormIsPublic', isPublic.toString());
    }
  }, [difficulty, workoutType, daysPerWeek, userNotes, isPublic, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('workoutFormExercises', JSON.stringify(selectedExercises));
    }
  }, [selectedExercises, isInitialized]);

  /**
   * Handle form submission
   * Validates input and calls API to create workout
   */
  const handleSubmit = async () => {
    if (!workoutName.trim()) {
      setError('Workout name is required');
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
      const exercises = selectedExercises.map((ex) => {
        // Try multiple possible ID fields
        const exerciseId = ex.id || ex.exercise_id || ex.uuid || ex._id;

        if (!exerciseId) {
          throw new Error(`Exercise "${ex.name}" is missing an ID`);
        }

        const exerciseData: any = {
          exercise_id: exerciseId,
          sets: parseInt(ex.sets) || 3,
          reps: parseInt(ex.reps) || 10,
        };

        // Only include weight if it's provided and greater than 0
        const weight = parseFloat(ex.weight);
        if (weight && weight > 0) {
          exerciseData.weight = weight;
        }

        return exerciseData;
      });

      // Prepare payload
      const payload: any = {
        name: workoutName.trim(),
        description: description.trim() || '',
        duration_minutes: estimatedDuration || 60, // Use estimated duration or default
        exercises,
      };

      // Add optional fields if provided
      if (difficulty) payload.difficulty = difficulty;
      if (workoutType) payload.type = workoutType;
      if (daysPerWeek) payload.days_per_week = parseInt(daysPerWeek);
      if (userNotes) payload.user_notes = userNotes;
      payload.is_public = isPublic; // Always include visibility setting

      // Check if this is an edit operation
      const editId = localStorage.getItem('workoutEditId');
      if (editId) {
        // Update existing workout
        await workoutsApi.update(editId, payload);
        // Clear edit ID
        localStorage.removeItem('workoutEditId');
        // Redirect to workout detail page
        router.push(`/workouts/${editId}`);
      } else {
        // Create new workout
        const created = await workoutsApi.create(payload);
        // Redirect to the created workout detail page
        if (created?.id) {
          router.push(`/workouts/${created.id}`);
        } else {
          router.push('/workouts');
        }
      }

      // Show success and redirect
      setError('');

      // Clear localStorage data after successful creation/update
      localStorage.removeItem('workoutFormName');
      localStorage.removeItem('workoutFormDescription');
      localStorage.removeItem('workoutFormDifficulty');
      localStorage.removeItem('workoutFormExercises');
      localStorage.removeItem('workoutFormType');
      localStorage.removeItem('workoutFormDays');
      localStorage.removeItem('workoutFormNotes');
      localStorage.removeItem('workoutFormIsPublic');

      router.push('/workouts');
    } catch (err: any) {
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
        {/* Main Form Area */}
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
                    value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label className="text-white">Workout Type</Label>
                  <Select value={workoutType} onValueChange={setWorkoutType} disabled={loading}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="strength">Strength Training</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                      <SelectItem value="endurance">Endurance</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="hiit">HIIT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="days" className="text-white">Frequency (Days/Week)</Label>
                  <Input
                    id="days"
                    type="number"
                    min="1"
                    max="7"
                    placeholder="e.g. 3"
                    className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500"
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(e.target.value)}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">Estimated Duration</Label>
                  <div className="p-2 bg-slate-900/50 border border-slate-700 rounded-md text-slate-400">
                    {estimatedDuration > 0 ? `${estimatedDuration} min` : 'Add exercises first'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">Personal Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific instructions or reminders..."
                  className="bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 resize-none h-20"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic" className="text-white">{t('workouts.makePublic')}</Label>
                  <p className="text-xs text-slate-400">{t('workouts.makePublicDescription')}</p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Exercises Section */}
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

        {/* Sidebar / Summary */}
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
                disabled={!workoutName.trim() || selectedExercises.length === 0 || loading}
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
