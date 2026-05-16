const CIRCLE_API_KEY = "TEST_API_KEY:847c9d059b7160503c79b730da310e37:7388474fcdd2440cac4e73ebade48ccb";

export default async function handler(req: any, res: any) {
  try {
    const { walletId } = req.query ?? {};
    if (!walletId) return res.status(400).json({ error: 'walletId required', balance: 0 });

    const response = await fetch(`https://api.circle.com/v1/w3s/developer/wallets/${walletId}/balances`, {
      headers: { 'Authorization': `Bearer ${CIRCLE_API_KEY}`, 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    const tokenBalances = data.data?.tokenBalances ?? [];
    const usdc = tokenBalances.find((b: any) => b.token?.symbol === "USDC");
    return res.status(200).json({ balance: parseFloat(usdc?.amount ?? "0") });
  } catch (e: any) {
    return res.status(500).json({ error: e.message, balance: 0 });
  }
}
