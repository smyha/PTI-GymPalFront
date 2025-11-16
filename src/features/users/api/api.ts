import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';

export type UserProfile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  fitness_level?: string;
  created_at: string;
  updated_at: string;
};

export type UserStats = {
  total_workouts: number;
  total_exercises: number;
  total_duration: number;
  achievements: number;
};

export type UpdateProfileRequest = {
  full_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  fitness_level?: string;
};

export type PaginatedUsers = {
  data: UserProfile[];
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
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  apiLogger.info({ endpoint: '/api/v1/users/profile' }, 'Get current user profile request');
  try {
    const wrappedRes = await http.get<ApiResponse<UserProfile>>('/api/v1/users/profile');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No profile in response');
    apiLogger.info({}, 'Get current user profile success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/users/profile' });
    throw err;
  }
}

/**
 * Update current user profile
 */
export async function updateUserProfile(request: UpdateProfileRequest) {
  apiLogger.info({ endpoint: '/api/v1/users/profile' }, 'Update user profile request');
  try {
    const wrappedRes = await http.put<ApiResponse<UserProfile>>('/api/v1/users/profile', request);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No profile in response');
    apiLogger.info({}, 'Update user profile success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/users/profile' });
    throw err;
  }
}

/**
 * Get public user info by ID
 */
export async function getPublicUserProfile(userId: string) {
  apiLogger.info({ endpoint: `/api/v1/users/${userId}` }, 'Get public user profile request');
  try {
    const wrappedRes = await http.get<ApiResponse<UserProfile>>(`/api/v1/users/${userId}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No profile in response');
    apiLogger.info({}, 'Get public user profile success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/users/${userId}` });
    throw err;
  }
}

/**
 * Search users
 */
export async function searchUsers(query: string, page: number = 1, limit: number = 20) {
  apiLogger.info({ endpoint: '/api/v1/users/search', query, page, limit }, 'Search users request');
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    const wrappedRes = await http.get<ApiResponse<PaginatedUsers>>(`/api/v1/users/search?${params}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No users in response');
    apiLogger.info({}, 'Search users success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/users/search' });
    throw err;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  apiLogger.info({ endpoint: `/api/v1/users/${userId}/stats` }, 'Get user stats request');
  try {
    const wrappedRes = await http.get<ApiResponse<UserStats>>(`/api/v1/users/${userId}/stats`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No stats in response');
    apiLogger.info({}, 'Get user stats success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/users/${userId}/stats` });
    throw err;
  }
}
