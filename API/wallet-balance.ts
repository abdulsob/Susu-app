import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as https from 'https';

const CIRCLE_API_KEY = "TEST_API_KEY:847c9d059b7160503c79b730da310e37:7388474fcdd2440cac4e73ebade48ccb";

function circleGet(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.circle.com',
      path: `/v1/w3s${path}`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${CIRCLE_API_KEY}`, 'Content-Type': 'application/json' }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    req.end();
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { walletId } = req.query;
  if (!walletId) return res.status(400).json({ error: 'walletId required' });

  try {
    const data = await circleGet(`/developer/wallets/${walletId}/balances`);
    const tokenBalances = data.data?.tokenBalances ?? [];
    const usdc = tokenBalances.find((b: any) => b.token?.symbol === "USDC");
    const balance = parseFloat(usdc?.amount ?? "0");
    return res.status(200).json({ balance });
  } catch (e: any) {
    return res.status(500).json({ error: e.message, balance: 0 });
  }
}
