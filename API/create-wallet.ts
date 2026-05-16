import * as crypto from 'crypto';

const CIRCLE_API_KEY = "TEST_API_KEY:847c9d059b7160503c79b730da310e37:7388474fcdd2440cac4e73ebade48ccb";
const ENTITY_SECRET = "fd42db8d9d2b146c06a87c9428d6d70ff38abeabb66435042b47ba467140dab3";
const WALLET_SET_ID = "178f729b-72e0-5cff-b12f-e588fd05b824";

async function circleGet(path: string) {
  const res = await fetch(`https://api.circle.com/v1/w3s${path}`, {
    headers: { 'Authorization': `Bearer ${CIRCLE_API_KEY}`, 'Content-Type': 'application/json' }
  });
  return res.json();
}

async function circlePost(path: string, body: any) {
  const res = await fetch(`https://api.circle.com/v1/w3s${path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${CIRCLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function generateCiphertext(): Promise<string> {
  const pkRes = await circleGet('/config/entity/publicKey');
  const pemKey = pkRes.data?.publicKey;
  if (!pemKey) throw new Error('Could not fetch Circle public key');
  const entitySecretBytes = Buffer.from(ENTITY_SECRET, 'hex');
  const publicKey = crypto.createPublicKey({ key: pemKey, format: 'pem', type: 'pkcs1' });
  const encrypted = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    entitySecretBytes
  );
  return encrypted.toString('base64');
}

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body ?? {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const ciphertext = await generateCiphertext();
    const idempotencyKey = `susu-${userId}-${Date.now()}`;

    const walletRes = await circlePost('/developer/wallets', {
      idempotencyKey,
      walletSetId: WALLET_SET_ID,
      blockchains: ['ARC-TESTNET'],
      count: 1,
      accountType: 'EOA',
      entitySecretCiphertext: ciphertext,
    });

    const wallet = walletRes.data?.wallets?.[0];
    if (!wallet) return res.status(500).json({ error: 'No wallet returned', details: walletRes });

    return res.status(200).json({ walletId: wallet.id, address: wallet.address });
  } catch (e: any) {
    return res.status(500).json({ error: e.message ?? 'Internal error' });
  }
}
