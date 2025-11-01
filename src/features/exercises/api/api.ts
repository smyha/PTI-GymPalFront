import { http } from '@/lib/http';
import { endpoints } from '@/lib/api/endpoints';

export const exercisesApi = {
  list: (params?: Record<string, string>) =>
    http.get<any>(endpoints.exercises.root + (params ? `?${new URLSearchParams(params)}` : '')),
  categories: () => http.get<any>(endpoints.exercises.categories),
  get: (id: string) => http.get<any>(`${endpoints.exercises.root}/${id}`),
};


