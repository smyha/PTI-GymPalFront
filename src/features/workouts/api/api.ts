import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';

export type WorkoutExercise = {
  exercise_id: string;
  sets: number;
  reps: number;
  weight?: number;
};

export type Workout = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration?: number;
  difficulty?: string;
  exercises: WorkoutExercise[];
  tags?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateWorkoutRequest = {
  name: string;
  description?: string;
  duration?: number;
  difficulty?: string;
  exercises: WorkoutExercise[];
  tags?: string[];
  is_public?: boolean;
};

export type PaginatedWorkouts = {
  data: Workout[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * List workouts with pagination
 */
export async function listWorkouts(page: number = 1, limit: number = 10, filters?: {
  search?: string;
  difficulty?: string;
}) {
  apiLogger.info({ endpoint: '/api/v1/workouts', page, limit, filters }, 'List workouts request');
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.difficulty && { difficulty: filters.difficulty }),
    });
    const wrappedRes = await http.get<ApiResponse<PaginatedWorkouts>>(`/api/v1/workouts?${params}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No workouts in response');
    apiLogger.info({}, 'List workouts success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/workouts' });
    throw err;
  }
}

/**
 * Create new workout
 */
export async function createWorkout(request: CreateWorkoutRequest) {
  apiLogger.info({ endpoint: '/api/v1/workouts' }, 'Create workout request');
  try {
    const wrappedRes = await http.post<ApiResponse<Workout>>('/api/v1/workouts', request);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No workout in response');
    apiLogger.info({}, 'Create workout success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/workouts' });
    throw err;
  }
}

/**
 * Get workout by ID
 */
export async function getWorkout(id: string) {
  apiLogger.info({ endpoint: `/api/v1/workouts/${id}` }, 'Get workout request');
  try {
    const wrappedRes = await http.get<ApiResponse<Workout>>(`/api/v1/workouts/${id}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No workout in response');
    apiLogger.info({}, 'Get workout success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/workouts/${id}` });
    throw err;
  }
}

/**
 * Update workout
 */
export async function updateWorkout(id: string, request: Partial<CreateWorkoutRequest>) {
  apiLogger.info({ endpoint: `/api/v1/workouts/${id}` }, 'Update workout request');
  try {
    const wrappedRes = await http.put<ApiResponse<Workout>>(`/api/v1/workouts/${id}`, request);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No workout in response');
    apiLogger.info({}, 'Update workout success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/workouts/${id}` });
    throw err;
  }
}

/**
 * Delete workout
 */
export async function deleteWorkout(id: string) {
  apiLogger.info({ endpoint: `/api/v1/workouts/${id}` }, 'Delete workout request');
  try {
    await http.delete<ApiResponse<any>>(`/api/v1/workouts/${id}`);
    apiLogger.info({}, 'Delete workout success');
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/workouts/${id}` });
    throw err;
  }
}

/**
 * Workouts API object for convenience
 */
export const workoutsApi = {
  list: listWorkouts,
  create: createWorkout,
  get: getWorkout,
  update: updateWorkout,
  delete: deleteWorkout,
  remove: deleteWorkout, // Alias for delete
};
