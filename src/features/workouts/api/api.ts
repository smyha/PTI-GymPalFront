import { http } from '@/lib/http';
import { endpoints } from '@/lib/api/endpoints';

export const workoutsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    http.get<any>(`${endpoints.workouts?.root || '/api/v1/workouts'}` + (params ? `?${new URLSearchParams(params as any)}` : '')),
  get: (id: string) => http.get<any>(`${endpoints.workouts?.byId || '/api/v1/workouts'}/${id}`),
  create: (body: any) => http.post<any>(`${endpoints.workouts?.root || '/api/v1/workouts'}`, body),
  update: (id: string, body: any) => http.put<any>(`${endpoints.workouts?.byId || '/api/v1/workouts'}/${id}`, body),
  remove: (id: string) => http.delete<any>(`${endpoints.workouts?.byId || '/api/v1/workouts'}/${id}`),
};


