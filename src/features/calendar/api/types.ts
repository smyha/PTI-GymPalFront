/**
 * Calendar API Types
 *
 * Type definitions for calendar-related API responses and requests
 */

/**
 * Represents a calendar day entry
 */
export interface CalendarDay {
  id?: string;
  date: string; // Format: YYYY-MM-DD
  hasWorkout: boolean;
  status?: 'scheduled' | 'completed';
  workoutId?: string;
  workoutName?: string;
  exerciseCount?: number;
  completed?: boolean;
  annotations?: string | null;
}

/**
 * Calendar month data response
 */
export interface CalendarResponse {
  month: number;
  year: number;
  days: CalendarDay[];
}

/**
 * Request payload for adding a workout to a calendar date
 */
export interface AddWorkoutRequest {
  workoutId: string;
  date: string; // Format: YYYY-MM-DD
}

/**
 * Response when adding a workout to calendar
 */
export interface AddWorkoutResponse {
  success: boolean;
  workoutId: string;
  date: string;
}
