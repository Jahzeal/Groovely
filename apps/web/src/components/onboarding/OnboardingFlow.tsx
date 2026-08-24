'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import Link from 'next/link';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { SelectionCard } from './SelectionCard';
import { WalletCard } from './WalletCard';
import { Twitter as XIcon, Instagram as InstagramIcon, SoundCloud as SoundCloudIcon, Google as GoogleIcon } from '../ui/SocialIcons';
import toast from 'react-hot-toast';
import { useLogin, usePrivy, useLogout } from '@privy-io/react-auth';
import { apiFetch } from '@/lib/api';

export const MetaMaskIcon = () => (
  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-16 h-16" />
);

export const WalletConnectIcon = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#3B99FC" />
    <path d="M72.2965 37.6433C60.0384 25.4309 40.1037 25.4309 27.8455 37.6433C27.1353 38.3506 27.1353 39.4975 27.8455 40.2048L32.1472 44.4905C32.4938 44.8358 33.0558 44.8358 33.4024 44.4905C42.548 35.3789 57.3826 35.3789 66.5283 44.4905C66.8749 44.8358 67.4368 44.8358 67.7834 44.4905L72.0851 40.2048C72.7954 39.4975 72.7954 38.3506 72.2965 37.6433Z" fill="white" />
    <path d="M84.7679 49.9868C79.4673 44.7061 70.8388 44.7061 65.5381 49.9868C65.1915 50.3321 65.1915 50.8919 65.5381 51.2372L69.8398 55.523C70.5501 56.2302 70.5501 57.3771 69.8398 58.0844C66.3688 61.5425 60.7138 61.5425 57.2427 58.0844L52.8872 53.7449C51.2721 52.1357 48.6586 52.1357 47.0434 53.7449L42.6879 58.0844C39.2168 61.5425 33.5619 61.5425 30.0908 58.0844C29.3806 57.3771 29.3806 56.2302 30.0908 55.523L34.3925 51.2372C34.7391 50.8919 34.7391 50.3321 34.3925 49.9868C29.0919 44.7061 20.4633 44.7061 15.1627 49.9868C14.4524 50.6941 14.4524 51.841 15.1627 52.5483L25.9613 63.3067C31.2503 68.5759 39.8143 68.5759 45.1033 63.3067L49.07 59.3547C49.569 58.8576 50.3805 58.8576 50.8795 59.3547L54.8462 63.3067C60.1352 68.5759 68.6993 68.5759 73.9883 63.3067L84.7869 52.5483C85.4971 51.841 85.4971 50.6941 84.7679 49.9868Z" fill="white" />
  </svg>
);

