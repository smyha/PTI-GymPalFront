import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, register, me, type LoginRequest, type RegisterRequest } from '../api/api';

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth','me'] });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth','me'] });
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['auth','me'],
    queryFn: () => me(),
  });
}


