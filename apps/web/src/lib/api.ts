import toast from 'react-hot-toast';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function apiFetch(endpoint: string, options: RequestInit & { skipAuthRedirect?: boolean } = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('groovely_token') : null;
  
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

export function handleLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('groovely_token');
    localStorage.removeItem('groovely_user_id');
    localStorage.removeItem('groovely_wallet');
    localStorage.removeItem('groovely_role');
    
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
    return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
  }
  return url;
}
