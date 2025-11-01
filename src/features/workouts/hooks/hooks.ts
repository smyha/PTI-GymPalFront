import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi } from '../api/api';

export function useWorkouts(params?: { page?: number; limit?: number }) {
  return useQuery({ queryKey: ['workouts', params], queryFn: () => workoutsApi.list(params) });
}

export function useWorkout(id: string) {
  return useQuery({ queryKey: ['workouts', id], queryFn: () => workoutsApi.get(id), enabled: !!id });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => workoutsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useUpdateWorkout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: any) => workoutsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['workouts', id] });
    },
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workoutsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}


