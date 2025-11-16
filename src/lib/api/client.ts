import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../utils/constants';

/**
 * Create an Axios instance configured for API requests
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Set authorization token for API requests
 */
export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

/**
 * Get current authorization token
 */
export function getAuthToken(): string | null {
  return apiClient.defaults.headers.common['Authorization'] as string | null;
}
