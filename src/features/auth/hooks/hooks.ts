import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  login,
  register,
  me,
  logout,
  changePassword,
  resetPassword,
  deleteAccount,
  type LoginRequest,
  type RegisterRequest,
} from '../api/api';

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => me(),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      qc.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      userId,
      currentPassword,
      newPassword,
    }: {
      userId: string;
      currentPassword: string;
      newPassword: string;
    }) => changePassword(userId, currentPassword, newPassword),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteAccount(userId),
    onSuccess: () => {
      qc.clear();
    },
  });
}


