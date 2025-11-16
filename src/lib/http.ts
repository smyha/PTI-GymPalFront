import { config } from '../config';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from './utils/auth';
import { apiLogger, logError } from './logger';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const startedAt = Date.now();
    apiLogger.debug({ path: '/api/v1/auth/refresh' }, 'Refreshing access token');
    const res = await fetch(joinUrl('/api/v1/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) {
      apiLogger.warn({ status: res.status }, 'Refresh token request failed');
      return null;
    }
    const response = await res.json().catch(() => null);
    // Backend wraps auth response in ApiResponse.data, and returns new tokens
    const authData = response?.data;
    const token = authData?.token;
    if (token) {
      // Save new tokens from refresh response
      saveTokens({
        accessToken: token,
        refreshToken: authData?.refreshToken || refresh
      });
      apiLogger.info({ durationMs: Date.now() - startedAt }, 'Access token refreshed');
      return token as string;
    }
    apiLogger.warn('No token found in refresh response');
    return null;
  } catch (err) {
    logError(err as Error, { action: 'refreshAccessToken' });
    return null;
  }
}

function joinUrl(path: string) {
  const baseUrl = config.apiBaseUrl?.replace(/\/$/, '') || '';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = joinUrl(path);
  let token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const method = (options.method || 'GET') as HttpMethod;
  const startedAt = Date.now();
  apiLogger.debug({ method, path, url }, 'HTTP request start');
  let res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      apiLogger.debug({ path, url }, 'Retrying request with refreshed token');
      res = await fetch(url, { ...options, headers: { ...headers, Authorization: `Bearer ${newToken}` } });
    } else {
      clearTokens();
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(text || `HTTP ${res.status}`);
    logError(error as Error, { method, path, status: res.status, durationMs: Date.now() - startedAt });
    throw error;
  }
  const contentType = res.headers.get('content-type') || '';
  apiLogger.info({ method, path, status: res.status, durationMs: Date.now() - startedAt }, 'HTTP request success');
  if (contentType.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export const http = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
};


