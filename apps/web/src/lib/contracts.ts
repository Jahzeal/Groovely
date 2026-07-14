import { writeContract, readContract, waitForTransactionReceipt } from '@wagmi/core';
import { parseUnits, formatUnits } from 'viem';
import type { Config } from 'wagmi';

// ─────────────────────────────────────────────────────────────────────────────
// Contract addresses (populated from env)
// ─────────────────────────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''
) as `0x${string}`;

export const USDC_ADDRESS = (
  process.env.NEXT_PUBLIC_USDC_ADDRESS ||
  '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' // Polygon mainnet USDC
) as `0x${string}`;

export const USDC_AMOY = '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' as `0x${string}`;

// ─────────────────────────────────────────────────────────────────────────────
// ABIs (minimal — only what we need from the frontend)
// ─────────────────────────────────────────────────────────────────────────────

export const GROOVELI_ABI = [
  // publishSong(string title, string metadataURI, tuple[] _contributors, string editionType, uint256 maxSupply, uint256 mintPrice, string editionMetadataURI)
  {
    name: 'publishSong',
    type: 'function' as const,
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      {
        name: '_contributors',
        type: 'tuple[]',
        components: [
          { name: 'wallet', type: 'address' },
          { name: 'basisPoints', type: 'uint96' },
        ],
      },
      { name: 'editionType', type: 'string' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'mintPrice', type: 'uint256' },
      { name: 'editionMetadataURI', type: 'string' },
    ],
    outputs: [
      { name: 'songId', type: 'uint256' },
      { name: 'editionId', type: 'uint256' },
    ],
  },
  // mint(uint256 editionId, uint256 amount)
  {
    name: 'mint',
    type: 'function' as const,
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'editionId', type: 'uint256' },
      { name: 'amount',    type: 'uint256' },
    ],
    outputs: [],
  },
  // getEdition(uint256 editionId) → Edition
  {
    name: 'getEdition',
    type: 'function' as const,
    stateMutability: 'view',
    inputs: [{ name: 'editionId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'editionId',    type: 'uint256' },
          { name: 'songId',       type: 'uint256' },
          { name: 'maxSupply',    type: 'uint256' },
          { name: 'mintedSupply', type: 'uint256' },
          { name: 'mintPrice',    type: 'uint256' },
          { name: 'unlimited',    type: 'bool'    },
          { name: 'active',       type: 'bool'    },
          { name: 'editionType',  type: 'string'  },
        ],
      },
    ],
  },
  // remainingSupply(uint256 editionId) → uint256
  {
    name: 'remainingSupply',
    type: 'function' as const,
    stateMutability: 'view',
    inputs: [{ name: 'editionId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // createSong(string title, string metadataURI, address creator)
  {
    name: 'createSong',
    type: 'function' as const,
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'creator', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // setContributors(uint256 songId, tuple[] contributors)
  {
    name: 'setContributors',
    type: 'function' as const,
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'songId', type: 'uint256' },
      {
        name: '_contributors',
        type: 'tuple[]',
        components: [
          { name: 'wallet', type: 'address' },
          { name: 'basisPoints', type: 'uint96' },
        ],
      },
    ],
    outputs: [],
  },
  // createEdition(uint256 songId, string editionType, uint256 maxSupply, uint256 mintPrice, string metadataURI)
  {
    name: 'createEdition',
    type: 'function' as const,
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'songId', type: 'uint256' },
      { name: 'editionType', type: 'string' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'mintPrice', type: 'uint256' },
      { name: 'metadataURI', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function' as const,
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function' as const,
    stateMutability: 'view',
    inputs: [
      { name: 'owner',   type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function' as const,
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert USDC amount (6 decimals) to human-readable string */
export const formatUSDC = (raw: bigint): string =>
  parseFloat(formatUnits(raw, 6)).toFixed(2);

/** Convert human-readable USDC to raw bigint (6 decimals) */
export const parseUSDC = (amount: number): bigint =>
  parseUnits(amount.toString(), 6);

/** Check how much USDC the user has approved for the Grooveli contract */
export async function checkUSDCAllowance(
  config: Config,
  owner: `0x${string}`,
): Promise<bigint> {
  return readContract(config, {
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [owner, CONTRACT_ADDRESS],
  }) as Promise<bigint>;
}

/** Check user's USDC balance */
export async function checkUSDCBalance(
  config: Config,
  owner: `0x${string}`,
): Promise<bigint> {
  return readContract(config, {
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [owner],
  }) as Promise<bigint>;
}

/** Approve USDC spend. Returns tx hash. */
export async function approveUSDC(
  config: Config,
  amount: bigint,
): Promise<`0x${string}`> {
  return writeContract(config, {
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [CONTRACT_ADDRESS, amount],
  });
}

/** Call GrooveliMusic1155.mint(). Returns tx hash. */
export async function mintEdition(
  config: Config,
  editionId: number,
  amount = 1,
): Promise<`0x${string}`> {
  return writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: GROOVELI_ABI,
    functionName: 'mint',
    args: [BigInt(editionId), BigInt(amount)],
  });
}

/** Create a song on-chain. Returns tx hash. */
export async function createSongOnChain(
  config: Config,
  title: string,
  metadataUri: string,
  creatorAddress: `0x${string}`,
): Promise<`0x${string}`> {
  return writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: GROOVELI_ABI,
    functionName: 'createSong',
    args: [title, metadataUri, creatorAddress],
  });
}

/** Set contributors on-chain. Returns tx hash. */
export async function setContributorsOnChain(
  config: Config,
  songId: number,
  contributors: { wallet: `0x${string}`; basisPoints: bigint }[],
): Promise<`0x${string}`> {
  return writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: GROOVELI_ABI,
    functionName: 'setContributors',
    args: [BigInt(songId), contributors],
  });
}

/** Create an edition on-chain. Returns tx hash. */
export async function createEditionOnChain(
  config: Config,
  songId: number,
  editionType: string,
  maxSupply: number,
  mintPriceUsdc: number,
  metadataUri = '',
): Promise<`0x${string}`> {
  return writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: GROOVELI_ABI,
    functionName: 'createEdition',
    args: [BigInt(songId), editionType, BigInt(maxSupply), parseUSDC(mintPriceUsdc), metadataUri],
  });
}

/** Publish a song on-chain (registers track, splits, and edition in one call). Returns tx hash. */
export async function publishSongOnChain(
  config: Config,
  title: string,
  metadataUri: string,
  contributors: { wallet: `0x${string}`; basisPoints: bigint }[],
  editionType: string,
  maxSupply: number,
  mintPriceUsdc: number,
  editionMetadataUri = ''
): Promise<`0x${string}`> {
  return writeContract(config, {
    address: CONTRACT_ADDRESS,
    abi: GROOVELI_ABI,
    functionName: 'publishSong',
    args: [
      title,
      metadataUri,
      contributors,
      editionType,
      BigInt(maxSupply),
      parseUSDC(mintPriceUsdc),
      editionMetadataUri
    ],
  });
}

/** Wait for a transaction to be confirmed and return the receipt */
export async function waitForTx(config: Config, hash: `0x${string}`) {
  return waitForTransactionReceipt(config, { hash });
}

export const POLYGONSCAN_BASE =
  process.env.NEXT_PUBLIC_CHAIN_ID === '137'
    ? 'https://polygonscan.com/tx/'
    : 'https://amoy.polygonscan.com/tx/';
