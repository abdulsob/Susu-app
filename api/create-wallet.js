const https = require('https');
const crypto = require('crypto');

const CIRCLE_API_KEY = "TEST_API_KEY:847c9d059b7160503c79b730da310e37:7388474fcdd2440cac4e73ebade48ccb";
const ENTITY_SECRET = "fd42db8d9d2b146c06a87c9428d6d70ff38abeabb66435042b47ba467140dab3";
const WALLET_SET_ID = "6c12576d-7551-5a9c-a904-c6195716058c";

function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpsGet(hostname, path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'GET', headers }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function generateCiphertext() {
  const pkData = await httpsGet('api.circle.com', '/v1/w3s/config/entity/publicKey', {
    'Authorization': `Bearer ${CIRCLE_API_KEY}`,
    'Content-Type': 'application/json'
  });
  
  const pemKey = pkData.data?.publicKey;
  if (!pemKey) throw new Error('Could not fetch public key');
  
  const entitySecretBytes = Buffer.from(ENTITY_SECRET, 'hex');
  const publicKey = crypto.createPublicKey({ key: pemKey, format: 'pem', type: 'spki' });
  const encrypted = crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' },
    entitySecretBytes
  );
  return encrypted.toString('base64');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const ciphertext = await generateCiphertext();
    const idempotencyKey = `susu-${userId}-${Date.now()}`;

    const walletData = await httpsPost('api.circle.com', '/v1/w3s/developer/wallets', {
      'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      'Content-Type': 'application/json'
    }, {
      idempotencyKey,
      walletSetId: WALLET_SET_ID,
      blockchains: ['ARC-TESTNET'],
      count: 1,
      accountType: 'EOA',
      entitySecretCiphertext: ciphertext
    });

    const wallet = walletData.data?.wallets?.[0];
    if (!wallet) return res.status(500).json({ error: 'No wallet returned', raw: walletData });

    return res.status(200).json({ walletId: wallet.id, address: wallet.address });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
