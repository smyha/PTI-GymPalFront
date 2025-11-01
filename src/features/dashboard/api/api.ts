import { http } from '@/lib/http';

export function getDashboard() {
  return http.get<any>('/api/v1/dashboard');
}

export function getDashboardStats(params?: { period?: string; include_social?: boolean }) {
  const query = new URLSearchParams();
  if (params?.period) query.set('period', params.period);
  if (typeof params?.include_social === 'boolean') query.set('include_social', String(params.include_social));
  const qs = query.toString();
  return http.get<any>(`/api/v1/dashboard/stats${qs ? `?${qs}` : ''}`);
}


