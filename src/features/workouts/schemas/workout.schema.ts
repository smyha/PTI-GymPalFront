import { z } from 'zod';

export const exerciseInputSchema = z.object({
  exerciseId: z.string().min(1, 'El ejercicio es obligatorio'),
  sets: z.number().int().min(1, 'Mínimo 1 serie').max(10, 'Máximo 10 series').default(3),
  reps: z.number().int().min(1, 'Mínimo 1 repetición').max(100, 'Máximo 100 repeticiones').default(10),
  weight: z.number().nonnegative('El peso no puede ser negativo').default(0),
  duration: z.number().positive('La duración debe ser positiva').optional(),
  restTime: z.number().nonnegative('El descanso no puede ser negativo').optional(),
  order: z.number().int().nonnegative().optional(),
});

export const createWorkoutSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(50, 'Máximo 50 caracteres'),
  description: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  exercises: z.array(exerciseInputSchema).min(1, 'Debes añadir al menos un ejercicio'),
});

export const updateWorkoutSchema = createWorkoutSchema.partial();

export const workoutFiltersSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().optional(),
});

export type ExerciseInput = z.infer<typeof exerciseInputSchema>;
export type CreateWorkoutFormData = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutFormData = z.infer<typeof updateWorkoutSchema>;
export type WorkoutFilters = z.infer<typeof workoutFiltersSchema>;
