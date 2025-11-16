import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';

export type Exercise = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  muscle_group?: string;
  equipment?: string[];
  difficulty?: string;
  tags?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type ExerciseCatalog = {
  id: string;
  name: string;
  description?: string;
  muscle_group?: string;
  equipment?: string[];
  difficulty?: string;
};

export type CreateExerciseRequest = {
  name: string;
  description?: string;
  muscle_group?: string;
  equipment?: string[];
  difficulty?: string;
  tags?: string[];
  is_public: boolean;
};

export type PaginatedExercises = {
  data: Exercise[];
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
 * Get exercise categories
 */
export async function getExerciseCategories() {
  apiLogger.info({ endpoint: '/api/v1/exercises/categories' }, 'Get exercise categories request');
  try {
    const wrappedRes = await http.get<ApiResponse<string[]>>('/api/v1/exercises/categories');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No categories in response');
    apiLogger.info({}, 'Get exercise categories success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/exercises/categories' });
    throw err;
  }
}

/**
 * Get muscle groups
 */
export async function getMuscleGroups() {
  apiLogger.info({ endpoint: '/api/v1/exercises/muscle-groups' }, 'Get muscle groups request');
  try {
    const wrappedRes = await http.get<ApiResponse<string[]>>('/api/v1/exercises/muscle-groups');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No muscle groups in response');
    apiLogger.info({}, 'Get muscle groups success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/exercises/muscle-groups' });
    throw err;
  }
}

/**
 * Get equipment types
 */
export async function getEquipment() {
  apiLogger.info({ endpoint: '/api/v1/exercises/equipment' }, 'Get equipment request');
  try {
    const wrappedRes = await http.get<ApiResponse<string[]>>('/api/v1/exercises/equipment');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No equipment in response');
    apiLogger.info({}, 'Get equipment success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/exercises/equipment' });
    throw err;
  }
}

/**
 * List exercises with pagination and filters
 */
export async function listExercises(page: number = 1, limit: number = 10, filters?: {
  category?: string;
  muscleGroup?: string;
  equipment?: string;
}) {
  apiLogger.info({ endpoint: '/api/v1/exercises', page, limit, filters }, 'List exercises request');
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.muscleGroup && { muscleGroup: filters.muscleGroup }),
      ...(filters?.equipment && { equipment: filters.equipment }),
    });
    const wrappedRes = await http.get<ApiResponse<PaginatedExercises>>(`/api/v1/exercises?${params}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No exercises in response');
    apiLogger.info({}, 'List exercises success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/exercises' });
    throw err;
  }
}

/**
 * Create new exercise
 */
export async function createExercise(request: CreateExerciseRequest) {
  apiLogger.info({ endpoint: '/api/v1/exercises' }, 'Create exercise request');
  try {
    const wrappedRes = await http.post<ApiResponse<Exercise>>('/api/v1/exercises', request);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No exercise in response');
    apiLogger.info({}, 'Create exercise success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/exercises' });
    throw err;
  }
}

/**
 * Get exercise by ID
 */
export async function getExercise(id: string) {
  apiLogger.info({ endpoint: `/api/v1/exercises/${id}` }, 'Get exercise request');
  try {
    const wrappedRes = await http.get<ApiResponse<Exercise>>(`/api/v1/exercises/${id}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No exercise in response');
    apiLogger.info({}, 'Get exercise success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/exercises/${id}` });
    throw err;
  }
}

/**
 * Update exercise
 */
export async function updateExercise(id: string, request: Partial<CreateExerciseRequest>) {
  apiLogger.info({ endpoint: `/api/v1/exercises/${id}` }, 'Update exercise request');
  try {
    const wrappedRes = await http.put<ApiResponse<Exercise>>(`/api/v1/exercises/${id}`, request);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No exercise in response');
    apiLogger.info({}, 'Update exercise success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/exercises/${id}` });
    throw err;
  }
}

/**
 * Delete exercise
 */
export async function deleteExercise(id: string) {
  apiLogger.info({ endpoint: `/api/v1/exercises/${id}` }, 'Delete exercise request');
  try {
    await http.delete<ApiResponse<any>>(`/api/v1/exercises/${id}`);
    apiLogger.info({}, 'Delete exercise success');
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/exercises/${id}` });
    throw err;
  }
}

/**
 * Exercises API object for convenience
 */
export const exercisesApi = {
  categories: getExerciseCategories,
  muscleGroups: getMuscleGroups,
  equipment: getEquipment,
  list: listExercises,
  create: createExercise,
  get: getExercise,
  update: updateExercise,
  delete: deleteExercise,
};
