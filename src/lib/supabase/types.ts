/**
 * Supabase Auth Types
 */

export type AuthUser = {
  id: string;
  email: string;
  emailConfirmedAt?: string;
  phone?: string;
  appMetadata?: Record<string, unknown>;
  userMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  expiresAt: number;
  tokenType: string;
};

export type AuthError = {
  message: string;
  status?: number;
};
