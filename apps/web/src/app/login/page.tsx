'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, useConfig } from 'wagmi';
import { signMessage } from '@wagmi/core';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { WalletCard } from '@/components/onboarding/WalletCard';
import { MetaMaskIcon, WalletConnectIcon, PhantomIcon } from '@/components/onboarding/OnboardingFlow';
import { Google as GoogleIcon } from '@/components/ui/SocialIcons';
import toast from 'react-hot-toast';
import { useLogin, usePrivy } from '@privy-io/react-auth';

export default function LoginPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<'metamask' | 'walletconnect' | 'phantom' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected, status } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const config = useConfig();

  const { ready, authenticated, user } = usePrivy();

  const { login } = useLogin({
    onComplete: () => {
      console.log('Login complete, waiting for auto-login handler...');
    }
  });

  useEffect(() => {
    // If the user already has a token in localStorage, redirect immediately
    const token = localStorage.getItem('groovely_token');
    const role = localStorage.getItem('groovely_role');
    if (token) {
      if (role === 'fan') {
        router.push('/explore');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    if (!ready || !authenticated || !user) return;

    // Check if wallet exists
    const smartWallet = user.linkedAccounts.find(
      (account) => account.type === 'smart_wallet'
    );
    const walletAddr = smartWallet?.address || user.wallet?.address;

    if (!walletAddr) {
      // Privy is logged in, but no wallet exists (corrupted state).
      // Automatically redirect to onboarding to resolve this and provision a wallet.
      console.log('No wallet found for logged-in user, redirecting to onboarding...');
      router.push('/onboarding');
      return;
    }

    const autoLoginBackend = async () => {
      setLoading(true);
      setError(null);
      try {
        const connectRes = await fetch(`/api/auth/login/wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: walletAddr }),
        });

        const authData = await connectRes.json();
        
        // If they are authenticated with Privy but don't exist in our backend DB yet,
        // redirect them to onboarding to choose a role and sign up.
        if (!connectRes.ok) {
          console.log('User not registered in backend, redirecting to onboarding...');
          router.push('/onboarding');
          return;
        }

        const { token: jwtToken, user: dbUser } = authData.data;
        localStorage.setItem('groovely_token', jwtToken);
        localStorage.setItem('groovely_user_id', String(dbUser.id));
        localStorage.setItem('groovely_wallet', dbUser.wallet ?? walletAddr);
        localStorage.setItem('groovely_role', dbUser.role ?? '');

        if (dbUser.role === 'fan') {
          router.push('/explore');
        } else {
          router.push('/dashboard');
        }
      } catch (err: any) {
        console.error('Auto-login error:', err);
        setError(err.message || 'Auto-login failed');
      } finally {
        setLoading(false);
      }
    };

    autoLoginBackend();
  }, [ready, authenticated, user, router]);

  const handleConnectWallet = async () => {
    if (!wallet) return;
    
    if (wallet === 'walletconnect') {
      login({ loginMethods: ['wallet'] });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Starting connection for wallet:', wallet);
      console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));

      // 1. Discovery
      const target = wallet?.toLowerCase() || '';
      let connector = connectors.find((c: any) => {
        const cName = c.name.toLowerCase();
        const cId = c.id.toLowerCase();
        return cId.includes(target) || cName.includes(target);
      });

      if (!connector && target === 'metamask') {
        connector = connectors.find((c: any) => c.id === 'injected');
      }

      if (connectors.length === 0) {
        throw new Error('No web3 wallets detected. Please install MetaMask or another compatible wallet.');
      }

      if (!connector) connector = connectors[0];
      
      console.log('Selected connector:', connector?.id, connector?.name);

      // 2. Connect
      let walletAddr = address;
      
      // If already connected to a different connector, or not connected at all
      if (!isConnected || (connector && connector.id !== 'injected' && isConnected)) {
        try {
          console.log('Attempting to connect via connectAsync...');
          const connectResult = await connectAsync({ connector });
          console.log('Connect result:', connectResult);
          // @ts-ignore
          walletAddr = connectResult.accounts[0];
        } catch (error: any) {
          if (error.name === 'ConnectorAlreadyConnectedError') {
            console.log('Connector already connected, fetching accounts...');
            const accounts = await connector.getAccounts();
            // @ts-ignore
            walletAddr = accounts[0];
          } else {
            throw error;
          }
        }
      }

      console.log('Wallet address determined:', walletAddr);
      if (!walletAddr) throw new Error('Could not determine wallet address');

      // 3. Authenticate with backend
      console.log('Authenticating with backend...');
      const connectRes = await fetch(`/api/auth/login/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr }),
      });

      const authData = await connectRes.json();
      if (!connectRes.ok) throw new Error(authData.error || authData.message || 'Authentication failed');

      // 4. Store JWT
      const { token, user } = authData.data;
      console.log('Login successful, storing credentials');
      localStorage.setItem('groovely_token', token);
      localStorage.setItem('groovely_user_id', String(user.id));
      localStorage.setItem('groovely_wallet', user.wallet ?? walletAddr);
      localStorage.setItem('groovely_role', user.role ?? '');

      // Redirect based on user role
      if (user.role === 'fan') {
        router.push('/explore');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Something went wrong during login';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    login({ loginMethods: ['google'] });
  };

  return (
    <div className="min-h-screen bg-[#050510] relative flex flex-col overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 starfield opacity-30" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex w-full items-center justify-between px-12 py-8">
        <Logo />
        <button
          onClick={() => router.push('/')}
          className="text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em]"
        >
          Back to Home
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10 w-full">
        <div className="w-full max-w-[500px] p-8 sm:p-12 bg-black/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
          {/* Subtle Background Inner Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-purple/10 blur-[80px] rounded-full pointer-events-none transition-all group-hover:bg-accent-purple/20" />

          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight mb-2 text-white uppercase text-center">
              Welcome Back
            </h1>
            <p className="text-zinc-400 text-sm font-medium text-center mb-10 tracking-wide">
              Connect your journey to start grooving
            </p>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-wider text-center">
                {error}
              </div>
            )}

            {/* Wallet Selection */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div
                onClick={() => setWallet('metamask')}
                className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all cursor-pointer ${wallet === 'metamask' ? 'bg-accent-purple/10 border-accent-purple shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                <div className={`${wallet === 'metamask' ? 'scale-110' : ''} transition-transform`}>
                  <MetaMaskIcon />
                </div>
                <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${wallet === 'metamask' ? 'text-white' : 'text-zinc-500'}`}>MetaMask</span>
              </div>
              <div
                onClick={() => setWallet('walletconnect')}
                className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all cursor-pointer ${wallet === 'walletconnect' ? 'bg-[#3B99FC]/10 border-[#3B99FC] shadow-[0_0_15px_rgba(59,153,252,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                <div className={`${wallet === 'walletconnect' ? 'scale-110' : ''} transition-transform`}>
                  <WalletConnectIcon />
                </div>
                <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${wallet === 'walletconnect' ? 'text-white' : 'text-zinc-500'}`}>WalletConnect</span>
              </div>
              <div
                onClick={() => setWallet('phantom')}
                className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all cursor-pointer ${wallet === 'phantom' ? 'bg-[#AB9FF2]/10 border-[#AB9FF2] shadow-[0_0_15px_rgba(171,159,242,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                <div className={`${wallet === 'phantom' ? 'scale-110' : ''} transition-transform`}>
                  <PhantomIcon />
                </div>
                <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors ${wallet === 'phantom' ? 'text-white' : 'text-zinc-500'}`}>Phantom</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button fullWidth onClick={handleConnectWallet} disabled={!wallet || loading}>
                {loading ? 'Authenticating...' : 'Connect Wallet'}
              </Button>

              <div className="relative flex items-center gap-4 py-4">
                <div className="flex-grow h-[1px] bg-white/5" />
                <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Or</span>
                <div className="flex-grow h-[1px] bg-white/5" />
              </div>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-all rounded-full py-4 group active:scale-[0.98]"
              >
                <GoogleIcon size={18} />
                <span className="text-white font-bold text-sm tracking-wide">Continue with Google</span>
              </button>
            </div>

            <p className="mt-10 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-loose">
              By connecting, you agree to our<br />
              <span className="text-zinc-400 cursor-pointer hover:text-white transition-colors">Terms of Service</span> & <span className="text-zinc-400 cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
