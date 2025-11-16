export type Exercise = {
  id: string;
  uuid?: string;
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  muscle_group?: string;
  difficulty?: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  order?: number;
};

export type Workout = {
  id: string;
  uuid?: string;
  _id?: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  duration?: number;
  difficulty?: string;
  frequency?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateWorkoutRequest = {
  name: string;
  description?: string;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
    order?: number;
    duration?: number;
    restTime?: number;
  }>;
};

export type UpdateWorkoutRequest = Partial<CreateWorkoutRequest>;