export const PhantomIcon = () => (
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADoAAAAyCAYAAAAN6MhFAAAFiklEQVR4Adxa3VYiRxCu6oHchrOw19EnCF4maiJPEH2CyF2O4pE3cH0C3bPo2Tv1CTRPgMni5lLfQPdayZLbMDO19bUwDAwDyK/QZ5qu7q6uqa+ru6Z/MPSKws7bm+zum0pxL31zVshUbnffVu41lSCmP31V+raQubkEH/gHVX/mQAuZTxsWmIIwIrds6EhYthVAloWWKByYU5rNEskm+MC/m67c76RvwK9V8c9MgBZT5ZRa5aCg4Ii4bIE9g6CXBmZaMixnAPxHqtzeMSFhUwXaBOg6iXu1yjsaElxI/4AE4EQieb+bqRSDwhAxFaCTBBjCYkkmOtpN//O7zYR+Jg60kP68OQkLhjBESGbvvNNRTQwo5kshUykT+5fjHKIRVDEF7MslRlKzeiJA4UkTTuJWX7KhcSYP5qybSATzdexA9zKVI1JPOgsrUiTwftOqYwMKgRiqQhT0Is0+pOqJpP3GjgUo5mPdSc50qMb1qXrh31A3MlCAdJxkGXMCAl9hzGK0jQR0J1XOwumMFaRIjYXPSfiqT6ddg0+EHqh3SKlTyg4NFCCNk9DPB2P92ftVA9ZCaddzVz5UV/Ol6uqW69aXURZtLoelp7Uc+E6qa8u6yjqM8rRKhHg4oJMASRpUocOPtVxgIUsLvdeq4AHw0tP6u6BACZsXqlFMYJalF1sUc5Kd5EQWAd95/0eGa9Kvn4f1ZyN/hvMtWi5adDvFvvn+RUABcoKOp3Zcy0WsEimLsxxTpC01grzUoro7uByr42koQmSJrnMdHtPWNn+YuvKRxJTTcxjYos8rHtJNL00sYOnYKdx1nPZlpPCPnTw2z/yrTWN+BgJaePN5X4imsOLho6JuyqkRQAuZo0a2mWx0bsOgn1bGGkF1/68vUMxLMv6xCprGk8UKC+dBiKC7TRXWbdheunK29/bvbT1ZOOunnxH+2hconM80EDbfAWA4D7JRj0ma5Z2pMG2LmDPlt2vZzvpwXtj/0hNoIXNzoIJiz2HCwl41LXIXC9QOWZK2D/OrBtNDOd84DyauftpDNk6PcZSfPq52t+ienpMuxJB97qVrJBGLYsj6JAeoXIwofwFHBGgykdxfIGsCY9SisKZMZWGA908+itCD7myiQNUBLdCQJdLhakGiS5VGEsT2dWVQPJ+EZzjYywZAF8zTwjJ3+KyAQAyACss+ChYl+tKyJjBZoHBCmold/WvdXD2iTui0utp2MmGBOia5OVdI+igrxIedLBYoG7KHvJ2Vzfw8pd2sCf0NNrdKLIy39bx6TvFEHoPD3Ujp3BZI23FpGIYRnyfihDCESCj2ZI4GCFbGAHyWReRKV0Gx20qDw13LOOYflXtBcSd2A7yLhdRr+nZBTn0COiThuflebHBGP/RiGKqO5T3prn6ottoIite9esRzalXkAS/mZeT8t4PT0Bj/GQLZeHHpcb2onrz7+SuYekW9ZILiuI4w5ARr1a5NdLgmvfoKeLvWhwpNiB6ZBEgoObQgBel7bq6puF4i6a2ajo6oQO0AyZWq61v9LNlsakT8L83MSKkqKV59q6lkve6pMoNLRCcB5GktdxdupWCKvssrzH4e0XWd5ZLepJWe1l8k3zDxSJ6xpZSTDyvZADyoMteefv/C7VtyiU5rq3cfHn85R/xY+ym4bQvz9KMNMV3RKEEtSYRh9HNEjt5v5mGpOPGo08V3vqQWanRMHOvI5SbhunfDfu+sojqnSjHDCMqfVNeWWThPzzfY1zYVzDvJoe602r74HhlRjABzXMvVVOGBXHmbDP2EwOPFDbcwL5wKbrBLajmbVteLpZjOCbcbJ20g7OTfNb1bkUHB6ryTHD4h6CS0n4dogUJR7WFdPklOvfCF5gPPJ0yY/ACnHaEAYZUpW4PGEL4BAAD///g9j6kAAAAGSURBVAMA+FBS6yZZf7AAAAAASUVORK5CYII=" alt="Phantom" className="w-16 h-16 object-contain" />
);


const UserIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

