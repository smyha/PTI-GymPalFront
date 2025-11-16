export type Meal = {
  id: string;
  name: string;
  description?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  imageUrl?: string;
  createdAt?: string;
};

export type DietPlan = {
  id: string;
  name: string;
  description?: string;
  meals: Meal[];
  totalCalories: number;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateMealRequest = {
  name: string;
  description?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  imageUrl?: string;
};

export type CreateDietPlanRequest = {
  name: string;
  description?: string;
  meals: string[];
};
