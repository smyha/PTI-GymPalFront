import { http } from '@/lib/http';
import { endpoints } from '@/lib/api/endpoints';
import type { UserProfile, UpdateProfileRequest } from '../types';

export const profileApi = {
  // Get current user profile
  getProfile: () =>
    http.get<{ data: UserProfile }>(endpoints.auth.me),

  // Update user profile
  updateProfile: (body: UpdateProfileRequest) =>
    http.put<{ data: UserProfile }>(`${endpoints.auth.me}`, body),

  // Get user by ID
  getUserProfile: (userId: string) =>
    http.get<{ data: UserProfile }>(`/api/v1/users/${userId}`),

  // Upload avatar
  uploadAvatar: (formData: FormData) =>
    http.post<{ data: { avatarUrl: string } }>(
      '/api/v1/users/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),
};
