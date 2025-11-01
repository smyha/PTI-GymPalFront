import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3),
  full_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.string().optional(),
  terms_accepted: z.literal(true),
  privacy_policy_accepted: z.literal(true),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;


