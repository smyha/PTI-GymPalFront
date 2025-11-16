export type User = {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
};

/**
 * Auth response from backend (inside ApiResponse.data)
 * This is what the auth service returns
 */
export type AuthResponse = {
  user: User;
  token?: string;
  expiresIn?: string;
  tokenType?: string;
  message?: string;
  emailConfirmationRequired?: boolean;
};

/**
 * API response wrapper from backend
 * All API endpoints return this structure
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
  };
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  username: string;
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  terms_accepted: boolean;
  privacy_policy_accepted: boolean;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ResetPasswordRequest = {
  token: string;
  new_password: string;
};
