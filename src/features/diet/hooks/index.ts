import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dietApi } from '../api/diet.api';
import type { CreateMealRequest, CreateDietPlanRequest } from '../types';

export const useDietPlans = () => {
  return useQuery({
    queryKey: ['diet-plans'],
    queryFn: () => dietApi.listPlans(),
  });
};

export const useDietPlan = (id: string) => {
  return useQuery({
    queryKey: ['diet-plans', id],
    queryFn: () => dietApi.getPlan(id),
    enabled: !!id,
  });
};

export const useCreateDietPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDietPlanRequest) => dietApi.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
    },
  });
};

export const useUpdateDietPlan = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateDietPlanRequest>) => dietApi.updatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans', id] });
    },
  });
};

export const useDeleteDietPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dietApi.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-plans'] });
    },
  });
};

export const useMeals = () => {
  return useQuery({
    queryKey: ['meals'],
    queryFn: () => dietApi.listMeals(),
  });
};

export const useMeal = (id: string) => {
  return useQuery({
    queryKey: ['meals', id],
    queryFn: () => dietApi.getMeal(id),
    enabled: !!id,
  });
};

export const useCreateMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMealRequest) => dietApi.createMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
};

export const useUpdateMeal = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateMealRequest>) => dietApi.updateMeal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals', id] });
    },
  });
};

export const useDeleteMeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dietApi.deleteMeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });
};
