export const endpoints = {
  auth: {
    register: '/api/v1/auth/register',
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    me: '/api/v1/auth/me',
  },
  dashboard: {
    root: '/api/v1/dashboard',
    stats: '/api/v1/dashboard/stats',
    recentActivity: '/api/v1/dashboard/recent-activity',
    workoutProgress: '/api/v1/dashboard/workout-progress',
    analytics: '/api/v1/dashboard/analytics',
    leaderboard: '/api/v1/dashboard/leaderboard',
    calendar: '/api/v1/dashboard/calendar',
  },
  personal: {
    root: '/api/v1/personal',
  },
  workouts: {
    root: '/api/v1/workouts',
    byId: '/api/v1/workouts',
  },
  exercises: {
    root: '/api/v1/exercises',
    categories: '/api/v1/exercises/categories',
  },
  social: {
    posts: '/api/v1/social/posts',
    postById: '/api/v1/social/posts',
  },
} as const;


