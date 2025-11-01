export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

const ACCESS = 'access_token';
const REFRESH = 'refresh_token';

function setCookie(name: string, value: string, seconds = 60 * 60 * 24, path = '/') {
  try {
    const expires = new Date(Date.now() + seconds * 1000).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=${path}; Expires=${expires}; SameSite=Lax`;
  } catch {}
}

function deleteCookie(name: string, path = '/') {
  try {
    document.cookie = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch {}
}

export function saveTokens(tokens: AuthTokens) {
  try {
    localStorage.setItem(ACCESS, tokens.accessToken);
    setCookie(ACCESS, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH, tokens.refreshToken);
      setCookie(REFRESH, tokens.refreshToken);
    }
  } catch {}
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH);
  } catch {
    return null;
  }
}

export function clearTokens() {
  try {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    deleteCookie(ACCESS);
    deleteCookie(REFRESH);
  } catch {}
}


