export type Exercise = {
  id: string;
  uuid?: string;
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  muscle_group?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  imageUrl?: string;
  videoUrl?: string;
  instructions?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ExerciseCategory = {
  id: string;
  name: string;
  description?: string;
  exerciseCount?: number;
};

export type GetExercisesRequest = {
  page?: number;
  limit?: number;
  category?: string;
  difficulty?: string;
  search?: string;
};

export type GetExercisesResponse = {
  data: Exercise[];
  total: number;
  page: number;
  limit: number;
};
