import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Workout = any;
type UpdateWorkout = any;
type WorkoutFilters = Record<string, any> | undefined;

const workoutsApi = {
  getAll: async (filters?: WorkoutFilters) => {
    return [] as Workout[];
  },
  getById: async (id: string) => {
    return { id } as Workout;
  },
  create: async (data: any) => {
    return { id: 'new-id', ...data } as Workout;
  },
  update: async (id: string, data: UpdateWorkout) => {
    return { id, ...data } as Workout;
  },
  delete: async (id: string) => {
    return { id } as Workout;
  },
};

export function useWorkouts(filters?: WorkoutFilters) {
  return useQuery({ queryKey: ['workouts', filters], queryFn: () => workoutsApi.getAll(filters) });
}

export function useWorkout(id: string) {
  return useQuery({ queryKey: ['workouts', id], queryFn: () => workoutsApi.getById(id), enabled: !!id });
}

export function useCreateWorkout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: workoutsApi.create,
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout created successfully!');
      router.push(`/workouts/${data.id}`);
    },
    onError: () => toast.error('Failed to create workout'),
  });
}

export function useUpdateWorkout(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWorkout) => workoutsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      qc.invalidateQueries({ queryKey: ['workouts', id] });
      toast.success('Workout updated successfully!');
    },
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: workoutsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout deleted successfully!');
      router.push('/workouts');
    },
  });
}


