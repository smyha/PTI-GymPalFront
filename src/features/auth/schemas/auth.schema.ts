import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    username: z.string().min(1, 'Usuario requerido'),
    full_name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
    password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
    password_confirm: z.string().min(1, 'Confirma la contraseña'),
    date_of_birth: z.string().optional(),
    gender: z.enum(['', 'male', 'female', 'other']).optional(),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos',
    }),
    privacy_policy_accepted: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar la política de privacidad',
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Debe ser un email válido'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirm'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Contraseña actual requerida'),
    newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: 'Las nuevas contraseñas no coinciden',
    path: ['newPasswordConfirm'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
