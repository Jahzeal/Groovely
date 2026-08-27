'use client';

import { useState, useCallback } from 'react';
import { useConfig, useAccount, useSwitchChain } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import {
  approveUSDC,
  mintEdition,
  waitForTx,
  checkUSDCAllowance,
  checkUSDCBalance,
  parseUSDC,
  GROOVELI_ABI,
  ERC20_ABI,
  CONTRACT_ADDRESS,
  USDC_ADDRESS,
} from '@/lib/contracts';
import { apiFetch } from '@/lib/api';
import { useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from '@zerodev/sdk';
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator';
import { KERNEL_V3_1 } from '@zerodev/sdk/constants';

const isMainnet = process.env.NEXT_PUBLIC_CHAIN_ID === '137';

const customAmoy = {
  ...polygonAmoy,
  rpcUrls: {
    ...polygonAmoy.rpcUrls,
    default: {
      http: ['https://polygon-amoy-bor-rpc.publicnode.com'],
    },
  },
};

const targetChain = isMainnet ? polygon : customAmoy;
const targetRpcUrl = isMainnet
  ? 'https://polygon-bor-rpc.publicnode.com'
  : 'https://polygon-amoy-bor-rpc.publicnode.com';
const targetChainName = isMainnet ? 'Polygon Mainnet' : 'Polygon Amoy Testnet';

export type MintStep =
  | 'idle'
  | 'checking'
  | 'approving'
  | 'approved'
  | 'minting'
  | 'confirming'
  | 'success'
  | 'error';

export interface MintResult {
  txHash: string;
  tokenId: number;
}

export interface UseMintOptions {
  editionId: number;         // DB edition ID
  contractEditionId: number; // On-chain token ID
  mintPriceUsdc: number;     // Human-readable USDC price (e.g. 10.00)
  trackId: number;
  onSuccess?: (result: MintResult) => void;
}

function parseMintError(err: any, mintPriceUsdc: number): string {
  const msg = err?.shortMessage || err?.details || err?.message || '';
  const lower = msg.toLowerCase();

  if (lower.includes('user rejected') || lower.includes('user denied') || lower.includes('action rejected') || lower.includes('userrejected')) {
    return 'Transaction was cancelled in your wallet.';
  }

  if (lower.includes('exceeds allowance') || lower.includes('allowance')) {
    return 'USDC token approval was not granted or was insufficient. Please approve the USDC transaction in your wallet when prompted.';
  }

  if (lower.includes('insufficient funds for gas') || lower.includes('insufficient funds for intrinsic') || (lower.includes('insufficient funds') && !lower.includes('usdc'))) {
    return 'Insufficient POL in your wallet to cover Polygon network gas fees (~0.02 POL required).';
  }

  if (lower.includes('insufficient usdc') || lower.includes('exceeds balance') || lower.includes('transfer amount exceeds balance')) {
    const formattedPrice = typeof mintPriceUsdc === 'number' ? mintPriceUsdc.toFixed(2) : mintPriceUsdc;
    return `Insufficient USDC balance. You need at least $${formattedPrice} USDC in your wallet to purchase this edition.`;
  }

  if (lower.includes('json is not a valid request object') || lower.includes('failed to fetch') || lower.includes('network error') || lower.includes('400')) {
    return 'RPC network connection error. Please ensure your wallet is connected to Polygon Mainnet and try again.';
  }

  return msg.replace(/^ContractFunctionExecutionError:\s*/i, '').replace(/^Error:\s*/i, '') || 'Something went wrong during the purchase. Please try again.';
}

export function useMint({
  editionId,
  contractEditionId,
  mintPriceUsdc,
  trackId,
  onSuccess,
}: UseMintOptions) {
  const config = useConfig();
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { wallets } = useWallets();

  const [step, setStep] = useState<MintStep>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);

  const reset = useCallback(() => {
    setStep('idle');
    setErrorMessage(null);
    setTxHash(null);
    setTokenId(null);
  }, []);

  const executeMint = useCallback(async () => {
    if (!address) {
      setErrorMessage('Please connect your wallet first.');
      setStep('error');
      return;
    }
    if (!contractEditionId) {
      setErrorMessage('This edition is not yet available on-chain.');
      setStep('error');
      return;
    }

    const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');

    if (embeddedWallet) {
      setStep('checking');
      setErrorMessage(null);

      // Enforce correct network
      const requiredChainId = targetChain.id;
      if (embeddedWallet.chainId !== `eip155:${requiredChainId}`) {
        try {
          await embeddedWallet.switchChain(requiredChainId);
        } catch (err: any) {
          console.error('Failed to switch chain:', err);
          setErrorMessage(`Please switch your wallet network to ${targetChainName}.`);
          setStep('error');
          return;
        }
      }

      try {
        const priceRaw = parseUSDC(mintPriceUsdc);

        // 1. Get raw provider from Privy embedded wallet
        const rawProvider = await embeddedWallet.getEthereumProvider();

        // 2. Initialize ZeroDev smart account and client
        const publicClient = createPublicClient({
          chain: targetChain,
          transport: http(targetRpcUrl),
        });

        const entryPointAddress = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';

        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
          signer: rawProvider as any,
          entryPoint: {
            address: entryPointAddress,
            version: '0.7',
          },
          kernelVersion: KERNEL_V3_1,
        });

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

        const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID || '';

        const kernelClient = (createKernelAccountClient as any)({
          account,
          chain: targetChain,
          bundlerTransport: http(`https://rpc.zerodev.app/api/v2/bundler/${projectId}`),
          middleware: {
            sponsorUserOperation: async ({ userOperation }: any) => {
              const zerodevPaymaster = (createZeroDevPaymasterClient as any)({
                chain: targetChain,
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

        // 3. Check USDC balance (check both Smart Account and Privy EOA address)
        const smartBalance = await checkUSDCBalance(config, account.address);
        const eoaBalance = await checkUSDCBalance(config, address);

        if (smartBalance < priceRaw && eoaBalance < priceRaw) {
          throw new Error(
            `Insufficient USDC balance in wallet ${address.slice(0, 6)}…${address.slice(-4)}. You need ${mintPriceUsdc} USDC but have ${(Number(eoaBalance) / 1e6).toFixed(2)} USDC.`
          );
        }

        // If user deposited USDC in their primary Privy wallet address (EOA), execute directly via EOA
        if (smartBalance < priceRaw && eoaBalance >= priceRaw) {
          console.log(`[useMint] USDC found in primary wallet (${address}), completing purchase directly.`);
          
          const allowance = await checkUSDCAllowance(config, address);
          if (allowance < priceRaw) {
            setStep('approving');
            const approveTx = await approveUSDC(config, priceRaw);
            await waitForTx(config, approveTx);
          }

          setStep('approved');

          setStep('minting');
          const mintTx = await mintEdition(config, contractEditionId, 1);
          setTxHash(mintTx);

          setStep('confirming');
          const receipt = await waitForTx(config, mintTx);

          let derivedTokenId = contractEditionId;
          try {
            const transferLog = receipt.logs.find(
              (log) => log.topics[0] === '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'
            );
            if (transferLog && transferLog.topics[3]) {
              derivedTokenId = parseInt(transferLog.topics[3], 16);
            }
          } catch (_) {}

          setTokenId(derivedTokenId);

          await apiFetch('/api/mint/confirm', {
            method: 'POST',
            body: JSON.stringify({
              edition_id: editionId,
              tx_hash: mintTx,
              token_id: derivedTokenId,
              buyer_wallet: address,
              license_type: 'standard',
            }),
          });

          setStep('success');
          onSuccess?.({ txHash: mintTx, tokenId: derivedTokenId });
          return;
        }

        // 4. Batch Approve + Mint
        setStep('approving');
        
        const approveCallData = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS, priceRaw],
        });

        const mintCallData = encodeFunctionData({
          abi: GROOVELI_ABI,
          functionName: 'mint',
          args: [BigInt(contractEditionId), BigInt(1)],
        });

        setStep('minting');
        const txHash = await kernelClient.sendTransaction({
          calls: [
            {
              to: USDC_ADDRESS,
              value: 0n,
              data: approveCallData,
            },
            {
              to: CONTRACT_ADDRESS,
              value: 0n,
              data: mintCallData,
            },
          ],
        });

        setTxHash(txHash);
        setStep('confirming');

        // Wait for confirmation
        const receipt = await waitForTx(config, txHash);

        // Derive token ID from receipt logs
        let derivedTokenId = contractEditionId;
        try {
          const transferLog = receipt.logs.find(
            (log) => log.topics[0] === '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'
          );
          if (transferLog && transferLog.topics[3]) {
            derivedTokenId = parseInt(transferLog.topics[3], 16);
          }
        } catch (_) {
          // fallback
        }

        setTokenId(derivedTokenId);

        // 5. Confirm with backend
        await apiFetch('/api/mint/confirm', {
          method: 'POST',
          body: JSON.stringify({
            edition_id: editionId,
            tx_hash: txHash,
            token_id: derivedTokenId,
            buyer_wallet: account.address,
            license_type: 'standard',
          }),
        });

        setStep('success');
        onSuccess?.({ txHash, tokenId: derivedTokenId });

      } catch (err: any) {
        console.error('Smart account mint error:', err);
        setErrorMessage(parseMintError(err, mintPriceUsdc));
        setStep('error');
      }
      return;
    }

    setStep('checking');
    setErrorMessage(null);

    // Enforce correct network
    const requiredChainId = targetChain.id;
    if (chain?.id !== requiredChainId) {
      try {
        await switchChainAsync({ chainId: requiredChainId });
      } catch (err: any) {
        console.error('Failed to switch chain:', err);
        setErrorMessage(`Please switch your wallet network to ${targetChainName}.`);
        setStep('error');
        return;
      }
    }

    try {
      const priceRaw = parseUSDC(mintPriceUsdc);

      // ── Step 1: Check USDC balance ─────────────────────────────────────
      const balance = await checkUSDCBalance(config, address);
      if (balance < priceRaw) {
        throw new Error(
          `Insufficient USDC balance. You need ${mintPriceUsdc} USDC but have ${(Number(balance) / 1e6).toFixed(2)} USDC.`
        );
      }

      // ── Step 2: Check / Request USDC approval ──────────────────────────
      const allowance = await checkUSDCAllowance(config, address);
      if (allowance < priceRaw) {
        setStep('approving');
        const approveTx = await approveUSDC(config, priceRaw);
        await waitForTx(config, approveTx);
      }

      setStep('approved');

      // ── Step 3: Mint on-chain ──────────────────────────────────────────
      setStep('minting');
      const mintTx = await mintEdition(config, contractEditionId, 1);
      setTxHash(mintTx);

      // ── Step 4: Wait for confirmation ──────────────────────────────────
      setStep('confirming');
      const receipt = await waitForTx(config, mintTx);

      // Derive token ID from receipt logs (first Transfer event topic[3])
      // For ERC-1155 the TransferSingle event: (operator, from, to, id, value)
      let derivedTokenId = contractEditionId;
      try {
        const transferLog = receipt.logs.find(
          (log) => log.topics[0] === '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62'
        );
        if (transferLog && transferLog.topics[3]) {
          derivedTokenId = parseInt(transferLog.topics[3], 16);
        }
      } catch (_) {
        // fallback to contractEditionId
      }

      setTokenId(derivedTokenId);

      // ── Step 5: Confirm with backend ───────────────────────────────────
      await apiFetch('/api/mint/confirm', {
        method: 'POST',
        body: JSON.stringify({
          edition_id: editionId,
          tx_hash: mintTx,
          token_id: derivedTokenId,
          buyer_wallet: address,
          license_type: 'standard',
        }),
      });

      setStep('success');
      onSuccess?.({ txHash: mintTx, tokenId: derivedTokenId });

    } catch (err: any) {
      console.error('Mint error:', err);
      setErrorMessage(parseMintError(err, mintPriceUsdc));
      setStep('error');
    }
  }, [address, config, contractEditionId, editionId, mintPriceUsdc, onSuccess, wallets]);

  return {
    step,
    txHash,
    tokenId,
    errorMessage,
    executeMint,
    reset,
    isLoading: ['checking', 'approving', 'minting', 'confirming'].includes(step),
    isSuccess: step === 'success',
    isError: step === 'error',
  };
}