export const OnboardingFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  // Handled via standard AUTHENTICATED status now
  const [role, setRole] = useState<'creator' | 'listener' | null>(null);
  const [wallet, setWallet] = useState<'metamask' | 'walletconnect' | 'phantom' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [walletTimedOut, setWalletTimedOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem('grooveli_role');
    if (savedRole === 'creator') {
      setRole('creator');
    } else if (savedRole === 'fan' || savedRole === 'listener') {
      setRole('listener');
    }

    const token = localStorage.getItem('grooveli_token');
    if (token) {
      setStep(3);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email) {
          setUserEmail(payload.email);
        }
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleZeroDevError = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setError(detail || 'Smart wallet creation failed. Please try again.');
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('zerodev_error', handleZeroDevError);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('zerodev_error', handleZeroDevError);
      }
    };
  }, []);

  // Profile data (Step 3)
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [creatorType, setCreatorType] = useState('');

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const { ready, authenticated, user } = usePrivy();

  const { login } = useLogin({
    onComplete: () => {
      console.log('Login complete, waiting for wallet to initialize...');
    }
  });

  const { logout } = useLogout();

  // If user is authenticated but wallet hasn't appeared within 12s, surface the timeout UI
  useEffect(() => {
    if (!authenticated || user?.wallet?.address) return;
    const timer = setTimeout(() => setWalletTimedOut(true), 12000);
    return () => clearTimeout(timer);
  }, [authenticated, user?.wallet?.address]);

  // Pre-populate profile fields from Google/Social login metadata
  useEffect(() => {
    if (!user) return;
    
    if (!displayName) {
      const suggestedName = user.google?.name || user.github?.name || user.twitter?.name || '';
      if (suggestedName) setDisplayName(suggestedName);
    }
    
    if (!username) {
      const email = user.google?.email || user.email?.address || '';
      let suggestedUser = '';
      const socialUsername = user.github?.username || user.twitter?.username || '';
      if (socialUsername) {
        suggestedUser = socialUsername;
      } else if (email) {
        suggestedUser = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      }
      if (suggestedUser) setUsername(suggestedUser);
    }
  }, [user]);

  useEffect(() => {
    if (!ready || !authenticated || !user) return;
    
    const smartWallet = user.linkedAccounts.find(
      (account) => account.type === 'smart_wallet'
    );
    const walletAddr = smartWallet?.address || user.wallet?.address;
    
    if (!walletAddr) {
      return;
    }

    // If user already has a token, sync their newly initialized Privy wallet to backend
    const token = localStorage.getItem('grooveli_token') || localStorage.getItem('groovely_token');
    if (token) {
      const storedWallet = localStorage.getItem('grooveli_wallet') || localStorage.getItem('groovely_wallet');
      if (!storedWallet || storedWallet !== walletAddr) {
        localStorage.setItem('grooveli_wallet', walletAddr);
        localStorage.setItem('groovely_wallet', walletAddr);
        apiFetch('/api/users/me', {
          method: 'PUT',
          body: JSON.stringify({ wallet: walletAddr }),
          skipAuthRedirect: true
        }).catch(() => {});
      }
      return;
    }
    
    const registerUserOnBackend = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedRole = localStorage.getItem('groovely_role') || localStorage.getItem('grooveli_role');
        const activeRole = role === 'creator' || storedRole === 'creator' ? 'creator' : 'fan';
        const payloadRole = activeRole;
        setRole(activeRole === 'creator' ? 'creator' : 'listener');

        const userEmail = user.google?.email || user.email?.address || '';

        let authData: any = null;

        if (userEmail) {
          // 1. Try Google signup with wallet attached
          const signupRes = await apiFetch('/api/auth/signup/google', {
            method: 'POST',
            body: JSON.stringify({ email: userEmail, role: payloadRole, walletAddress: walletAddr }),
            skipAuthRedirect: true,
          });

          if (signupRes && signupRes.ok) {
            authData = await signupRes.json();
          } else {
            // 2. If already exists, login with Google + wallet
            const loginRes = await apiFetch('/api/auth/login/google', {
              method: 'POST',
              body: JSON.stringify({ email: userEmail, walletAddress: walletAddr }),
              skipAuthRedirect: true,
            });
            if (loginRes && loginRes.ok) {
              authData = await loginRes.json();
            }
          }
        }

        if (!authData && walletAddr) {
          // Fallback to wallet signup/login
          const signupRes = await apiFetch('/api/auth/signup/wallet', {
            method: 'POST',
            body: JSON.stringify({ walletAddress: walletAddr, role: payloadRole }),
            skipAuthRedirect: true,
          });

          if (signupRes && signupRes.ok) {
            authData = await signupRes.json();
          } else {
            const loginRes = await apiFetch('/api/auth/login/wallet', {
              method: 'POST',
              body: JSON.stringify({ walletAddress: walletAddr }),
              skipAuthRedirect: true,
            });
            if (loginRes && loginRes.ok) {
              authData = await loginRes.json();
            }
          }
        }

        if (!authData) {
          throw new Error('Could not authenticate account with backend');
        }

        // Store JWT & synchronized keys
        const actualToken = authData.token || authData.data?.token;
        const actualUserId = authData.userId || String(authData.data?.user?.id);
        const actualWallet = walletAddr || authData.user?.wallet || authData.data?.user?.wallet;
        const actualRole = payloadRole || authData.user?.role || authData.data?.user?.role;

        localStorage.setItem('grooveli_token', actualToken);
        localStorage.setItem('groovely_token', actualToken);
        localStorage.setItem('grooveli_user_id', actualUserId);
        localStorage.setItem('groovely_user_id', actualUserId);
        localStorage.setItem('grooveli_wallet', actualWallet || '');
        localStorage.setItem('groovely_wallet', actualWallet || '');
        localStorage.setItem('grooveli_role', actualRole);
        localStorage.setItem('groovely_role', actualRole);

        if (userEmail) {
          setUserEmail(userEmail);
        }

        if (authData.isNewUser) {
          setStep(3);
          toast.success('Successfully connected!');
        } else {
          toast.success('Welcome back!');
          if (actualRole === 'fan') {
            router.push('/explore');
          } else {
            router.push('/dashboard');
          }
        }
      } catch (err: any) {
        console.error('Google backend link error:', err);
        setError(err.message || 'Backend registration failed');
        toast.error(err.message || 'Backend registration failed');
      } finally {
        setLoading(false);
      }
    };
    
    registerUserOnBackend();
  }, [ready, authenticated, user, role]);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleConnectWallet = async () => {
    if (!wallet) return;

    if (wallet === 'walletconnect') {
      login({ loginMethods: ['wallet'] });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. Find the right connector using improved discovery (EIP-6963)
      const target = wallet?.toLowerCase() || ''; // 'metamask', 'phantom', etc.
      let connector = connectors.find((c: any) => {
        const cName = c.name.toLowerCase();
        const cId = c.id.toLowerCase();
        return cId.includes(target) || cName.includes(target);
      });

      if (!connector && (target === 'metamask' || target === 'phantom')) {
        connector = connectors.find((c: any) => c.id === 'injected');
      }

      if (!connector) {
        throw new Error(`No compatible extension detected for ${wallet === 'metamask' ? 'MetaMask' : 'Phantom'}. Please install the extension or ensure it is enabled.`);
      }

      // 2. Connect
      let walletAddr = address;
      if (!isConnected) {
        try {
          const connectResult = await connectAsync({ connector });
          // @ts-ignore
          walletAddr = connectResult.accounts[0];
        } catch (error: any) {
          if (error.name === 'ConnectorAlreadyConnectedError') {
            const accounts = await connector.getAccounts();
            // @ts-ignore
            walletAddr = accounts[0];
          } else {
            throw error;
          }
        }
      }

      if (!walletAddr) {
        throw new Error('Could not determine wallet address');
      }

      // 3. Fetch Nonce
      console.log('Step 3: Fetching nonce...');
      // Use a relative URL so the Next.js proxy handles routing (no CORS).
      const nonceRes = await fetch(`/api/auth/nonce/${walletAddr}`);
      if (!nonceRes.ok) throw new Error('Failed to fetch nonce');
      const { nonce, message } = await nonceRes.json();
      console.log('Step 3 SUCCESS. Nonce data:', { nonce, messageLength: message?.length });

      // 4. Sign Message
      console.log('Step 4: Requesting signature from wallet...');
      const signature = await signMessageAsync({ message });
      console.log('Step 4 SUCCESS. Signature received substring:', signature?.substring(0, 10));

      // 5. Connect Backend
      console.log('Step 5: Sending auth request to backend...');
      
      let connectRes;

      const payloadRole = role === 'creator' ? 'creator' : 'fan';
      connectRes = await fetch('/api/auth/signup/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr, role: payloadRole, signature }),
      });
      
      const authData = await connectRes.json();

      if (!connectRes.ok) throw new Error(authData.error || authData.message || 'Authentication failed');
      console.log('Step 5 SUCCESS. authData:', { isNewUser: authData.isNewUser, userId: authData.userId });

      // 6. Store JWT
      localStorage.setItem('grooveli_token', authData.token);
      localStorage.setItem('grooveli_user_id', authData.userId);
      localStorage.setItem('grooveli_wallet', walletAddr || '');

      // Move to Step 3 if new, else dashboard
      if (authData.isNewUser) {
        setStep(3);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Connection error step trace:', err);
      if (err instanceof Error) {
        console.error(err.stack);
      }
      const errorMessage = err.message || 'Something went wrong';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (authenticated) {
      if (!user?.wallet?.address) {
        toast.loading('Setting up your wallet... please wait a moment.', { duration: 4000 });
      }
      return;
    }
    login({ loginMethods: ['google'] });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('grooveli_token') || localStorage.getItem('groovely_token');
      if (!token) {
        throw new Error('Authentication session expired. Please sign in again.');
      }
      const storedRole = localStorage.getItem('groovely_role') || localStorage.getItem('grooveli_role');
      const targetRole = role === 'creator' || storedRole === 'creator' ? 'creator' : 'fan';
      const smartWallet = user?.linkedAccounts?.find(
        (account) => account.type === 'smart_wallet'
      );
      const activeWallet = smartWallet?.address || user?.wallet?.address || address || localStorage.getItem('grooveli_wallet') || localStorage.getItem('groovely_wallet') || undefined;

      const res = await apiFetch(`/api/users/me`, {
        method: 'PUT',
        body: JSON.stringify({
          displayName,
          username,
          bio,
          creatorType: role === 'creator' ? creatorType : 'FAN',
          role: targetRole,
          wallet: activeWallet
        }),
        skipAuthRedirect: true
      });

      if (!res || !res.ok) {
        let errorMsg = 'Failed to update profile';
        try {
          if (res) {
            const data = await res.json();
            errorMsg = data.error || data.message || errorMsg;
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }

      try {
        const json = await res.json();
        const data = json.data ?? json;
        const finalRole = data.role || targetRole;
        const finalToken = data.token || token;
        
        localStorage.setItem('grooveli_token', finalToken);
        localStorage.setItem('groovely_token', finalToken);
        localStorage.setItem('grooveli_role', finalRole);
        localStorage.setItem('groovely_role', finalRole);

        if (activeWallet) {
          localStorage.setItem('grooveli_wallet', activeWallet);
          localStorage.setItem('groovely_wallet', activeWallet);
        }

        if (finalRole === 'creator') {
          setRole('creator');
        }
      } catch (e) {
        console.error('Error saving updated token:', e);
      }

      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      toast.error(err.message || 'Failed to save profile', {
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '10px',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] relative flex flex-col">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex w-full items-center justify-between px-12 py-6">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-6">
          <span className="text-zinc-400 text-sm font-medium hidden sm:inline">Already have an account?</span>
          <button 
            onClick={() => router.push('/login')}
            className="bg-accent-purple text-white px-7 py-2.5 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all"
          >
            Log In
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-2 pb-12 relative z-10 w-full">
        <div className={`w-full ${
          step === 4 
            ? 'max-w-[900px] p-6 md:p-8 rounded-[40px] bg-black/40 border border-white/5' 
            : step === 2 
              ? 'max-w-[664px] p-6 sm:p-10 md:p-12 rounded-[16px] bg-[#0F172A] border border-[#232B3E]' 
              : 'max-w-[640px] p-8 sm:p-10 rounded-[40px] bg-black/40 border border-white/5'
        } backdrop-blur-2xl shadow-2xl relative overflow-hidden mb-6 transition-all duration-500`}>
          {/* Subtle Background Inner Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-purple/5 blur-[80px] rounded-full pointer-events-none" />

          {/* Back Button (Figma Frame 28: Left arrow + Back in Space Grotesk 700 16px) */}
          {step < 4 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white hover:text-[#8A2BE2] transition-colors mb-6 font-['Space_Grotesk',sans-serif] font-bold text-[16px] cursor-pointer"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </button>
          )}

          {step === 1 && (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-10">
                <ProgressBar currentStep={1} totalSteps={3} />
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-8 mb-4 text-center">
                  How will you groove with us?
                </h1>
                <p className="text-zinc-400 text-lg font-medium text-center">
                  Choose your path to get the best experience on Groovely
                </p>
              </div>

              {/* Selection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <SelectionCard
                  title="I'm a Creator"
                  imageSrc="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  isSelected={role === 'creator'}
                  onSelect={() => {
                    setRole('creator');
                    localStorage.setItem('grooveli_role', 'creator');
                    localStorage.setItem('groovely_role', 'creator');
                  }}
                />
                <SelectionCard
                  title="I'm a Listener/Fan"
                  imageSrc="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  isSelected={role === 'listener'}
                  onSelect={() => {
                    setRole('listener');
                    localStorage.setItem('grooveli_role', 'fan');
                    localStorage.setItem('groovely_role', 'fan');
                  }}
                />
              </div>

              {/* Continue Button */}
              <div className="space-y-6">
                <Button fullWidth onClick={() => setStep(2)} disabled={!role}>
                  Continue
                </Button>
                <p className="text-zinc-500 text-sm font-medium text-center">
                  Not sure yet? You can switch roles later.
                </p>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Header (Figma: Progress Bar 200px + Title Clash Display 28px + Subtitle Space Grotesk 16px) */}
              <div className="flex flex-col items-center mb-6 sm:mb-8">
                {/* Progress Bar (Figma: width 200px, 3 circles with active fill to Step 2) */}
                <div className="relative w-[200px] h-6 flex items-center justify-between mb-6">
                  {/* Background track */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#D9D9D9] rounded-full" />
                  {/* Active fill */}
                  <div className="absolute left-0 w-1/2 top-1/2 -translate-y-1/2 h-1 bg-[#8A2BE2] rounded-full" />
                  {/* Step circles */}
                  <div className="relative z-10 w-6 h-6 rounded-full bg-[#8A2BE2] flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(138,43,226,0.5)]">
                    1
                  </div>
                  <div className="relative z-10 w-6 h-6 rounded-full bg-[#8A2BE2] flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_10px_rgba(138,43,226,0.5)]">
                    2
                  </div>
                  <div className="relative z-10 w-6 h-6 rounded-full bg-[#CACACA] flex items-center justify-center text-[10px] font-bold text-zinc-800">
                    3
                  </div>
                </div>

                <h1 className="font-['Clash_Display',sans-serif] font-bold text-[24px] sm:text-[28px] leading-[36px] sm:leading-[42px] text-white text-center mb-2">
                  Connect your wallet to Groovely
                </h1>
                <p className="font-['Space_Grotesk',sans-serif] font-bold text-[15px] sm:text-[16px] leading-[24px] text-[#CACACA] text-center">
                  Choose a wallet to connect to Groovely
                </p>
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}
              </div>

              {/* Wallet Selection: Desktop = 3 Side-by-Side Columns (162px × 146px), Mobile = 3 Stacked Rows (98px) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                {/* MetaMask (Figma Frame 2) */}
                <div
                  onClick={() => setWallet('metamask')}
                  className={`w-full h-[98px] md:h-[146px] p-4 sm:p-6 rounded-[12px] border-2 cursor-pointer flex flex-row md:flex-col items-center justify-start md:justify-center gap-4 sm:gap-6 md:gap-4 transition-all duration-300 ${
                    wallet === 'metamask'
                      ? 'border-[#8A2BE2] bg-[#8A2BE2]/10 shadow-[0_0_20px_rgba(138,43,226,0.25)]'
                      : 'border-[#232B3E] bg-[#0F172A] hover:border-[#8A2BE2]/50'
                  }`}
                >
                  <div className="w-[52px] h-[50px] flex items-center justify-center shrink-0">
                    <MetaMaskIcon />
                  </div>
                  <span className="font-['Space_Grotesk',sans-serif] font-bold text-[16px] leading-[24px] text-white text-center">
                    MetaMask
                  </span>
                </div>

                {/* WalletConnect (Figma Frame 3) */}
                <div
                  onClick={() => setWallet('walletconnect')}
                  className={`w-full h-[98px] md:h-[146px] p-4 sm:p-6 rounded-[12px] border-2 cursor-pointer flex flex-row md:flex-col items-center justify-start md:justify-center gap-4 sm:gap-6 md:gap-4 transition-all duration-300 ${
                    wallet === 'walletconnect'
                      ? 'border-[#8A2BE2] bg-[#8A2BE2]/10 shadow-[0_0_20px_rgba(138,43,226,0.25)]'
                      : 'border-[#232B3E] bg-[#0F172A] hover:border-[#8A2BE2]/50'
                  }`}
                >
                  <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    <WalletConnectIcon />
                  </div>
                  <span className="font-['Space_Grotesk',sans-serif] font-bold text-[16px] leading-[24px] text-white text-center">
                    WalletConnect
                  </span>
                </div>

                {/* Phantom (Figma Frame 4) */}
                <div
                  onClick={() => setWallet('phantom')}
                  className={`w-full h-[98px] md:h-[146px] p-4 sm:p-6 rounded-[12px] border-2 cursor-pointer flex flex-row md:flex-col items-center justify-start md:justify-center gap-4 sm:gap-6 md:gap-4 transition-all duration-300 ${
                    wallet === 'phantom'
                      ? 'border-[#8A2BE2] bg-[#8A2BE2]/10 shadow-[0_0_20px_rgba(138,43,226,0.25)]'
                      : 'border-[#232B3E] bg-[#0F172A] hover:border-[#8A2BE2]/50'
                  }`}
                >
                  <div className="w-[58px] h-[50px] flex items-center justify-center shrink-0">
                    <PhantomIcon />
                  </div>
                  <span className="font-['Space_Grotesk',sans-serif] font-bold text-[16px] leading-[24px] text-white text-center">
                    Phantom
                  </span>
                </div>
              </div>

              {/* Action Buttons & Google Social (Figma Frame 27) */}
              <div className="space-y-4">
                {/* Connect Action Button (Figma: height 56px, bg #8A2BE2, border-radius 8px, font Space Grotesk 700 16px) */}
                <button
                  onClick={handleConnectWallet}
                  disabled={!wallet || loading}
                  className="w-full h-[56px] bg-[#8A2BE2] hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-['Space_Grotesk',sans-serif] font-bold text-[16px] leading-[24px] rounded-[8px] flex items-center justify-center transition-all cursor-pointer shadow-[0_0_20px_rgba(138,43,226,0.3)] active:scale-[0.99]"
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </button>

                {/* Other sign up options / Divider (Figma: border 1px solid #959595, "Or" font Urbanist 400 16px #959595) */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-0 border-t border-[#959595]" />
                  <span className="font-['Urbanist',sans-serif] font-normal text-[16px] leading-[24px] text-[#959595]">
                    Or
                  </span>
                  <div className="flex-1 h-0 border-t border-[#959595]" />
                </div>

                {/* Google Button (Figma: height 56px, bg #192134, border-radius 999px, font Urbanist 600 16px #FFFFFF) */}
                {(mounted && (localStorage.getItem('grooveli_token') || localStorage.getItem('groovely_token') || authenticated)) ? (
                  <button 
                    onClick={() => setStep(3)}
                    className="w-full h-[56px] bg-[#192134] hover:bg-[#232B3E] text-white font-['Urbanist',sans-serif] font-semibold text-[16px] rounded-full flex items-center justify-center gap-3 transition-all cursor-pointer border border-[#232B3E]"
                  >
                    <span>Continue to Profile</span>
                  </button>
                ) : authenticated ? (
                  (walletTimedOut || error) ? (
                    <div className="w-full flex flex-col items-center gap-3">
                      <p className="text-red-400 text-xs text-center font-bold uppercase tracking-wider">
                        {error ? 'Wallet Setup Failed' : 'Wallet setup timed out. Please try again.'}
                      </p>
                      <button
                        onClick={async () => { setWalletTimedOut(false); setError(null); await logout(); }}
                        className="w-full h-[56px] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-[14px] rounded-full flex items-center justify-center transition-all cursor-pointer"
                      >
                        <span>Retry — Sign in with Google</span>
                      </button>
                    </div>
                  ) : (
                    <div className="w-full bg-[#192134] border border-[#232B3E] rounded-2xl p-5 text-center space-y-3">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 border-2 border-[#8A2BE2] border-t-transparent rounded-full animate-spin" />
                        <h3 className="font-bold text-white text-sm font-['Space_Grotesk',sans-serif]">Creating Your Smart Wallet</h3>
                        <p className="text-xs text-zinc-400 max-w-xs mx-auto">Please wait while we initialize your Web3 smart account on the blockchain.</p>
                      </div>
                      {user?.email?.address && (
                        <div className="bg-black/40 rounded-xl px-3 py-1.5 border border-white/5 inline-block mx-auto">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-bold">Logged In</span>
                          <span className="text-xs font-bold text-white font-mono">{user.email.address}</span>
                        </div>
                      )}
                      <button
                        onClick={async () => { setWalletTimedOut(false); await logout(); }}
                        className="text-xs text-red-400 hover:text-red-300 underline font-semibold transition-colors block mx-auto cursor-pointer"
                      >
                        Stuck? Click here to sign out and retry
                      </button>
                    </div>
                  )
                ) : (
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full h-[56px] bg-[#192134] hover:bg-[#232B3E] text-white font-['Urbanist',sans-serif] font-semibold text-[16px] rounded-full flex items-center justify-center gap-3 transition-all cursor-pointer border border-[#232B3E] active:scale-[0.99]"
                  >
                    <GoogleIcon size={20} />
                    <span>Google</span>
                  </button>
                )}

                {/* Already have an account? Log In (Figma: Space Grotesk 400 16px #FFFFFF + Space Grotesk 700 16px #8A2BE2) */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="font-['Space_Grotesk',sans-serif] font-normal text-[16px] text-white">
                    Already have an account?
                  </span>
                  <button
                    onClick={() => router.push('/login')}
                    className="font-['Space_Grotesk',sans-serif] font-bold text-[16px] text-[#8A2BE2] hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </div>

                {/* Terms & Privacy Policy (Figma: Space Grotesk 400 14px #CACACA) */}
                <div className="flex justify-between items-center pt-4 text-[#CACACA] font-['Space_Grotesk',sans-serif] text-[14px] px-1">
                  <span className="cursor-pointer hover:text-white transition-colors">Terms &amp; Conditions</span>
                  <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Header */}
              <div className="flex flex-col items-center mb-8">
                <ProgressBar currentStep={3} totalSteps={3} />
                <h1 className="text-[28px] md:text-3xl font-extrabold tracking-tight mt-6 mb-3 text-center">
                  Set up your Groovely profile
                </h1>
                <p className="text-zinc-400 text-sm font-medium text-center px-4 mb-6">
                  You're almost ready to create, stream, and connect. Let's personalize your space
                </p>
                <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-white">
                  {address ? (
                    `Wallet Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
                  ) : userEmail ? (
                    `Signed in via Google: ${userEmail}`
                  ) : (
                    'Not Connected'
                  )}
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}
              </div>

              {/* Profile Image Upload */}
              <div className="flex justify-center mb-8">
                <div className="relative group cursor-pointer">
                  <div className="w-[120px] h-[120px] rounded-full border-[3px] border-white flex items-center justify-center bg-transparent transition-transform duration-300 group-hover:scale-105">
                    <UserIcon />
                  </div>
                  <div className="absolute bottom-0 right-0 w-9 h-9 border-[3px] border-[#0F0F16] rounded-full bg-accent-purple flex items-center justify-center group-hover:bg-opacity-90 transition-colors">
                    <PencilIcon />
                  </div>
                </div>
              </div>

              {/* Profile Form Content */}
              <div className="space-y-5">
                {/* Display Name */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 placeholder-zinc-600 text-white focus:outline-none focus:border-accent-purple transition-colors"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Username</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium pt-0.5">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                      className="w-full bg-transparent border border-white/20 rounded-xl pl-10 pr-4 py-3 placeholder-zinc-600 text-white focus:outline-none focus:border-accent-purple transition-colors"
                    />
                  </div>
                </div>

                {role === 'creator' && (
                  <>
                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the world what kind of sound you make"
                        rows={4}
                        className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 placeholder-zinc-600 text-white focus:outline-none focus:border-accent-purple transition-colors resize-none"
                      />
                    </div>

                    {/* Creator Type */}
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Creator Type</label>
                      <div className="relative">
                        <select
                          value={creatorType}
                          onChange={(e) => setCreatorType(e.target.value)}
                          className="w-full bg-transparent border border-white/20 rounded-xl px-4 py-3 text-zinc-500 appearance-none focus:outline-none focus:border-accent-purple transition-colors cursor-pointer"
                        >
                          <option value="" disabled>I'm a...</option>
                          <option value="ARTIST">Artist</option>
                          <option value="PRODUCER">Producer</option>
                          <option value="DJ">DJ</option>
                          <option value="SKIT_MAKER">Skit Maker</option>
                          <option value="PODCASTER">Podcaster</option>
                        </select>
                        <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {role === 'creator' && (
                <>
                  {/* Social Connections */}
                  <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-medium my-8">
                    <div className="h-px bg-white/10 flex-1" />
                    <span>Connect Your Socials</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  <div className="flex gap-4 mb-8">
                    <button className="flex-1 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/5 hover:border-accent-purple transition-all duration-300">
                      <XIcon />
                    </button>
                    <button className="flex-1 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/5 hover:border-accent-purple transition-all duration-300">
                      <InstagramIcon />
                    </button>
                    <button className="flex-1 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/5 hover:border-accent-purple transition-all duration-300">
                      <SoundCloudIcon />
                    </button>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className={`flex gap-4 w-full ${role === 'listener' ? 'mt-8' : ''}`}>
                {role === 'creator' && (
                  <div className="flex-1">
                    <Button variant="secondary" className="w-full text-sm">Save as Draft</Button>
                  </div>
                )}
                <div className="flex-1">
                  <Button
                    variant="primary"
                    className="w-full text-sm"
                    onClick={handleSaveProfile}
                    disabled={loading || !displayName || !username}
                  >
                    {loading ? 'Saving...' : 'Save & Continue'}
                  </Button>
                </div>
              </div>

              <p className="text-zinc-500 text-[11px] font-medium text-center mt-6">
                You're almost ready to create, stream, and connect. Let's personalize your
                space
              </p>
            </>
          )}

          {step === 4 && (
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center text-center md:text-left">
              <div className="w-full md:w-1/2 flex-shrink-0">
                <img
                  src={role === 'creator'
                    ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    : "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  }
                  alt={role === 'creator' ? "Creator Success" : "Fan Success"}
                  className="w-full aspect-[4/5] object-cover rounded-[32px] shadow-lg"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center py-4">
                <h1 className="text-[32px] md:text-4xl font-extrabold tracking-tight mb-4 text-white">
                  {role === 'creator' ? `You're all set, ${displayName}!` : `Welcome to Grooveli, ${displayName}!`}
                </h1>
                <p className="text-zinc-400 text-base font-medium mb-10 leading-relaxed max-w-sm mx-auto md:mx-0">
                  Your wallet and profile are now connected to Grooveli<br /><br />
                  {role === 'creator'
                    ? "Start creating, streaming, and connecting with your sound"
                    : "Start streaming and connecting with your sound"
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button variant="secondary" className="flex-1 bg-white/5 border-none hover:bg-white/10 text-sm" onClick={() => router.push('/marketplace')}>Visit Marketplace</Button>
                  <Button variant="primary" className="flex-1 text-sm" onClick={() => router.push(role === 'creator' ? '/dashboard' : '/explore')}>
                    {role === 'creator' ? 'Go to Dashboard' : 'Explore'}
                  </Button>
                </div>
                <p className="text-zinc-500 text-[11px] font-medium px-4 md:px-0">
                  Grooveli keeps your data secure, your wallet stays under your control
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
