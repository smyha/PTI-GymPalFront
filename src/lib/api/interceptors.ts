import { apiClient, getAuthToken } from './client';
import { parseApiError, isAuthError } from './error-handler';

/**
 * Setup API interceptors for request/response handling
 */
export function setupApiInterceptors() {
  // Request interceptor
  apiClient.interceptors.request.use(
    (config) => {
      // Add auth token to requests
      const token = getAuthToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const apiError = parseApiError(error);

      // Handle auth errors
      if (isAuthError(error)) {
        // Clear auth tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }

      return Promise.reject(apiError);
    }
  );
}
