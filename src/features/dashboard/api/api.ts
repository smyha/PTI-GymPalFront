import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';

export type DashboardStats = {
  total_workouts: number;
  total_exercises: number;
  total_duration: number;
  average_duration: number;
};

export type RecentActivity = {
  type: string;
  description: string;
  created_at: string;
};

export type DashboardData = {
  stats: DashboardStats;
  activity: RecentActivity[];
};

/**
 * Get dashboard overview (stats and recent activity)
 */
export async function getDashboard() {
  apiLogger.info({ endpoint: '/api/v1/dashboard' }, 'Get dashboard request');
  try {
    const wrappedRes = await http.get<ApiResponse<DashboardData>>('/api/v1/dashboard');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No dashboard data in response');
    apiLogger.info({}, 'Get dashboard success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/dashboard' });
    throw err;
  }
}

/**
 * Get dashboard statistics with optional timeframe
 */
export async function getDashboardStats(timeframe: 'week' | 'month' | 'year' | 'all' = 'all', includeSocial: boolean = true) {
  apiLogger.info({ endpoint: '/api/v1/dashboard/stats', timeframe, includeSocial }, 'Get dashboard stats request');
  try {
    const params = new URLSearchParams({
      timeframe,
      include_social: includeSocial.toString(),
    });
    const wrappedRes = await http.get<ApiResponse<DashboardStats>>(`/api/v1/dashboard/stats?${params}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No stats data in response');
    apiLogger.info({}, 'Get dashboard stats success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/dashboard/stats' });
    throw err;
  }
}

/**
 * Get recent activity feed
 */
export async function getDashboardActivity(limit: number = 20, offset: number = 0) {
  if (limit > 100) limit = 100;
  apiLogger.info({ endpoint: '/api/v1/dashboard/activity', limit, offset }, 'Get dashboard activity request');
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    const wrappedRes = await http.get<ApiResponse<RecentActivity[]>>(`/api/v1/dashboard/activity?${params}`);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No activity data in response');
    apiLogger.info({}, 'Get dashboard activity success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/dashboard/activity' });
    throw err;
  }
}
