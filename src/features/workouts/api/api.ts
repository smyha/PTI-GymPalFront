/**
 * Workouts API Module
 *
 * Provides client-side API methods for workout operations including:
 * - Listing workouts with pagination and filtering
 * - Creating new workouts
 * - Retrieving individual workout details
 * - Updating and deleting workouts
 * - Adding workouts to calendar dates
 */

import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';
import type * as Unified from '@/lib/types/unified.types';
import * as transformers from '@/lib/transformers';

/**
 * Request payload for creating a new workout
 *
 * @property {string} name - Name of the workout
 * @property {string} [description] - Optional description
 * @property {number} [duration] - Duration in minutes (default: 60)
 * @property {string} [difficulty] - Difficulty level (beginner, intermediate, advanced)
 * @property {Array} exercises - List of exercises to include
 * @property {string[]} [tags] - Optional tags for categorization
 * @property {boolean} [is_public] - Whether the workout is public
 */
export type CreateWorkoutRequest = {
  name: string;
  description?: string;
  duration?: number;
  difficulty?: string;
  exercises: {
    exercise_id: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
  tags?: string[];
  is_public?: boolean;
};

/**
 * Lists all workouts with optional pagination and filtering
 *
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=20] - Number of workouts per page
 * @param {Object} [filters] - Optional filters
 * @param {string} [filters.search] - Search query for workout names
 * @param {string} [filters.difficulty] - Filter by difficulty level
 * @returns {Promise<any>} Paginated list of workouts
 *
 * @example
 * const workouts = await workoutsApi.list(1, 20, { difficulty: 'intermediate' });
 *
 * @throws {Error} If the API request fails
 */
export async function listWorkouts(
  page: number = 1,
  limit: number = 20,
  filters?: {
    search?: string;
    difficulty?: string;
  }
) {
  const endpoint = '/api/v1/workouts';
  apiLogger.info({ endpoint, page, limit, filters }, 'Listing workouts');

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.search && { search: filters.search }),
      ...(filters?.difficulty && { difficulty: filters.difficulty }),
    });

    const response = await http.get<ApiResponse<Unified.PaginatedList<Unified.Workout>>>(
      `${endpoint}?${params}`
    );
    const data = response?.data;

    if (!data) {
      throw new Error('No workouts in response');
    }

    // Transform paginated workouts
    const transformed = transformers.listTransformers.transformPaginatedWorkouts(data);
    apiLogger.info({ count: data.pagination?.total || 0 }, 'Workouts listed successfully');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint, page, limit, filters });
    throw err;
  }
}

/**
 * Creates a new workout
 *
 * @param {CreateWorkoutRequest} request - Workout creation request payload
 * @returns {Promise<any>} The created workout object
 *
 * @example
 * const workout = await workoutsApi.create({
 *   name: 'Full Body Workout',
 *   difficulty: 'intermediate',
 *   exercises: [...]
 * });
 *
 * @throws {Error} If the API request fails
 */
export async function createWorkout(request: CreateWorkoutRequest) {
  const endpoint = '/api/v1/workouts';
  apiLogger.info({ endpoint }, 'Creating new workout');

  try {
    const response = await http.post<ApiResponse<Unified.Workout>>(endpoint, request);
    const data = response?.data;

    if (!data) {
      throw new Error('No workout data in response');
    }

    const transformed = transformers.workoutTransformers.transformWorkout(data);
    apiLogger.info({ workoutId: data.id }, 'Workout created successfully');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint, workoutName: request.name });
    throw err;
  }
}

/**
 * Retrieves a workout by its ID
 *
 * @param {string} id - The workout ID
 * @returns {Promise<any>} The workout object with exercises
 *
 * @example
 * const workout = await workoutsApi.get('workout-123');
 *
 * @throws {Error} If the API request fails
 */
export async function getWorkout(id: string) {
  const endpoint = `/api/v1/workouts/${id}`;
  apiLogger.info({ endpoint }, 'Retrieving workout');

  try {
    const response = await http.get<ApiResponse<Unified.Workout>>(endpoint);
    const data = response?.data;

    if (!data) {
      throw new Error('No workout data in response');
    }

    const transformed = transformers.workoutTransformers.transformWorkout(data);
    apiLogger.info({ workoutId: id }, 'Workout retrieved successfully');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint, workoutId: id });
    throw err;
  }
}

/**
 * Updates an existing workout
 *
 * @param {string} id - The workout ID
 * @param {Partial<CreateWorkoutRequest>} request - Partial workout update payload
 * @returns {Promise<any>} The updated workout object
 *
 * @example
 * const updated = await workoutsApi.update('workout-123', {
 *   name: 'Updated Workout Name'
 * });
 *
 * @throws {Error} If the API request fails
 */
