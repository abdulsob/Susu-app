const CIRCLE_API_KEY = "TEST_API_KEY:847c9d059b7160503c79b730da310e37:7388474fcdd2440cac4e73ebade48ccb";
const CIRCLE_API_BASE = "https://api.circle.com/v1/w3s";
const WALLET_SET_ID = "178f729b-72e0-5cff-b12f-e588fd05b824";
const ENTITY_SECRET = "fd42db8d9d2b146c06a87c9428d6d70ff38abeabb66435042b47ba467140dab3";

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

// ─── Circle API helper ────────────────────────────────────────────────────────

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

// ─── Generate entity secret ciphertext using Web Crypto API ──────────────────

async function generateCiphertext(): Promise<string> {
  const pkRes = await circleRequest("/config/entity/publicKey");
  const pemKey = pkRes.data?.publicKey;
  if (!pemKey) throw new Error("Could not fetch Circle public key");

  // Strip PEM headers and decode base64
  const pemBody = pemKey
    .replace(/-----BEGIN.*?-----/g, "")
    .replace(/-----END.*?-----/g, "")
    .replace(/\n/g, "")
    .trim();

  const binaryDer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const entitySecretBytes = Uint8Array.from(
    ENTITY_SECRET.match(/.{1,2}/g)!.map(b => parseInt(b, 16))
  );

  // Import as RSA-OAEP public key
  const cryptoKey = await crypto.subtle.importKey(
    "spki",
    binaryDer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    cryptoKey,
    entitySecretBytes
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

// ─── Create Circle wallet for a user ─────────────────────────────────────────

export async function createCircleWallet(userId: string): Promise<{walletId: string, address: string}> {
  const ciphertext = await generateCiphertext();
  const idempotencyKey = `susu-${userId}-${Date.now()}`;

  const res = await circleRequest("/developer/wallets", "POST", {
    idempotencyKey,
    walletSetId: WALLET_SET_ID,
    blockchains: ["ARC-TESTNET"],
    count: 1,
    accountType: "EOA",
    entitySecretCiphertext: ciphertext,
  });

  const wallet = res.data?.wallets?.[0];
  if (!wallet) throw new Error(res.message ?? "Failed to create Circle wallet");

  return { walletId: wallet.id, address: wallet.address };
}

// ─── Get USDC balance via Circle API ─────────────────────────────────────────

export async function getCircleWalletBalance(walletId: string): Promise<number> {
  if (!walletId) return 0;
  try {
    const res = await circleRequest(`/developer/wallets/${walletId}/balances`);
    const tokenBalances = res.data?.tokenBalances ?? [];
    const usdc = tokenBalances.find((b: any) => b.token?.symbol === "USDC");
    return parseFloat(usdc?.amount ?? "0");
  } catch {
    return 0;
  }
}
