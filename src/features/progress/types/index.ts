export type WorkoutStat = {
  date: string;
  workouts_completed: number;
  exercises_completed: number;
  total_duration: number;
  total_calories: number;
};

export type ProgressData = {
  userId: string;
  totalWorkouts: number;
  totalExercises: number;
  totalDuration: number;
  averageWorkoutDuration: number;
  currentStreak: number;
  longestStreak: number;
  stats: WorkoutStat[];
  createdAt?: string;
  updatedAt?: string;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  unlockedAt?: string;
};

export type ProgressChartData = {
  date: string;
  value: number;
};
