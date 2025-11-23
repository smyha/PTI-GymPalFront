/**
 * Calendar API Module
 *
 * Provides client-side API methods for calendar operations including:
 * - Fetching calendar data for a specific month/year
 * - Adding workouts to calendar dates
 * - Retrieving calendar entries
 */

import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';
import type {
  CalendarDay,
  CalendarResponse,
  AddWorkoutRequest,
  AddWorkoutResponse,
} from './types';

/**
 * Fetches calendar data for a specific month and year
 *
 * @param {number} month - Month number (1-12)
 * @param {number} year - Year number (e.g., 2025)
 * @returns {Promise<CalendarDay[]>} Array of calendar day entries
 *
 * @example
 * const days = await calendarApi.getMonth(11, 2025);
 *
 * @throws {Error} If the API request fails
 */
export async function getMonth(month: number, year: number): Promise<CalendarDay[]> {
  // The calendar module exposes endpoints under `/api/v1/calendar`.
  // Older code used the dashboard namespace (`/api/v1/dashboard/calendar`) which does not exist.
  const endpoint = `/api/v1/calendar?month=${month}&year=${year}`;
  apiLogger.info({ endpoint, month, year }, 'Fetching calendar data');

  try {
    const response = await http.get<ApiResponse<CalendarResponse>>(endpoint);
    const data = response?.data;

    if (!data) {
      throw new Error('No calendar data in response');
    }

    apiLogger.info({ month, year, dayCount: data.days?.length || 0 }, 'Calendar data retrieved');
    return data.days || [];
  } catch (err) {
    logError(err as Error, { endpoint, month, year });
    throw err;
  }
}

/**
 * Adds a workout to a specific calendar date
 *
 * @param {string} workoutId - ID of the workout to add
 * @param {string} date - Date in format YYYY-MM-DD
 * @param {string} [annotations] - Optional annotations for the scheduled workout
 * @returns {Promise<AddWorkoutResponse>} Response indicating success
 *
 * @example
 * const result = await calendarApi.addWorkout('workout-123', '2025-11-20', 'Focus on form');
 *
 * @throws {Error} If the API request fails
 */
export async function addWorkout(workoutId: string, date: string, annotations?: string): Promise<AddWorkoutResponse> {
  const endpoint = '/api/v1/calendar/add-workout';
  apiLogger.info({ endpoint, workoutId, date, annotations }, 'Adding workout to calendar');

  try {
    // backend expects `workout_id` (snake_case) and `annotations`
    const payload: any = {
      workout_id: workoutId,
      date,
    };
    if (annotations) {
      payload.annotations = annotations;
    }

    const response = await http.post<ApiResponse<AddWorkoutResponse>>(endpoint, payload);
    const data = response?.data;

    if (!data) {
      throw new Error('No response data from add workout endpoint');
    }

    apiLogger.info({ workoutId, date }, 'Workout added to calendar successfully');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint, workoutId, date });
    throw err;
  }
}

/**
 * Calendar API object providing convenient access to all calendar operations
 *
 * @example
 * // Get calendar for November 2025
 * const days = await calendarApi.getMonth(11, 2025);
 *
 * // Add workout to a specific date
 * await calendarApi.addWorkout('workout-id', '2025-11-20');
 */


/**
 * Deletes a scheduled calendar entry by id
 * @param id Scheduled entry id
 */
export async function deleteScheduled(id: string): Promise<boolean> {
  const endpoint = `/api/v1/calendar/${id}`;
  apiLogger.info({ endpoint, id }, 'Deleting scheduled calendar entry');

  try {
    await http.delete(endpoint);
    apiLogger.info({ id }, 'Scheduled entry deleted');
    return true;
  } catch (err) {
    logError(err as Error, { endpoint, id });
    throw err;
  }
}

/**
 * Marks a scheduled workout as completed
 * @param id Scheduled entry id
 */
export async function completeScheduled(id: string): Promise<boolean> {
  const endpoint = `/api/v1/calendar/${id}`;
  apiLogger.info({ endpoint, id }, 'Marking scheduled workout as completed');

  try {
    await http.put<ApiResponse<any>>(endpoint, { status: 'completed' });
    apiLogger.info({ id }, 'Workout marked as completed');
    return true;
  } catch (err) {
    logError(err as Error, { endpoint, id });
    throw err;
  }
}

/**
 * Updates annotations for a scheduled workout
 * @param id Scheduled entry id
 * @param annotations New annotations text
 */
export async function updateAnnotations(id: string, annotations: string): Promise<boolean> {
  const endpoint = `/api/v1/calendar/${id}`;
  apiLogger.info({ endpoint, id, annotations }, 'Updating scheduled workout annotations');

  try {
    await http.put<ApiResponse<any>>(endpoint, { annotations: annotations.trim() || null });
    apiLogger.info({ id }, 'Annotations updated successfully');
    return true;
  } catch (err) {
    logError(err as Error, { endpoint, id });
    throw err;
  }
}

// Add deleteScheduled to the exported api object for convenience
export const calendarApi = {
  getMonth,
  addWorkout,
  deleteScheduled,
  completeScheduled,
  updateAnnotations,
};
