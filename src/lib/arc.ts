// Arc/Circle Web3 Services Integration
// Testnet configuration

const CIRCLE_API_KEY = "TEST_API_KEY:847c9d059b7160503c79b730da310e37:7388474fcdd2440cac4e73ebade48ccb";
const CIRCLE_API_BASE = "https://api.circle.com/v1/w3s";

// ─── Exchange Rates (live from open API) ─────────────────────────────────────

export async function getExchangeRate(currency: string): Promise<number> {
  try {
    // Use open exchange rates - USD as base
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
    const data = await res.json();
    return data.rates[currency] ?? 1;
  } catch {
    // Fallback rates if API fails
    const fallback: Record<string, number> = {
      NGN: 1580, GHS: 15.2, KES: 129, UGX: 3750, TZS: 2650, ZWL: 360,
    };
    return fallback[currency] ?? 1;
  }
}

export function usdcToLocal(usdc: number, rate: number): number {
  return usdc * rate;
}

export function localToUsdc(localAmount: number, rate: number): number {
  return localAmount / rate;
}

export function formatUsdc(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(amount);
}

// ─── Circle Wallet ────────────────────────────────────────────────────────────

async function circleRequest(endpoint: string, method = "GET", body?: any) {
  const res = await fetch(`${CIRCLE_API_BASE}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${CIRCLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function createUserWallet(userId: string) {
  // Create a Circle user and wallet for this Privy user
  try {
    // 1. Create user
    const userRes = await circleRequest("/users", "POST", {
      userId,
    });

    if (!userRes.data) throw new Error("Failed to create Circle user");

    // 2. Get user token for wallet creation
    const tokenRes = await circleRequest(`/users/token`, "POST", {
      userId,
    });

    return {
      userId,
      userToken: tokenRes.data?.userToken,
      encryptionKey: tokenRes.data?.encryptionKey,
    };
  } catch (e) {
    console.error("Circle wallet creation error:", e);
    throw e;
  }
}

export async function getUserWalletBalance(walletId: string): Promise<number> {
  try {
    const res = await circleRequest(`/wallets/${walletId}/balances`);
    const usdcBalance = res.data?.tokenBalances?.find(
      (b: any) => b.token?.symbol === "USDC"
    );
    return parseFloat(usdcBalance?.amount ?? "0");
  } catch {
    return 0;
  }
}

export async function getWalletAddress(walletId: string): Promise<string> {
  try {
    const res = await circleRequest(`/wallets/${walletId}`);
    return res.data?.address ?? "";
  } catch {
    return "";
  }
}

// ─── USDC Transfer on Arc ─────────────────────────────────────────────────────

export async function transferUsdc(
  fromWalletId: string,
  toAddress: string,
  amount: number, // in USDC
  userToken: string
) {
  try {
    const res = await circleRequest("/user/transactions/transfer", "POST", {
      userToken,
      walletId: fromWalletId,
      tokenId: "USDC",
      destinationAddress: toAddress,
      amounts: [amount.toFixed(6)],
      fee: {
        type: "level",
        config: { feeLevel: "MEDIUM" },
      },
    });
    return res.data;
  } catch (e) {
    console.error("USDC transfer error:", e);
    throw e;
  }
}
