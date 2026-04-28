'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { WalletCard } from '@/components/onboarding/WalletCard';
import { MetaMaskIcon, WalletConnectIcon, PhantomIcon } from '@/components/onboarding/OnboardingFlow';
import { Google as GoogleIcon } from '@/components/ui/SocialIcons';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<'metamask' | 'walletconnect' | 'phantom' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const handleConnectWallet = async () => {
    if (!wallet) return;
    setLoading(true);
    setError(null);
    try {
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

      if (!walletAddr) throw new Error('Could not determine wallet address');

      // 3. Fetch Nonce
      const nonceRes = await fetch(`/api/auth/nonce/${walletAddr}`);
      if (!nonceRes.ok) throw new Error('Failed to fetch nonce');
      const { message } = await nonceRes.json();

      // 4. Sign
      const signature = await signMessageAsync({ message });

      // 5. Connect Backend
      const connectRes = await fetch(`https://groovely-github-repo.onrender.com/api/auth/login/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: walletAddr, signature }),
      });

      const authData = await connectRes.json();
      if (!connectRes.ok) throw new Error(authData.error || authData.message || 'Authentication failed');

      // 6. Store JWT — response shape: { success, data: { token, user: { id, wallet, role } } }
      const { token, user } = authData.data;
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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://groovely-f7i7.onrender.com';
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
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
              </div>
              <div
                onClick={() => setWallet('walletconnect')}
                className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all cursor-pointer ${wallet === 'walletconnect' ? 'bg-[#3B99FC]/10 border-[#3B99FC] shadow-[0_0_15px_rgba(59,153,252,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                <div className={`${wallet === 'walletconnect' ? 'scale-110' : ''} transition-transform`}>
                  <WalletConnectIcon />
                </div>
              </div>
              <div
                onClick={() => setWallet('phantom')}
                className={`flex flex-col items-center justify-center aspect-square rounded-2xl border transition-all cursor-pointer ${wallet === 'phantom' ? 'bg-[#AB9FF2]/10 border-[#AB9FF2] shadow-[0_0_15px_rgba(171,159,242,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                <div className={`${wallet === 'phantom' ? 'scale-110' : ''} transition-transform`}>
                  <PhantomIcon />
                </div>
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
