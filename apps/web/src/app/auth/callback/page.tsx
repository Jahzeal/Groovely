'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (status === 'AUTHENTICATED' && token) {
      // 1. Store auth data
      localStorage.setItem('groovely_token', token);
      if (userId) localStorage.setItem('groovely_user_id', userId);
      
      // 2. Redirect based on new user status
      if (isNewUser) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } else if (status === 'WALLET_REQUIRED') {
      // This is for future use if we want to prompt for wallet linking
      // For now, let's redirect back to onboarding with the googleToken
      const googleToken = searchParams.get('googleToken');
      const email = searchParams.get('email');
      const displayName = searchParams.get('displayName');
      
      // Store temp data
      if (googleToken) localStorage.setItem('pending_google_token', googleToken);
      
      router.push('/onboarding?stage=link_wallet');
    } else {
      // Error case
      console.error('Auth callback error - missing parameters');
      router.push('/login?error=auth_failed');
    }
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 border-4 border-accent-purple border-t-transparent rounded-full animate-spin" />
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Verifying Identity</h2>
        <p className="text-zinc-500 text-sm font-medium">Please wait while we sync your account...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <Suspense fallback={null}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