export async function updateWorkout(id: string, request: Partial<CreateWorkoutRequest>) {
  const endpoint = `/api/v1/workouts/${id}`;
  apiLogger.info({ endpoint }, 'Updating workout');

  try {
    const response = await http.put<ApiResponse<Unified.Workout>>(endpoint, request);
    const data = response?.data;

    if (!data) {
      throw new Error('No workout data in response');
    }

    const transformed = transformers.workoutTransformers.transformWorkout(data);
    apiLogger.info({ workoutId: id }, 'Workout updated successfully');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint, workoutId: id });
    throw err;
  }
}

/**
 * Deletes a workout
 *
 * @param {string} id - The workout ID
 * @returns {Promise<void>}
 *
 * @example
 * await workoutsApi.delete('workout-123');
 *
 * @throws {Error} If the API request fails
 */
export async function deleteWorkout(id: string) {
  const endpoint = `/api/v1/workouts/${id}`;
  apiLogger.info({ endpoint }, 'Deleting workout');

  try {
    await http.delete<ApiResponse<any>>(endpoint);
    apiLogger.info({ workoutId: id }, 'Workout deleted successfully');
  } catch (err) {
    logError(err as Error, { endpoint, workoutId: id });
    throw err;
  }
}

/**
 * Adds a workout to today's schedule
 *
 * @param {string} workoutId - The workout ID to add
 * @returns {Promise<any>} Response from the calendar endpoint
 *
 * @example
 * const result = await workoutsApi.addToday('workout-123');
 *
 * @throws {Error} If the API request fails
 */
export async function addWorkoutToday(workoutId: string) {
  const endpoint = '/api/v1/calendar/add-workout';
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  apiLogger.info({ endpoint, workoutId, date: dateStr }, 'Adding workout to today');

  try {
    const response = await http.post<ApiResponse<any>>(endpoint, {
      workout_id: workoutId,
      date: dateStr,
    });

    if (!response?.data) {
      throw new Error('No response data from add workout endpoint');
    }

    apiLogger.info({ workoutId, date: dateStr }, 'Workout added to today successfully');
    return response.data;
  } catch (err) {
    logError(err as Error, { endpoint, workoutId, date: dateStr });
    throw err;
  }
}

/**
 * Get workout count for a user (total created workouts)
 */
export async function getWorkoutCount(userId: string) {
  const endpoint = `/api/v1/workouts/users/${userId}/count`;
  apiLogger.info({ endpoint }, 'Get workout count request');
  try {
    const wrappedRes = await http.get<ApiResponse<{ count: number }>>(endpoint);
    const data = wrappedRes?.data;
    if (data === undefined) throw new Error('No count in response');
    apiLogger.info({}, 'Get workout count success');
    return data.count;
  } catch (err) {
    logError(err as Error, { endpoint });
    throw err;
  }
}

/**
 * Get completed workout count for a user by period
 * @param userId - User ID
 * @param period - Period: 'week', 'month', 'year', or 'all'
 * @param date - Optional reference date (YYYY-MM-DD format)
 */
export async function getCompletedWorkoutCount(userId: string, period: 'week' | 'month' | 'year' | 'all' = 'all', date?: string) {
  const dateStr = date || new Date().toISOString().split('T')[0];
  const endpoint = `/api/v1/workouts/users/${userId}/completed-count?period=${period}&date=${dateStr}`;
  apiLogger.info({ endpoint, period, date: dateStr }, 'Get completed workout count request');
  try {
    const wrappedRes = await http.get<ApiResponse<{ count: number; period: string }>>(endpoint);
    const data = wrappedRes?.data;
    if (data === undefined) throw new Error('No count in response');
    apiLogger.info({ count: data.count, period }, 'Get completed workout count success');
    return data.count;
  } catch (err) {
    logError(err as Error, { endpoint, period });
    throw err;
  }
}

/**
 * Get completed exercise count for a user by period
 * @param userId - User ID
 * @param period - Period: 'week', 'month', 'year', or 'all'
 * @param date - Optional reference date (YYYY-MM-DD format)
 */
export async function getCompletedExerciseCount(userId: string, period: 'week' | 'month' | 'year' | 'all' = 'all', date?: string) {
  const dateStr = date || new Date().toISOString().split('T')[0];
  const endpoint = `/api/v1/workouts/users/${userId}/completed-exercises-count?period=${period}&date=${dateStr}`;
  apiLogger.info({ endpoint, period, date: dateStr }, 'Get completed exercise count request');
  try {
    const wrappedRes = await http.get<ApiResponse<{ count: number; period: string }>>(endpoint);
    const data = wrappedRes?.data;
    if (data === undefined) throw new Error('No count in response');
    apiLogger.info({ count: data.count, period }, 'Get completed exercise count success');
    return data.count;
  } catch (err) {
    logError(err as Error, { endpoint, period });
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
  addToday: addWorkoutToday,
  getWorkoutCount: getWorkoutCount,
  getCompletedWorkoutCount: getCompletedWorkoutCount,
  getCompletedExerciseCount: getCompletedExerciseCount,
};
