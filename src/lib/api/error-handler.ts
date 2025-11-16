import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  code?: string;
}

/**
 * Parse API error responses
 */
export function parseApiError(error: unknown): ApiErrorResponse {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as any;

    return {
      message: data?.message || data?.error || error.message || 'An error occurred',
      status,
      errors: data?.errors,
      code: data?.code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unknown error occurred',
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response;
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 422;
  }
  return false;
}
