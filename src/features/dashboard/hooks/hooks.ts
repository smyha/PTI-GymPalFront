import { useQuery } from '@tanstack/react-query';
import { getDashboard, getDashboardStats } from '../api/api';

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard','root'], queryFn: () => getDashboard() });
}

export function useDashboardStats(params?: { period?: string; include_social?: boolean }) {
  return useQuery({ queryKey: ['dashboard','stats', params], queryFn: () => getDashboardStats(params) });
}


