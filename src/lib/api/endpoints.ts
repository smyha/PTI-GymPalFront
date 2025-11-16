/**
 * API Endpoints
 * Define all API endpoints here for easy management
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
  },

  // Users
  USERS: {
    GET_PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
    GET_BY_ID: (id: string) => `/api/v1/users/${id}`,
    SEARCH: '/api/v1/users/search',
  },

  // Workouts
  WORKOUTS: {
    LIST: '/api/v1/workouts',
    CREATE: '/api/v1/workouts',
    GET_BY_ID: (id: string) => `/api/v1/workouts/${id}`,
    UPDATE: (id: string) => `/api/v1/workouts/${id}`,
    DELETE: (id: string) => `/api/v1/workouts/${id}`,
  },

  // Exercises
  EXERCISES: {
    LIST: '/api/v1/exercises',
    GET_BY_ID: (id: string) => `/api/v1/exercises/${id}`,
    GET_BY_CATEGORY: (category: string) => `/api/v1/exercises/category/${category}`,
  },

  // Progress
  PROGRESS: {
    LIST: '/api/v1/progress',
    CREATE: '/api/v1/progress',
    GET_BY_ID: (id: string) => `/api/v1/progress/${id}`,
    UPDATE: (id: string) => `/api/v1/progress/${id}`,
  },

  // Diet
  DIET: {
    LIST: '/api/v1/diet',
    CREATE: '/api/v1/diet',
    GET_BY_ID: (id: string) => `/api/v1/diet/${id}`,
    UPDATE: (id: string) => `/api/v1/diet/${id}`,
  },

  // Social
  SOCIAL: {
    USERS: '/api/v1/social/users',
    GET_USER: (userId: string) => `/api/v1/social/users/${userId}`,
    FOLLOW: '/api/v1/social/follow',
    UNFOLLOW: '/api/v1/social/unfollow',
  },
};
