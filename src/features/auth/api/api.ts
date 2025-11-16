import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import { saveTokens, clearTokens } from '@/lib/utils/auth';
import type { LoginRequest, RegisterRequest, AuthResponse, ApiResponse } from '../types';

function extractTokens(res: AuthResponse): { access?: string; refresh?: string } {
  // Backend returns token directly in the response
  return {
    access: res.token,
    refresh: undefined,
  };
}

export async function login(body: LoginRequest) {
  apiLogger.info({ endpoint: '/api/v1/auth/login' }, 'Auth login request');
  try {
    // Backend returns ApiResponse<AuthResponse>
    const wrappedRes = await http.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', body);
    const authData = wrappedRes?.data;

    if (!authData) {
      throw new Error('No auth data in response');
    }

    const { access } = extractTokens(authData);

    // Backend login returns access token
    if (access) {
      saveTokens({ accessToken: access });
      apiLogger.info({ hasAccess: true }, 'Auth login success');
    } else {
      apiLogger.warn({}, 'Auth login succeeded but no access token returned');
    }

    return authData;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/login' });
    throw err;
  }
}

export async function register(body: RegisterRequest) {
  apiLogger.info({ endpoint: '/api/v1/auth/register' }, 'Auth register request');
  try {
    // Backend returns ApiResponse<AuthResponse>
    const wrappedRes = await http.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', body);
    const authData = wrappedRes?.data;

    if (!authData) {
      throw new Error('No auth data in response');
    }

    // Backend register doesn't return a token, only user info and emailConfirmationRequired flag
    // User must verify email before they can login
    apiLogger.info(
      { emailConfirmationRequired: authData.emailConfirmationRequired },
      'Auth register success'
    );

    return authData;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/register' });
    throw err;
  }
}

export async function me() {
  apiLogger.debug({ endpoint: '/api/v1/auth/me' }, 'Auth me request');
  try {
    const wrappedRes = await http.get<ApiResponse<any>>('/api/v1/auth/me');
    return wrappedRes?.data;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/me' });
    throw err;
  }
}

export async function logout() {
  apiLogger.info({ endpoint: '/api/v1/auth/logout' }, 'Auth logout request');
  try {
    await http.post<ApiResponse<any>>('/api/v1/auth/logout');
    clearTokens();
    apiLogger.info({}, 'Auth logout success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/logout' });
    clearTokens(); // Clear tokens even if logout fails
    throw err;
  }
}

export async function refreshToken(refreshToken: string) {
  apiLogger.info({ endpoint: '/api/v1/auth/refresh' }, 'Token refresh request');
  try {
    const wrappedRes = await http.post<ApiResponse<AuthResponse>>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    const authData = wrappedRes?.data;

    if (!authData?.token) {
      throw new Error('No token in refresh response');
    }

    saveTokens({ accessToken: authData.token });
    apiLogger.info({}, 'Token refresh success');
    return authData;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/refresh' });
    throw err;
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  apiLogger.info({ endpoint: '/api/v1/auth/change-password/:id' }, 'Change password request');
  try {
    await http.put<ApiResponse<any>>(`/api/v1/auth/change-password/${userId}`, {
      currentPassword,
      newPassword,
    });
    apiLogger.info({}, 'Password change success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/change-password' });
    throw err;
  }
}

export async function resetPassword(token: string, newPassword: string) {
  apiLogger.info({ endpoint: '/api/v1/auth/reset-password' }, 'Reset password request');
  try {
    await http.post<ApiResponse<any>>('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    apiLogger.info({}, 'Password reset success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/reset-password' });
    throw err;
  }
}

export async function deleteAccount(userId: string) {
  apiLogger.info({ endpoint: '/api/v1/auth/delete-account/:id' }, 'Delete account request');
  try {
    await http.delete<ApiResponse<any>>(`/api/v1/auth/delete-account/${userId}`);
    clearTokens();
    apiLogger.info({}, 'Account deletion success');
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/delete-account' });
    throw err;
  }
}