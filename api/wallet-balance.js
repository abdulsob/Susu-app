const https = require('https');

const CIRCLE_API_KEY = "TEST_API_KEY:847c9d059b7160503c79b730da310e37:7388474fcdd2440cac4e73ebade48ccb";

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const walletId = req.query?.walletId;
    if (!walletId) return res.status(400).json({ error: 'walletId required', balance: 0 });

    const data = await httpsGet('api.circle.com', `/v1/w3s/developer/wallets/${walletId}/balances`, {
      'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      'Content-Type': 'application/json'
    });

    const tokenBalances = data.data?.tokenBalances ?? [];
    const usdc = tokenBalances.find(b => b.token?.symbol === 'USDC');
    return res.status(200).json({ balance: parseFloat(usdc?.amount ?? '0') });
  } catch (e) {
    return res.status(500).json({ error: e.message, balance: 0 });
  }
};
