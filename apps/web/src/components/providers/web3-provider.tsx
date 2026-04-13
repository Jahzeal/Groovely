'use client';

import { createConfig, http, WagmiProvider } from 'wagmi';
import { mainnet, polygonAmoy } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

// You can get a projectId from https://cloud.walletconnect.com/
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLECONNECT_PROJECT_ID';

const config = createConfig({
  chains: [polygonAmoy, mainnet],
  connectors: [
    injected(), // This will automatically discover MetaMask, Phantom, etc.
    walletConnect({ projectId: walletConnectProjectId }),
    coinbaseWallet({ appName: 'Groovely' }),
  ],
  transports: {
    [polygonAmoy.id]: http(),
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
