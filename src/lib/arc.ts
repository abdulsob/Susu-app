// Arc/Circle Web3 Services Integration

// ─── Exchange Rates ───────────────────────────────────────────────────────────

export async function getExchangeRate(currency: string): Promise<number> {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/USD`);
    const data = await res.json();
    return data.rates[currency] ?? 1;
  } catch {
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

// ─── Create Circle wallet via Vercel API route ────────────────────────────────

export async function createCircleWallet(userId: string): Promise<{walletId: string, address: string}> {
  const res = await fetch("/api/create-wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Server returned invalid response: " + text.slice(0, 100));
  }

  if (!res.ok || data.error) throw new Error(data.error ?? "Failed to create wallet");
  return { walletId: data.walletId, address: data.address };
}

// ─── Get USDC balance via Vercel API route ────────────────────────────────────

export async function getCircleWalletBalance(walletId: string): Promise<number> {
  if (!walletId) return 0;
  try {
    const res = await fetch(`/api/wallet-balance?walletId=${walletId}`);
    const data = await res.json();
    return data.balance ?? 0;
  } catch {
    return 0;
  }
}
