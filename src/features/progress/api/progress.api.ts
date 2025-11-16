import { http } from '@/lib/http';
import type { ProgressData, Achievement } from '../types';

const baseUrl = '/api/v1/progress';

export const progressApi = {
  // Get user progress
  getProgress: (period: 'week' | 'month' | 'year' = 'month') =>
    http.get<{ data: ProgressData }>(`${baseUrl}?period=${period}`),

  // Get progress stats
  getStats: (period: 'week' | 'month' | 'year' = 'month') =>
    http.get<{ data: ProgressData }>(`${baseUrl}/stats?period=${period}`),

  // Get achievements
  getAchievements: () =>
    http.get<{ data: Achievement[] }>(`${baseUrl}/achievements`),

  // Get specific achievement
  getAchievement: (id: string) =>
    http.get<{ data: Achievement }>(`${baseUrl}/achievements/${id}`),
};
