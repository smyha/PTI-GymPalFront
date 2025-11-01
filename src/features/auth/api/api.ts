import { http } from '@/lib/http';
import { apiLogger, logError } from '@/lib/logger';
import { saveTokens } from '@/lib/utils/auth';

export type LoginRequest = { email: string; password: string };
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

export type AuthResponse = {
  user?: unknown;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  data?: {
    token?: string;
    access_token?: string;
    refresh_token?: string;
    tokens?: { access_token?: string; refresh_token?: string };
  };
  tokens?: { access_token?: string; refresh_token?: string };
};

function extractTokens(res: AuthResponse): { access?: string; refresh?: string } {
  const directAccess = res.access_token || res.token;
  const directRefresh = res.refresh_token;
  const data = res.data || {};
  const dataAccess = data.access_token || data.token;
  const dataRefresh = data.refresh_token;
  const nested = res.tokens || data.tokens || {};
  const nestedAccess = nested.access_token;
  const nestedRefresh = nested.refresh_token;

  return {
    access: directAccess || dataAccess || nestedAccess,
    refresh: directRefresh || dataRefresh || nestedRefresh,
  };
}

export async function login(body: LoginRequest) {
  apiLogger.info({ endpoint: '/api/v1/auth/login' }, 'Auth login request');
  try {
    const res = await http.post<AuthResponse>('/api/v1/auth/login', body);
    const { access, refresh } = extractTokens(res);
    if (access) saveTokens({ accessToken: access, refreshToken: refresh });
    apiLogger.info({ hasAccess: !!access, hasRefresh: !!refresh }, 'Auth login success');
    return res;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/login' });
    throw err;
  }
}

export async function register(body: RegisterRequest) {
  apiLogger.info({ endpoint: '/api/v1/auth/register' }, 'Auth register request');
  try {
    const res = await http.post<AuthResponse>('/api/v1/auth/register', body);
    const { access, refresh } = extractTokens(res);
    if (access) saveTokens({ accessToken: access, refreshToken: refresh });
    apiLogger.info({ hasAccess: !!access, hasRefresh: !!refresh }, 'Auth register success');
    return res;
  } catch (err) {
    logError(err as Error, { endpoint: '/api/v1/auth/register' });
    throw err;
  }
}

export function me() {
  apiLogger.debug({ endpoint: '/api/v1/auth/me' }, 'Auth me request');
  return http.get<any>('/api/v1/auth/me');
}


