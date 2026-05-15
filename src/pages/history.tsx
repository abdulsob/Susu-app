import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight, ArrowDownLeft, CircleDollarSign,
  Wallet, History, User, Loader2, Receipt
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useCurrency } from "@/context/currency";
import { getTransactions } from "@/lib/supabase";

const FILTERS = ["All", "Sent", "Received", "Deposits", "Withdrawals"];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function TransactionHistory() {
  const { user } = usePrivy();
  const { selected } = useCurrency();
  const [activeFilter, setActiveFilter] = useState("All");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const txs = await getTransactions(user.id);
        setTransactions(txs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = transactions.filter((tx) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Sent") return tx.type === "send";
    if (activeFilter === "Received") return tx.type === "receive";
    if (activeFilter === "Deposits") return tx.type === "deposit";
    if (activeFilter === "Withdrawals") return tx.type === "withdraw";
    return true;
  });

  // Group by date
  const grouped: Record<string, any[]> = {};
  filtered.forEach((tx) => {
    const label = formatDate(tx.created_at);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(tx);
  });

  const getIcon = (type: string) => {
    const isCredit = type === "receive" || type === "deposit";
    return isCredit
      ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
      : <ArrowUpRight className="w-5 h-5 text-red-500" />;
  };

  const getIconBg = (type: string) => {
    const isCredit = type === "receive" || type === "deposit";
    return isCredit ? "bg-green-500/10" : "bg-red-500/10";
  };

  const getTitle = (tx: any) => {
    switch (tx.type) {
      case "send": return `Sent to ${tx.recipient_label ?? "User"}`;
      case "receive": return `Received from ${tx.recipient_label ?? "User"}`;
      case "deposit": return "Deposit";
      case "withdraw": return `Withdrawal to ${tx.recipient_label ?? "Bank"}`;
      default: return tx.type;
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-20">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">

        <header className="px-6 py-6 flex items-center justify-center sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <h1 className="text-xl font-bold text-foreground">Transaction History</h1>
        </header>

        <div className="px-6 py-2 overflow-x-auto whitespace-nowrap flex gap-2">
          {FILTERS.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                activeFilter === filter ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}>
              {filter}
            </button>
          ))}
        </div>

        <main className="px-6 flex-1 flex flex-col gap-6 py-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">No transactions yet</p>
              <p className="text-xs text-muted-foreground">Your transactions will appear here.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, txs], groupIndex) => (
              <div key={date} className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground sticky top-[80px] bg-background/90 py-2 backdrop-blur-sm z-10">
                  {date}
                </h3>
                <div className="space-y-4">
                  {txs.map((tx, index) => (
                    <motion.div key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (groupIndex * 0.1) + (index * 0.05) }}
                      className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(tx.type)}`}>
                          {getIcon(tx.type)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm leading-tight">{getTitle(tx)}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(tx.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${tx.type === "receive" || tx.type === "deposit" ? "text-green-600" : "text-foreground"}`}>
                          {tx.type === "receive" || tx.type === "deposit" ? "+" : "-"}
                          {selected.symbol}{new Intl.NumberFormat("en-NG").format(tx.amount)}
                        </p>
                        <p className={`text-xs mt-0.5 ${tx.status === "success" ? "text-green-600" : tx.status === "pending" ? "text-yellow-600" : "text-red-500"}`}>
                          {tx.status}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </main>

        <div className="fixed bottom-0 w-full max-w-[430px] bg-background border-t border-border px-6 py-4 flex items-center justify-between z-30">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Wallet className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-primary">
            <History className="w-6 h-6" fill="currentColor" fillOpacity={0.2} />
            <span className="text-[10px] font-bold">History</span>
          </button>
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
