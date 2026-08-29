import toast from 'react-hot-toast';

const rawEnvUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
export const API_BASE = (rawEnvUrl && rawEnvUrl.length > 0 && !rawEnvUrl.includes('groovelinetwork.com'))
  ? rawEnvUrl
  : 'https://groovely-ttyi.onrender.com';

export async function apiFetch(endpoint: string, options: RequestInit & { skipAuthRedirect?: boolean } = {}) {
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('groovely_token') || localStorage.getItem('grooveli_token'))
    : null;
  
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !options.skipAuthRedirect) {
      handleLogout();
      return null;
    }

    return response;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// In-Memory & Session Storage Stale-While-Revalidate (SWR) Cache
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const DEFAULT_TTL_MS = 3 * 60 * 1000; // 3 minutes

export function getCachedData<T = any>(endpoint: string): T | null {
  // 1. Check memory cache (fastest, 0ms)
  const mem = memoryCache.get(endpoint);
  if (mem) return mem.data;

  // 2. Check sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`grooveli_cache_${endpoint}`);
      if (stored) {
        const parsed: CacheEntry<T> = JSON.parse(stored);
        memoryCache.set(endpoint, parsed);
        return parsed.data;
      }
    } catch (_) {}
  }
  return null;
}

export function setCachedData<T = any>(endpoint: string, data: T) {
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  memoryCache.set(endpoint, entry);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`grooveli_cache_${endpoint}`, JSON.stringify(entry));
    } catch (_) {}
  }
}

/**
 * Stale-While-Revalidate fetch helper:
 * Returns cached data immediately if available, while silently revalidating in background.
 */
export async function cachedApiFetch<T = any>(
  endpoint: string,
  options: {
    ttlMs?: number;
    skipAuthRedirect?: boolean;
    onBackgroundUpdate?: (freshData: any) => void;
  } = {}
): Promise<{ data: T | null; fromCache: boolean }> {
  const cached = getCachedData<T>(endpoint);
  const ttl = options.ttlMs ?? DEFAULT_TTL_MS;
  const memEntry = memoryCache.get(endpoint);
  const isFresh = memEntry && (Date.now() - memEntry.timestamp < ttl);

  if (cached) {
    // If cached, trigger background revalidation if stale
    if (!isFresh) {
      apiFetch(endpoint, { skipAuthRedirect: options.skipAuthRedirect })
        .then(async (res) => {
          if (res && res.ok) {
            const freshJson = await res.json();
            setCachedData(endpoint, freshJson);
            options.onBackgroundUpdate?.(freshJson);
          }
        })
        .catch(() => {});
    }
    return { data: cached, fromCache: true };
  }

  // Not in cache: perform network request
  const res = await apiFetch(endpoint, { skipAuthRedirect: options.skipAuthRedirect });
  if (res && res.ok) {
    const json = await res.json();
    setCachedData(endpoint, json);
    return { data: json, fromCache: false };
  }

  return { data: null, fromCache: false };
}

export function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('groovely_token');
    localStorage.removeItem('groovely_user_id');
    localStorage.removeItem('groovely_wallet');
    localStorage.removeItem('groovely_role');
    localStorage.removeItem('grooveli_token');
    localStorage.removeItem('grooveli_user_id');
    localStorage.removeItem('grooveli_wallet');
    localStorage.removeItem('grooveli_role');
    
    // Clear session cache on logout
    try {
      sessionStorage.clear();
      memoryCache.clear();
    } catch (_) {}

    // Show the toast
    toast.error('Login has expired, please login', {
      id: 'auth-expired', // Prevent duplicate toasts
    });

    window.location.href = '/login';
  }
}

export function resolveIpfsUrl(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    // Filter out mock/invalid CIDs (real CID v0 is 46 chars, CID v1 is 59 chars)
    if (cid.length < 40) return '';
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }
  return url;
}
