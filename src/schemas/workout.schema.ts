import { z } from 'zod';

export const WorkoutSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  exercises: z.array(
    z.object({
      exerciseId: z.string().uuid(),
      sets: z.number().min(1).max(10),
      reps: z.number().min(1).max(100),
      weight: z.number().min(0).optional(),
      duration: z.number().min(0).optional(),
      restTime: z.number().min(0).optional(),
    })
  ),
  date: z.string().datetime(),
  duration: z.number().min(1),
  userId: z.string().uuid(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export const CreateWorkoutSchema = WorkoutSchema.omit({ id: true, userId: true });
export const UpdateWorkoutSchema = CreateWorkoutSchema.partial();

export type Workout = z.infer<typeof WorkoutSchema>;
export type CreateWorkout = z.infer<typeof CreateWorkoutSchema>;
export type UpdateWorkout = z.infer<typeof UpdateWorkoutSchema>;


