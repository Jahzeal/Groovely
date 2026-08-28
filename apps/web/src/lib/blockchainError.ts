import { formatUnits } from 'viem';

export interface FormattedError {
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isGasShortage?: boolean;
}

/**
 * Parses raw EVM, wagmi, viem, and RPC errors into clean, human-friendly messages with actionable next steps.
 */
export function formatBlockchainError(err: any, context?: { action?: 'mint' | 'publish' | 'approve'; requiredUsdc?: number }): FormattedError {
  if (!err) {
    return {
      title: 'Transaction Failed',
      message: 'An unexpected error occurred. Please try again.',
    };
  }

  const rawMsg = err?.shortMessage || err?.details || err?.message || (typeof err === 'string' ? err : '');
  const lower = rawMsg.toLowerCase();

  // 1. User Rejected / Cancelled Transaction
  if (
    lower.includes('user rejected') ||
    lower.includes('user denied') ||
    lower.includes('action rejected') ||
    lower.includes('userrejected') ||
    lower.includes('transaction rejected')
  ) {
    return {
      title: 'Transaction Cancelled',
      message: 'You cancelled or rejected the transaction in your wallet.',
    };
  }

  // 2. Insufficient Native Gas Funds (POL / MATIC / ETH)
  if (
    lower.includes('insufficient funds for gas') ||
    lower.includes('gas * price + value') ||
    lower.includes('overshot') ||
    lower.includes('insufficient funds for intrinsic') ||
    (lower.includes('insufficient funds') && !lower.includes('usdc'))
  ) {
    // Try to extract human-readable numbers if present in the raw error
    let balancePol = '';
    let costPol = '';
    
    const balanceMatch = rawMsg.match(/balance\s+(\d+)/i);
    const costMatch = rawMsg.match(/tx cost\s+(\d+)/i);

    if (balanceMatch && balanceMatch[1]) {
      try {
        const balNum = parseFloat(formatUnits(BigInt(balanceMatch[1]), 18));
        balancePol = ` (Balance: ${balNum.toFixed(4)} POL)`;
      } catch (_) {}
    }

    if (costMatch && costMatch[1]) {
      try {
        const costNum = parseFloat(formatUnits(BigInt(costMatch[1]), 18));
        costPol = `~${costNum.toFixed(4)} POL`;
      } catch (_) {}
    }

    const networkName = process.env.NEXT_PUBLIC_CHAIN_ID === '137' ? 'Polygon Mainnet' : 'Polygon Amoy Testnet';
    const faucetUrl = 'https://faucet.polygon.technology/';

    return {
      title: 'Insufficient POL for Gas Fee',
      message: `Your wallet doesn't have enough POL${balancePol} to cover the network gas fee${costPol ? ` of ${costPol}` : ''} on ${networkName}. Please fund your wallet with POL to continue.`,
      actionUrl: process.env.NEXT_PUBLIC_CHAIN_ID === '137' ? undefined : faucetUrl,
      actionLabel: process.env.NEXT_PUBLIC_CHAIN_ID === '137' ? undefined : 'Get Free Testnet POL (Faucet) ↗',
      isGasShortage: true,
    };
  }

  // 3. Insufficient USDC Balance
  if (
    lower.includes('exceeds balance') ||
    lower.includes('transfer amount exceeds balance') ||
    lower.includes('insufficient usdc') ||
    lower.includes('erc20: transfer amount exceeds balance')
  ) {
    const requiredAmount = context?.requiredUsdc ? `$${context.requiredUsdc.toFixed(2)} USDC` : 'USDC';
    return {
      title: 'Insufficient USDC Balance',
      message: `Your wallet does not have enough USDC to pay the required fee (${requiredAmount}). Please get or deposit USDC and try again.`,
    };
  }

  // 4. Token Allowance / Approval Error
  if (
    lower.includes('exceeds allowance') ||
    lower.includes('erc20: insufficient allowance') ||
    lower.includes('allowance')
  ) {
    return {
      title: 'USDC Approval Required',
      message: 'USDC allowance was not granted. Please confirm the token approval transaction in your wallet when prompted.',
    };
  }

  // 5. RPC / Network Connection Error
  if (
    lower.includes('json is not a valid request object') ||
    lower.includes('failed to fetch') ||
    lower.includes('network error') ||
    lower.includes('timeout') ||
    lower.includes('connection refused')
  ) {
    return {
      title: 'Network Connection Issue',
      message: 'Unable to connect to the Polygon RPC node. Please verify your internet connection or switch network and try again.',
    };
  }

  // 6. Generic Cleaned Message
  const cleaned = rawMsg
    .replace(/^ContractFunctionExecutionError:\s*/i, '')
    .replace(/^Error:\s*/i, '')
    .replace(/Details:.*$/i, '')
    .replace(/Version:.*$/i, '')
    .trim();

  return {
    title: 'Transaction Failed',
    message: cleaned && cleaned.length < 150 ? cleaned : 'The blockchain transaction could not be completed. Please check your wallet and try again.',
  };
}
