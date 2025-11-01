import axios from 'axios';
import { config } from '@/config';
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from '@/lib/utils/auth';
import { endpoints } from './endpoints';

const base = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || config.apiBaseUrl || '';
export const apiClient = axios.create({
  baseURL: base.replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((req) => {
  const token = getAccessToken();
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

let refreshing: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config: original } = error || {};
    if (response?.status === 401 && !original.__isRetry) {
      original.__isRetry = true;
      if (!refreshing) {
        const refresh = getRefreshToken();
        refreshing = (async () => {
          if (!refresh) return null;
          try {
            const res = await axios.post(
              `${(config.apiBaseUrl || '').replace(/\/$/, '')}${endpoints.auth.refresh}`,
              { refresh_token: refresh },
              { headers: { 'Content-Type': 'application/json' } }
            );
            const token = res?.data?.data?.token || res?.data?.token;
            if (token) {
              saveTokens({ accessToken: token, refreshToken: refresh });
              return token as string;
            }
            return null;
          } catch {
            return null;
          } finally {
            // reset gate after completion
            setTimeout(() => (refreshing = null), 0);
          }
        })();
      }
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(original);
      }
      clearTokens();
    }
    return Promise.reject(error);
  }
);


