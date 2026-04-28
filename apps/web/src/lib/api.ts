import toast from 'react-hot-toast';

export const API_BASE = 'https://groovely-github-repo.onrender.com';

export async function apiFetch(endpoint: string, options: RequestInit & { skipAuthRedirect?: boolean } = {}) {
  const token = localStorage.getItem('groovely_token');
  
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
  localStorage.removeItem('groovely_token');
  localStorage.removeItem('groovely_user_id');
  localStorage.removeItem('groovely_wallet');
  localStorage.removeItem('groovely_role');
  
  // Show the toast
  toast.error('Login has expired, please login', {
    id: 'auth-expired', // Prevent duplicate toasts
  });

  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
