import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';
import type * as Unified from '@/lib/types/unified.types';
import * as transformers from '@/lib/transformers';

export type RecentActivity = {
  type: string;
  description: string;
  created_at: string;
};

export type DashboardData = {
  stats: any;
  activity: RecentActivity[];
};

/**
 * Get dashboard overview (stats and recent activity)
 */
export async function getDashboard() {
  const date = new Date().toISOString().split('T')[0] || '';
  apiLogger.info({ endpoint: '/api/v1/dashboard', date }, 'Get dashboard request');
  try {
    const wrappedRes = await http.get<ApiResponse<any>>(`/api/v1/dashboard?date=${date}`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No dashboard data in response');

    // Transform dashboard data (using generic transformer)
    const transformed = transformers.transformResponseKeys(rawData);
    apiLogger.info({}, 'Get dashboard success');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/dashboard' });
    throw err;
  }
}

/**
 * Get dashboard statistics with optional timeframe
 */
export async function getDashboardStats(timeframe: 'week' | 'month' | 'year' | 'all' = 'all', includeSocial: boolean = true) {
  const dateStr = new Date().toISOString().split('T')[0];
  const date = dateStr || '';
  
  apiLogger.info({ endpoint: '/api/v1/dashboard/stats', period: timeframe, includeSocial, date }, 'Get dashboard stats request');
  try {
    const params = new URLSearchParams();
    params.append('period', timeframe);
    params.append('include_social', includeSocial.toString());
    params.append('date', date);

    const wrappedRes = await http.get<ApiResponse<Unified.DashboardStats>>(`/api/v1/dashboard/stats?${params.toString()}`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No stats data in response');

    // Transform dashboard stats (using generic transformer)
    const transformed = transformers.transformResponseKeys(rawData);
    apiLogger.info({}, 'Get dashboard stats success');
    return transformed;
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
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    const wrappedRes = await http.get<ApiResponse<any[]>>(`/api/v1/dashboard/activity?${params}`);
    const rawData = wrappedRes?.data;
    if (!rawData) throw new Error('No activity data in response');

    // Transform activity data (using generic transformer)
    const transformed = transformers.transformResponseKeys(rawData);
    apiLogger.info({}, 'Get dashboard activity success');
    return transformed;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/dashboard/activity' });
    throw err;
  }
}
