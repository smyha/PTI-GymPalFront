import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';

export function useDashboardRoot() {
  return useQuery({
    queryKey: ['system','root'],
    queryFn: () => http.get<any>('/api/v1/dashboard'),
  });
}


