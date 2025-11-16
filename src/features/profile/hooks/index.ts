import { useQuery, useMutation } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';
import type { UserProfile, UpdateProfileRequest } from '../types';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
  });
};

export const useGetUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileApi.getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: (formData: FormData) => profileApi.uploadAvatar(formData),
  });
};
