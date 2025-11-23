import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';
import type * as Unified from '@/lib/types/unified.types';
import * as transformers from '@/lib/transformers';

export type CreateExerciseRequest = {
  name: string;
  description?: string;
  muscle_group?: string;
  equipment?: string[];
  difficulty?: string;
  tags?: string[];
  is_public: boolean;
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
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.muscleGroup) {
      params.append('muscleGroup', filters.muscleGroup);
    }
    if (filters?.equipment) {
      params.append('equipment', filters.equipment);
    }
    const wrappedRes = await http.get<any>(`/api/v1/exercises?${params}`);

    // Handle the response which has structure: { success, data: [...], pagination: {...}, metadata: {...} }
    const exercises = wrappedRes?.data || [];
    const pagination = wrappedRes?.pagination || { page, limit, total: exercises.length };

    if (!exercises || !Array.isArray(exercises)) {
      throw new Error('No exercises in response');
    }

    // Transform exercises directly
    const transformed = exercises.map((ex: any) => transformers.exerciseTransformers.transformExercise(ex));

    apiLogger.info({}, 'List exercises success');
    return {
      data: transformed,
      pagination,
    };
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
    const wrappedRes = await http.post<ApiResponse<Unified.Exercise>>('/api/v1/exercises', request);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No exercise in response');

    // Transform exercise
    const transformed = transformers.exerciseTransformers.transformExercise(rawData);
    apiLogger.info({}, 'Create exercise success');
    return transformed;
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
    const wrappedRes = await http.get<ApiResponse<Unified.Exercise>>(`/api/v1/exercises/${id}`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No exercise in response');

    // Transform exercise
    const transformed = transformers.exerciseTransformers.transformExercise(rawData);
    apiLogger.info({}, 'Get exercise success');
    return transformed;
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
    const wrappedRes = await http.put<ApiResponse<Unified.Exercise>>(`/api/v1/exercises/${id}`, request);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No exercise in response');

    // Transform exercise
    const transformed = transformers.exerciseTransformers.transformExercise(rawData);
    apiLogger.info({}, 'Update exercise success');
    return transformed;
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
