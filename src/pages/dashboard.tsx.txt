import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, ArrowDownLeft, Wallet, History, Bell, User,
  PiggyBank, TrendingUp, Leaf, ShieldCheck, CircleDollarSign,
  Receipt, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePrivy, useCreateWallet } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/context/currency";
import { getOrCreateUser, getTransactions, updateUserBalance } from "@/lib/supabase";
import { getExchangeRate, usdcToLocal, formatUsdc, getArcUsdcBalance } from "@/lib/arc";

function getInitials(email: string | undefined): string {
  if (!email) return "SU";
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

function getFirstName(email: string | undefined): string {
  if (!email) return "there";
  const local = email.split("@")[0];
  const first = local.split(/[._-]/)[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function Dashboard() {
  const { user, authenticated, ready } = usePrivy();
  const { createWallet } = useCreateWallet();
  const navigate = useNavigate();
  const { selected } = useCurrency();

  const [usdcBalance, setUsdcBalance] = useState<number>(0);
  const [localBalance, setLocalBalance] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !authenticated) navigate("/login");
    if (ready && authenticated && user) {
      const hasWallet = user.linkedAccounts?.some((a: any) => a.type === "wallet");
      if (!hasWallet) createWallet().catch(console.error);
    }
  }, [ready, authenticated]);

  useEffect(() => {
    async function loadData() {
      if (!ready || !authenticated || !user) return;
      try {
        const email = user?.email?.address ?? "";
        const profile = await getOrCreateUser(user.id, email);

        // Get live exchange rate
        const rate = await getExchangeRate(selected.code);
        setExchangeRate(rate);

        // Get real USDC balance from Arc blockchain
        const walletAccount = user.linkedAccounts?.find(
          (a: any) => a.type === "wallet" || a.type === "smart_wallet"
        );
        const walletAddress = walletAccount?.address;
        let usdc = profile.usdc_balance ?? 0;
        if (walletAddress) {
          try {
            const arcBalance = await getArcUsdcBalance(walletAddress);
            if (arcBalance > 0) usdc = arcBalance;
          } catch (e) {
            console.error("Could not fetch Arc balance:", e);
          }
        }
        setUsdcBalance(usdc);
        setLocalBalance(usdcToLocal(usdc, rate));

        const txs = await getTransactions(user.id);
        setTransactions(txs);
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [ready, authenticated, user, selected.code]);

  if (!ready || !authenticated) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const email = user?.email?.address;
  const initials = getInitials(email);
  const firstName = getFirstName(email);
  const greeting = getGreeting();

  const formattedLocal = new Intl.NumberFormat(selected.locale, {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(localBalance);
  const [balanceInt, balanceDec] = formattedLocal.split(".");

  const grouped: Record<string, any[]> = {};
  transactions.forEach((tx) => {
    const label = formatDate(tx.created_at);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(tx);
  });

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-20">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">

        <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{greeting},</p>
              <h2 className="text-base font-bold text-foreground leading-tight">{firstName}</h2>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-muted/50 hover:bg-muted">
            <Bell className="w-5 h-5 text-foreground" />
          </Button>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-8">

          {/* Balance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="p-6 bg-primary text-primary-foreground border-none shadow-xl shadow-primary/20 rounded-[1.5rem] relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-accent/20 rounded-full blur-xl" />
              <div className="relative z-10">
                <p className="text-primary-foreground/80 font-medium text-sm mb-2">Total Balance</p>
                {loading ? (
                  <div className="h-12 flex items-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-foreground/60" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-4xl font-extrabold tracking-tight mb-1">
                      <span className="text-primary-foreground/70 mr-1 text-2xl font-semibold">{selected.symbol}</span>
                      {balanceInt}
                      <span className="text-primary-foreground/70 text-2xl font-bold">.{balanceDec}</span>
                    </h3>
                    {/* USDC equivalent */}
                    <p className="text-primary-foreground/50 text-xs mb-2">
                      ≈ ${formatUsdc(usdcBalance)} USDC · 1 USDC = {selected.symbol}{new Intl.NumberFormat(selected.locale).format(Math.round(exchangeRate))}
                    </p>
                  </>
                )}
                <p className="text-primary-foreground/60 text-xs mb-6">{selected.flag} {selected.country} · {selected.currency}</p>
                <div className="flex items-center gap-4 pt-4 border-t border-primary-foreground/10">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                    <p className="text-xs text-primary-foreground/80 font-medium">
                      Savings earning <span className="text-accent font-bold">6% annually</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary-foreground/60" />
                    <p className="text-xs text-primary-foreground/60">Protected</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-4 gap-4">
            {[
              { to: "/send", icon: <ArrowUpRight className="w-6 h-6" />, label: "Send", color: "bg-secondary hover:bg-secondary/80 text-secondary-foreground" },
              { to: "/funds", icon: <ArrowDownLeft className="w-6 h-6" />, label: "Add Money", color: "bg-secondary hover:bg-secondary/80 text-secondary-foreground" },
              { to: "/save", icon: <PiggyBank className="w-6 h-6" />, label: "Save", color: "bg-primary/10 hover:bg-primary/20 text-primary" },
              { to: "/invest", icon: <Leaf className="w-6 h-6" />, label: "Invest", color: "bg-accent/10 hover:bg-accent/20 text-accent-foreground" },
            ].map(({ to, icon, label, color }) => (
              <Link key={to} to={to} className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-2xl ${color} shadow-sm flex items-center justify-center`}>{icon}</div>
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
              </Link>
            ))}
          </motion.div>

          {/* Savings Banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Card className="p-4 bg-primary/5 border-primary/15 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Your savings are earning 6% annually</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add money to start growing your balance</p>
              </div>
              <Button asChild size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 shrink-0 text-xs">
                <Link to="/save">Save now</Link>
              </Button>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex-1 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-foreground">Recent Transactions</h4>
              <Button variant="link" className="text-primary h-auto p-0 font-medium text-sm" asChild>
                <Link to="/history">See all</Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : transactions.length === 0 ? (
              <Card className="rounded-2xl border-dashed border-border/60 bg-muted/20 shadow-none p-8 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Your transactions will appear here once you send or receive money.</p>
                </div>
                <Button asChild size="sm" className="mt-1 rounded-xl text-xs shadow-none">
                  <Link to="/funds">Add money to get started</Link>
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([date, txs]) => (
                  <div key={date}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{date}</p>
                    <div className="space-y-2">
                      {txs.map((tx) => {
                        const isCredit = tx.type === "receive" || tx.type === "deposit";
                        return (
                          <Card key={tx.id} className="p-3 rounded-xl flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? "bg-green-500/10" : "bg-red-500/10"}`}>
                              {isCredit ? <ArrowDownLeft className="w-5 h-5 text-green-600" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground capitalize">
                                {tx.type === "send" ? `Sent to ${tx.recipient_label ?? "User"}` :
                                 tx.type === "receive" ? `Received from ${tx.recipient_label ?? "User"}` :
                                 tx.type === "deposit" ? "Deposit" : "Withdrawal"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(tx.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <p className={`text-sm font-bold ${isCredit ? "text-green-600" : "text-foreground"}`}>
                              {isCredit ? "+" : "-"}{selected.symbol}{new Intl.NumberFormat("en-NG").format(tx.amount)}
                            </p>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </main>

        <div className="fixed bottom-0 w-full max-w-[430px] bg-background border-t border-border px-6 py-4 flex items-center justify-between z-30">
          <button className="flex flex-col items-center gap-1 text-primary">
            <Wallet className="w-6 h-6" fill="currentColor" fillOpacity={0.2} />
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <Link to="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
          <Link to="/circles" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <CircleDollarSign className="w-6 h-6" />
            <span className="text-[10px] font-medium">Circles</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
