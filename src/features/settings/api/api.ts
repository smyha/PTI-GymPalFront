import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import type { ApiResponse } from '@/features/auth/types';

export type Settings = {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  profile_visibility: 'public' | 'friends' | 'private';
  workout_visibility: 'public' | 'friends' | 'private';
  show_stats: boolean;
};

export type NotificationSettings = {
  email: boolean;
  push: boolean;
  sms: boolean;
};

export type PrivacySettings = {
  profileVisibility: 'public' | 'friends' | 'private';
  workoutVisibility: 'public' | 'friends' | 'private';
  showStats: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  username: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  fitnessLevel?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  createdAt?: string;
  stats?: {
    totalWorkouts: number;
    totalExercises: number;
    totalPosts: number;
  };
};

/**
 * Get all user settings
 */
export async function getSettings() {
  apiLogger.info({ endpoint: '/api/v1/settings' }, 'Get settings request');
  try {
    const wrappedRes = await http.get<ApiResponse<Settings>>('/api/v1/settings');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No settings in response');
    apiLogger.info({}, 'Get settings success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/settings' });
    throw err;
  }
}

/**
 * Update general settings
 */
export async function updateSettings(settings: Partial<Settings>) {
  apiLogger.info({ endpoint: '/api/v1/settings' }, 'Update settings request');
  try {
    const wrappedRes = await http.put<ApiResponse<Settings>>('/api/v1/settings', settings);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No settings in response');
    apiLogger.info({}, 'Update settings success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/settings' });
    throw err;
  }
}

/**
 * Get notification settings
 */
export async function getNotificationSettings() {
  apiLogger.info({ endpoint: '/api/v1/settings/notifications' }, 'Get notification settings request');
  try {
    const wrappedRes = await http.get<ApiResponse<{ notifications: NotificationSettings }>>('/api/v1/settings/notifications');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No notification settings in response');
    apiLogger.info({}, 'Get notification settings success');
    return data.notifications;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/settings/notifications' });
    throw err;
  }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(settings: Partial<NotificationSettings>) {
  apiLogger.info({ endpoint: '/api/v1/settings/notifications' }, 'Update notification settings request');
  try {
    const wrappedRes = await http.put<ApiResponse<{ notifications: NotificationSettings }>>('/api/v1/settings/notifications', settings);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No notification settings in response');
    apiLogger.info({}, 'Update notification settings success');
    return data.notifications;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/settings/notifications' });
    throw err;
  }
}

/**
 * Get privacy settings
 */
export async function getPrivacySettings() {
  apiLogger.info({ endpoint: '/api/v1/settings/privacy' }, 'Get privacy settings request');
  try {
    const wrappedRes = await http.get<ApiResponse<{ privacy: PrivacySettings }>>('/api/v1/settings/privacy');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No privacy settings in response');
    apiLogger.info({}, 'Get privacy settings success');
    return data.privacy;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/settings/privacy' });
    throw err;
  }
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(settings: Partial<PrivacySettings>) {
  apiLogger.info({ endpoint: '/api/v1/settings/privacy' }, 'Update privacy settings request');
  try {
    const wrappedRes = await http.put<ApiResponse<{ privacy: PrivacySettings }>>('/api/v1/settings/privacy', settings);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No privacy settings in response');
    apiLogger.info({}, 'Update privacy settings success');
    return data.privacy;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/settings/privacy' });
    throw err;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  apiLogger.info({ endpoint: '/api/v1/users/profile' }, 'Get user profile request');
  try {
    const wrappedRes = await http.get<ApiResponse<UserProfile>>('/api/v1/users/profile');
    const data = wrappedRes?.data;
    if (!data) throw new Error('No profile in response');
    apiLogger.info({}, 'Get user profile success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/users/profile' });
    throw err;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(profile: Partial<UserProfile>) {
  apiLogger.info({ endpoint: '/api/v1/users/profile' }, 'Update user profile request');
  try {
    const wrappedRes = await http.put<ApiResponse<UserProfile>>('/api/v1/users/profile', profile);
    const data = wrappedRes?.data;
    if (!data) throw new Error('No profile in response');
    apiLogger.info({}, 'Update user profile success');
    return data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/users/profile' });
    throw err;
  }
}

/**
 * Delete user account permanently
 */
export async function deleteAccount() {
  apiLogger.info({ endpoint: '/api/v1/users/account' }, 'Delete account request');
  try {
    await http.delete<ApiResponse<any>>('/api/v1/users/account');
    apiLogger.info({}, 'Delete account success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/users/account' });
    throw err;
  }
}

/**
 * Settings API object for convenience
 */
export const settingsApi = {
  getSettings: getSettings,
  updateSettings: updateSettings,
  getNotificationSettings: getNotificationSettings,
  updateNotificationSettings: updateNotificationSettings,
  getPrivacySettings: getPrivacySettings,
  updatePrivacySettings: updatePrivacySettings,
  getUserProfile: getUserProfile,
  updateUserProfile: updateUserProfile,
  deleteAccount: deleteAccount,
};
