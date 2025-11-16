import { useQuery } from '@tanstack/react-query';
import { progressApi } from '../api/progress.api';

export const useProgress = (period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['progress', period],
    queryFn: () => progressApi.getProgress(period),
  });
};

export const useProgressStats = (period: 'week' | 'month' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['progress-stats', period],
    queryFn: () => progressApi.getStats(period),
  });
};

export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => progressApi.getAchievements(),
  });
};

export const useAchievement = (id: string) => {
  return useQuery({
    queryKey: ['achievements', id],
    queryFn: () => progressApi.getAchievement(id),
    enabled: !!id,
  });
};
