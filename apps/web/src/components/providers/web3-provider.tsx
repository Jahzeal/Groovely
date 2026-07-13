'use client';

import { createConfig } from '@privy-io/wagmi';
import { mainnet, polygonAmoy } from 'wagmi/chains';
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, useEmbeddedSmartAccountConnector } from '@privy-io/wagmi';
import { createPublicClient } from 'viem';
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk';
import { KernelEIP1193Provider } from '@zerodev/sdk/providers';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { KERNEL_V3_1 } from '@zerodev/sdk/constants';

const config = createConfig({
  chains: [polygonAmoy, mainnet],
  transports: {
    [polygonAmoy.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

// A wrapper component that hooks up Privy's embedded wallet with ZeroDev's Kernel Smart Account
function SmartAccountConnectorWrapper({ children }: { children: ReactNode }) {
  useEmbeddedSmartAccountConnector({
    getSmartAccountFromSigner: (async ({ signer }: any) => {
      console.log('[ZeroDev] ✅ getSmartAccountFromSigner called. Signer:', signer);
      try {
        const publicClient = createPublicClient({
          chain: polygonAmoy,
          transport: http(),
        });
        console.log('[ZeroDev] ✅ Public client created.');

        const entryPointAddress = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';

        // 1. Create ECDSA validator using the Privy signer
        console.log('[ZeroDev] ⏳ Creating ECDSA validator...');
        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
          signer,
          entryPoint: {
            address: entryPointAddress,
            version: '0.7',
          },
          kernelVersion: KERNEL_V3_1,
        });
        console.log('[ZeroDev] ✅ ECDSA validator created.');

        // 2. Create Kernel Account
        console.log('[ZeroDev] ⏳ Creating Kernel account...');
        const account = await createKernelAccount(publicClient, {
          plugins: {
            sudo: ecdsaValidator,
          },
          entryPoint: {
            address: entryPointAddress,
            version: '0.7',
          },
          kernelVersion: KERNEL_V3_1,
        });
        console.log('[ZeroDev] ✅ Kernel account created. Address:', account.address);

        // 3. Create Kernel Account Client
        const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || '';
        console.log('[ZeroDev] ⏳ Creating Kernel account client. ProjectId:', projectId ? '✅ set' : '❌ MISSING');
        const kernelClient = (createKernelAccountClient as any)({
          account,
          chain: polygonAmoy,
          bundlerTransport: http(`https://rpc.zerodev.app/api/v2/bundler/${projectId}`),
          middleware: {
            sponsorUserOperation: async ({ userOperation }: any) => {
              const zerodevPaymaster = (createZeroDevPaymasterClient as any)({
                chain: polygonAmoy,
                entryPoint: {
                  address: entryPointAddress,
                  version: '0.7',
                },
                transport: http(`https://rpc.zerodev.app/api/v2/paymaster/${projectId}`),
              });
              
              return (zerodevPaymaster as any).sponsorUserOperation({
                userOperation,
                entryPoint: {
                  address: entryPointAddress,
                  version: '0.7',
                },
              });
            },
          },
        });
        console.log('[ZeroDev] ✅ Kernel account client created.');

        // 4. Return EIP-1193 provider wrapping the kernel client
        const provider = new KernelEIP1193Provider(kernelClient) as any;
        console.log('[ZeroDev] ✅ KernelEIP1193Provider created. Smart wallet ready!');
        return provider;
      } catch (err: any) {
        console.error('[ZeroDev] ❌ Smart account creation FAILED:', err?.message || err);
        console.error('[ZeroDev] ❌ Full error:', err);
        throw err;
      }
    }) as any,
  });

  return <>{children}</>;
}


function EnvSetupGuide({
  privyAppId,
  zeroDevProjectId,
}: {
  privyAppId: string;
  zeroDevProjectId: string;
}) {
  const [copied, setCopied] = useState(false);

  const isPrivyValid = privyAppId && privyAppId !== 'your_privy_app_id_here' && privyAppId.trim() !== '';
  const isZeroDevValid = zeroDevProjectId && zeroDevProjectId !== 'your_zerodev_project_id_here' && zeroDevProjectId.trim() !== '';

  const envTemplate = `# Auth / Privy Setup
NEXT_PUBLIC_PRIVY_APP_ID=${isPrivyValid ? privyAppId : 'your_actual_privy_app_id'}

# ZeroDev Setup
NEXT_PUBLIC_ZERODEV_PROJECT_ID=${isZeroDevValid ? zeroDevProjectId : 'your_actual_zerodev_project_id'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6 text-white font-sans selection:bg-purple-500/30 selection:text-white">
      <div className="max-w-3xl w-full glass-card p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <span className="text-xs font-bold tracking-widest uppercase bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
              Configuration Required
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Configure Your <span className="text-gradient-purple font-extrabold">Groovely</span> Web3 Stack
          </h1>
          <p className="text-neutral-400 text-lg mb-8 max-w-2xl">
            Groovely uses <span className="text-white font-semibold">Privy</span> for social login/auth and <span className="text-white font-semibold">ZeroDev</span> for gasless smart accounts. To start the application, you need to configure these providers in your <code className="text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/30 font-mono text-sm">apps/web/.env.local</code> file.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Privy Setup Card */}
            <div className={`p-6 rounded-2xl border ${isPrivyValid ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-neutral-800 bg-neutral-900/40'} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-white">1. Privy Auth App ID</h3>
                  {isPrivyValid ? (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Configured</span>
                  ) : (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">Action Needed</span>
                  )}
                </div>
                <ul className="text-sm text-neutral-400 space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Sign up at <a href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline">dashboard.privy.io</a></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Create a new application named <strong>Groovely</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Copy the <strong>App ID</strong> from App Settings</span>
                  </li>
                </ul>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Current Value</label>
                <div className="font-mono text-xs p-2.5 rounded-lg bg-black/40 border border-neutral-800 overflow-x-auto text-neutral-300">
                  {privyAppId || <span className="text-neutral-600 italic">None</span>}
                </div>
              </div>
            </div>

            {/* ZeroDev Setup Card */}
            <div className={`p-6 rounded-2xl border ${isZeroDevValid ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-neutral-800 bg-neutral-900/40'} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-white">2. ZeroDev Project ID</h3>
                  {isZeroDevValid ? (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Configured</span>
                  ) : (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-medium">Action Needed</span>
                  )}
                </div>
                <ul className="text-sm text-neutral-400 space-y-2 mb-6">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Sign up at <a href="https://dashboard.zerodev.app" target="_blank" rel="noopener noreferrer" className="text-purple-300 hover:text-purple-200 underline">dashboard.zerodev.app</a></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Create a project (Polygon Amoy, v0.7)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-2">•</span>
                    <span>Copy the <strong>Project ID</strong> from settings</span>
                  </li>
                </ul>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Current Value</label>
                <div className="font-mono text-xs p-2.5 rounded-lg bg-black/40 border border-neutral-800 overflow-x-auto text-neutral-300">
                  {zeroDevProjectId || <span className="text-neutral-600 italic">None</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-black/30 p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-neutral-300">Env snippet for apps/web/.env.local:</span>
              <button
                onClick={copyToClipboard}
                className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer border border-neutral-700 flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    <span>Copy Config</span>
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-xs p-4 rounded-xl bg-neutral-950/60 border border-neutral-900 overflow-x-auto text-neutral-300">
              {envTemplate}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-900">
            <div className="flex items-center space-x-2 text-amber-400">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium">After saving `.env.local`, restart your Next.js development server to apply the changes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
  const zeroDevProjectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || '';

  const isPrivyValid = privyAppId && privyAppId !== 'your_privy_app_id_here' && privyAppId.trim() !== '';
  const isZeroDevValid = zeroDevProjectId && zeroDevProjectId !== 'your_zerodev_project_id_here' && zeroDevProjectId.trim() !== '';

  if (!mounted) {
    return <div className="min-h-screen bg-[#050510]" />;
  }

  if (!isPrivyValid || !isZeroDevValid) {
    return <EnvSetupGuide privyAppId={privyAppId} zeroDevProjectId={zeroDevProjectId} />;
  }

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#8B5CF6', // Accent purple matching Groovely theme
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <SmartAccountConnectorWrapper>
            {children}
          </SmartAccountConnectorWrapper>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
