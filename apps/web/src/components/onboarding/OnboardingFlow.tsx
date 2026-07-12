'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { SelectionCard } from './SelectionCard';
import { WalletCard } from './WalletCard';
import { Twitter as XIcon, Instagram as InstagramIcon, SoundCloud as SoundCloudIcon, Google as GoogleIcon } from '../ui/SocialIcons';
import toast from 'react-hot-toast';
import { useLogin, usePrivy } from '@privy-io/react-auth';

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

  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem('groovely_role');
    if (savedRole === 'creator') {
      setRole('creator');
    } else if (savedRole === 'fan' || savedRole === 'listener') {
      setRole('listener');
    }

    const token = localStorage.getItem('groovely_token');
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

  useEffect(() => {
    if (!ready || !authenticated || !user) return;
    
    // Check if we already have a backend token
    const token = localStorage.getItem('groovely_token');
    if (token) return; // Already registered/logged in on backend
    
    const smartWallet = user.linkedAccounts.find(
      (account) => account.type === 'smart_wallet'
    );
    const walletAddr = smartWallet?.address || user.wallet?.address;
    
    if (!walletAddr) {
      // Wallet is still being created/loaded by Privy, wait for next change
      return;
    }
    
    const registerUserOnBackend = async () => {
      setLoading(true);
      setError(null);
      try {
        const payloadRole = role === 'creator' ? 'creator' : 'fan';
        const signupRes = await fetch('/api/auth/signup/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: walletAddr, role: payloadRole }),
        });

        let authData = await signupRes.json();
        
        if (!signupRes.ok) {
          // If conflict/error, let's login instead
          const loginRes = await fetch('/api/auth/login/wallet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ walletAddress: walletAddr }),
          });
          const loginData = await loginRes.json();
          if (!loginRes.ok) {
            throw new Error(loginData.error || loginData.message || 'Authentication failed');
          }
          authData = loginData;
        }

        // Store JWT
        const actualToken = authData.token || authData.data?.token;
        const actualUserId = authData.userId || String(authData.data?.user?.id);
        const actualWallet = walletAddr || authData.user?.wallet || authData.data?.user?.wallet;
        const actualRole = payloadRole || authData.user?.role || authData.data?.user?.role;

        localStorage.setItem('groovely_token', actualToken);
        localStorage.setItem('groovely_user_id', actualUserId);
        localStorage.setItem('groovely_wallet', actualWallet || '');
        localStorage.setItem('groovely_role', actualRole);

        // Decode email to state
        try {
          const payload = JSON.parse(atob(actualToken.split('.')[1]));
          if (payload.email) {
            setUserEmail(payload.email);
          }
        } catch (e) {
          console.error('Error parsing token:', e);
        }

        // Set Step 3
        setStep(3);
        toast.success('Successfully connected!');
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

      // Special case: If still not found for 'metamask', try generic 'injected'
      if (!connector && target === 'metamask') {
        connector = connectors.find((c: any) => c.id === 'injected');
      }

      if (!connector) connector = connectors[0];

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
      localStorage.setItem('groovely_token', authData.token);
      localStorage.setItem('groovely_user_id', authData.userId);
      localStorage.setItem('groovely_wallet', walletAddr || '');

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
    login({ loginMethods: ['google'] });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('groovely_token');
      const res = await fetch(`/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName,
          username,
          bio,
          creatorType: role === 'creator' ? creatorType : 'FAN',
          role: role === 'creator' ? 'creator' : 'fan'
        }),
      });

      if (!res.ok) {
        let errorMsg = 'Failed to update profile';
        try {
          const data = await res.json();
          errorMsg = data.error || data.message || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      try {
        const json = await res.json();
        const data = json.data ?? json;
        if (data.token) {
          localStorage.setItem('groovely_token', data.token);
        }
        if (data.role) {
          localStorage.setItem('groovely_role', data.role);
        } else {
          localStorage.setItem('groovely_role', role === 'creator' ? 'creator' : 'fan');
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
        <Logo />
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
      <main className="flex-1 flex items-start justify-center px-4 pt-2 pb-12 relative z-10 w-full">
        <div className={`w-full ${step === 4 ? 'max-w-[900px] p-6 md:p-8' : 'max-w-[640px] p-8 sm:p-10'} bg-black/40 backdrop-blur-2xl rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden mb-12 transition-all duration-500`}>
          {/* Subtle Background Inner Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-purple/5 blur-[80px] rounded-full pointer-events-none" />


          {/* Back Button */}
          {step < 4 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
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
                  onSelect={() => setRole('creator')}
                />
                <SelectionCard
                  title="I'm a Listener/Fan"
                  imageSrc="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  isSelected={role === 'listener'}
                  onSelect={() => setRole('listener')}
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
              {/* Header */}
              <div className="flex flex-col items-center mb-10">
                <ProgressBar currentStep={2} totalSteps={3} />
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-8 mb-4 text-center">
                  Connect your wallet to Groovely
                </h1>
                <p className="text-zinc-400 text-lg font-medium text-center">
                  Choose a wallet to connect to Groovely
                </p>
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                    {error}
                  </div>
                )}
              </div>

              {/* Wallet Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <WalletCard
                  name="MetaMask"
                  icon={<MetaMaskIcon />}
                  isSelected={wallet === 'metamask'}
                  onSelect={() => setWallet('metamask')}
                />
                <WalletCard
                  name="WalletConnect"
                  icon={<WalletConnectIcon />}
                  isSelected={wallet === 'walletconnect'}
                  onSelect={() => setWallet('walletconnect')}
                />
                <WalletCard
                  name="Phantom"
                  icon={<PhantomIcon />}
                  isSelected={wallet === 'phantom'}
                  onSelect={() => setWallet('phantom')}
                />
              </div>

              {/* Connect Button */}
              <div className="space-y-6">
                <Button fullWidth onClick={handleConnectWallet} disabled={!wallet || loading}>
                  {loading ? 'Connecting...' : 'Connect'}
                </Button>

                {/* OR Separator */}
                <div className="relative flex items-center gap-4 py-2">
                  <div className="flex-grow h-[1px] bg-white/5" />
                  <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] px-2">Or</span>
                  <div className="flex-grow h-[1px] bg-white/5" />
                </div>

                {/* Google Button or Skip button if already on Google */}
                {(mounted && localStorage.getItem('groovely_token')) ? (
                  <Button 
                    fullWidth 
                    variant="secondary"
                    onClick={() => setStep(3)}
                  >
                    {address ? 'Continue to Profile' : 'Continue without Wallet'}
                  </Button>
                ) : (
                  <button 
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-full py-4 group active:scale-[0.98]"
                  >
                    <GoogleIcon size={18} />
                    <span className="text-white font-bold text-sm tracking-wide">Continue with Google</span>
                  </button>
                )}

                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest text-center mt-2">
                  Your privacy matters. We won't post anything.
                </p>
              </div>

              {/* Footer Terms */}
              <div className="flex justify-between mt-12 text-[#80808a] text-xs px-2">
                <span className="cursor-pointer hover:text-white transition-colors">Terms & Conditions</span>
                <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
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
                  {role === 'creator' ? `You're all set, ${displayName}!` : `Welcome to Groovely, ${displayName}!`}
                </h1>
                <p className="text-zinc-400 text-base font-medium mb-10 leading-relaxed max-w-sm mx-auto md:mx-0">
                  Your wallet and profile are now connected to Groovely<br /><br />
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
                  Groovely keeps your data secure, your wallet stays under your control
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
