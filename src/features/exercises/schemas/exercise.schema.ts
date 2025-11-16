import { z } from 'zod';

export const exerciseFiltersSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().optional(),
});

export const exerciseCategorySchema = z.object({
  id: z.string().min(1, 'El ID de la categoría es obligatorio'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
});

export type ExerciseFilters = z.infer<typeof exerciseFiltersSchema>;
export type ExerciseCategory = z.infer<typeof exerciseCategorySchema>;
