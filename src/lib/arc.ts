// Arc/Circle Web3 Services Integration
// Testnet configuration

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

// ─── Create Circle wallet for a user (via Vercel API route) ──────────────────

export async function createCircleWallet(userId: string): Promise<{walletId: string, address: string}> {
  const res = await fetch("/api/create-wallet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed to create wallet");

  return {
    walletId: data.walletId,
    address: data.address,
  };
}

// ─── Get USDC balance via API route ──────────────────────────────────────────

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

// ─── Generate entity secret ciphertext for each request ──────────────────────

async function generateCiphertext(): Promise<string> {
  // Fetch Circle's public key
  const pkRes = await circleRequest("/config/entity/publicKey");
  const pemKey = pkRes.data?.publicKey;

  if (!pemKey) throw new Error("Could not fetch Circle public key");

  // Use Web Crypto API (available in browser/Vercel edge)
  const entitySecretBytes = hexToBytes(ENTITY_SECRET);

  // Import RSA public key
  const pemBody = pemKey
    .replace("-----BEGIN RSA PUBLIC KEY-----", "")
    .replace("-----END RSA PUBLIC KEY-----", "")
    .replace(/\n/g, "");

  const binaryDer = base64ToBytes(pemBody);

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

  return bytesToBase64(new Uint8Array(encrypted));
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}
