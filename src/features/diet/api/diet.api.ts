import { http } from '@/lib/http';
import type { Meal, DietPlan, CreateMealRequest, CreateDietPlanRequest } from '../types';

const baseUrl = '/api/v1/diet';

export const dietApi = {
  // Get all diet plans
  listPlans: () =>
    http.get<{ data: DietPlan[] }>(`${baseUrl}/plans`),

  // Get single diet plan
  getPlan: (id: string) =>
    http.get<{ data: DietPlan }>(`${baseUrl}/plans/${id}`),

  // Create diet plan
  createPlan: (body: CreateDietPlanRequest) =>
    http.post<{ data: DietPlan }>(`${baseUrl}/plans`, body),

  // Update diet plan
  updatePlan: (id: string, body: Partial<CreateDietPlanRequest>) =>
    http.put<{ data: DietPlan }>(`${baseUrl}/plans/${id}`, body),

  // Delete diet plan
  deletePlan: (id: string) =>
    http.delete<{ success: boolean }>(`${baseUrl}/plans/${id}`),

  // Get all meals
  listMeals: () =>
    http.get<{ data: Meal[] }>(`${baseUrl}/meals`),

  // Get single meal
  getMeal: (id: string) =>
    http.get<{ data: Meal }>(`${baseUrl}/meals/${id}`),

  // Create meal
  createMeal: (body: CreateMealRequest) =>
    http.post<{ data: Meal }>(`${baseUrl}/meals`, body),

  // Update meal
  updateMeal: (id: string, body: Partial<CreateMealRequest>) =>
    http.put<{ data: Meal }>(`${baseUrl}/meals/${id}`, body),

  // Delete meal
  deleteMeal: (id: string) =>
    http.delete<{ success: boolean }>(`${baseUrl}/meals/${id}`),
};
