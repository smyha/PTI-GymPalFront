import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';
import type * as Unified from '@/lib/types/unified.types';
import * as transformers from '@/lib/transformers';

export type UpdateProfileRequest = {
  full_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  fitness_level?: string;
};

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  apiLogger.info({ endpoint: '/api/v1/users/profile' }, 'Get current user profile request');
  try {
    const wrappedRes = await http.get<ApiResponse<Unified.UserProfile>>('/api/v1/users/profile');
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No profile in response');

    // Transform profile
    const transformed = transformers.userTransformers.transformProfile(rawData);
    apiLogger.info({}, 'Get current user profile success');
    return transformed;
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
    const wrappedRes = await http.put<ApiResponse<Unified.UserProfile>>('/api/v1/users/profile', request);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No profile in response');

    // Transform profile
    const transformed = transformers.userTransformers.transformProfile(rawData);
    apiLogger.info({}, 'Update user profile success');
    return transformed;
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
    const wrappedRes = await http.get<ApiResponse<Unified.UserProfile>>(`/api/v1/users/${userId}`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No profile in response');

    // Transform profile
    const transformed = transformers.userTransformers.transformProfile(rawData);
    apiLogger.info({}, 'Get public user profile success');
    return transformed;
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
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const wrappedRes = await http.get<ApiResponse<Unified.PaginatedList<Unified.UserProfile>>>(`/api/v1/users/search?${params}`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No users in response');

    // Transform paginated users
    const transformed = transformers.listTransformers.transformPaginatedList(
      rawData,
      (profile) => transformers.userTransformers.transformProfile(profile)
    );
    apiLogger.info({}, 'Search users success');
    return transformed;
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
    const wrappedRes = await http.get<ApiResponse<Unified.UserStats>>(`/api/v1/users/${userId}/stats`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No stats in response');

    // Transform stats (simple key transformation)
    const transformed = transformers.transformResponseKeys(rawData);
    apiLogger.info({}, 'Get user stats success');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint: `/api/v1/users/${userId}/stats` });
    throw err;
  }
}
