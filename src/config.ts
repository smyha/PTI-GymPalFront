export const config = {
  apiBaseUrl: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) as string || (globalThis as any)?.import?.meta?.env?.VITE_API_BASE_URL || '',
};


