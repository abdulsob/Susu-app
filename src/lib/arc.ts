import { createPublicClient, http, formatUnits } from "viem";

// Arc Testnet configuration
const ARC_TESTNET_RPC = "https://rpc.arc.io/testnet";
const ARC_CHAIN_ID = 5042002;

// USDC on Arc Testnet - ERC20 interface address
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

// USDC ERC20 ABI - minimal
const USDC_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

// Arc testnet chain definition for viem
const arcTestnet = {
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: [ARC_TESTNET_RPC] },
    public: { http: [ARC_TESTNET_RPC] },
  },
};

// Create public client for Arc testnet
const arcClient = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_TESTNET_RPC),
});

// ── Get USDC balance from Arc testnet ────────────────────────────────────────
export async function getArcUsdcBalance(walletAddress: string): Promise<number> {
  try {
    // Try ERC20 interface first (6 decimals)
    const balance = await arcClient.readContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [walletAddress as `0x${string}`],
    });

    // USDC ERC20 on Arc uses 6 decimals
    return parseFloat(formatUnits(balance, 6));
  } catch (err) {
    console.error("Error reading USDC balance from Arc:", err);
    // Fallback: try native balance (18 decimals)
    try {
      const nativeBalance = await arcClient.getBalance({
        address: walletAddress as `0x${string}`,
      });
      return parseFloat(formatUnits(nativeBalance, 18));
    } catch (err2) {
      console.error("Error reading native balance:", err2);
      return 0;
    }
  }
}

// ── Exchange rates (local currency per 1 USDC) ───────────────────────────────
const EXCHANGE_RATES: Record<string, number> = {
  NGN: 1580,
  GHS: 15.2,
  KES: 129,
  ZWL: 360,
  UGX: 3780,
  TZS: 2680,
  USD: 1,
};

export async function getExchangeRate(currencyCode: string): Promise<number> {
  return EXCHANGE_RATES[currencyCode] ?? 1;
}

export function usdcToLocal(usdc: number, rate: number): number {
  return usdc * rate;
}

export function localToUsdc(local: number, rate: number): number {
  return local / rate;
}

export function formatUsdc(amount: number): string {
  return amount.toFixed(2);
}

export function formatLocal(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
