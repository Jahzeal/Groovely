'use client';

import { useState, useCallback } from 'react';
import { useConfig, useAccount } from 'wagmi';
import {
  approveUSDC,
  mintEdition,
  waitForTx,
  checkUSDCAllowance,
  checkUSDCBalance,
  parseUSDC,
} from '@/lib/contracts';
import { apiFetch } from '@/lib/api';

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

export function useMint({
  editionId,
  contractEditionId,
  mintPriceUsdc,
  trackId,
  onSuccess,
}: UseMintOptions) {
  const config = useConfig();
  const { address } = useAccount();

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

    setStep('checking');
    setErrorMessage(null);

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
      const msg =
        err?.shortMessage ||
        err?.message ||
        'Something went wrong during the purchase.';
      setErrorMessage(msg);
      setStep('error');
    }
  }, [address, config, contractEditionId, editionId, mintPriceUsdc, onSuccess]);

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
