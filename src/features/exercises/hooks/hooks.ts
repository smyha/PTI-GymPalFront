import { useQuery } from '@tanstack/react-query';
import { exercisesApi } from '../api/api';

export function useExercises(params?: Record<string, string>) {
  return useQuery({ queryKey: ['exercises', params], queryFn: () => exercisesApi.list(params) });
}

export function useExercise(id: string) {
  return useQuery({ queryKey: ['exercises', id], queryFn: () => exercisesApi.get(id), enabled: !!id });
}

export function useExerciseCategories() {
  return useQuery({ queryKey: ['exercises','categories'], queryFn: () => exercisesApi.categories() });
}


