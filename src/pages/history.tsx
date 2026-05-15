import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CircleDollarSign, 
  Wallet, 
  History, 
  User 
} from "lucide-react";

const MOCK_TRANSACTIONS = [
  { id: 1, title: "Sent to Emeka Eze", date: "Today", time: "09:41 AM", amount: -15000, type: "sent", icon: "send" },
  { id: 2, title: "Interest Payout", date: "Today", time: "07:15 AM", amount: 4250, type: "received", icon: "receive" },
  { id: 3, title: "Susu Circle Contribution", date: "Yesterday", time: "11:30 PM", amount: -25000, type: "circles", icon: "circle" },
  { id: 4, title: "MTN MoMo Deposit", date: "Yesterday", time: "03:20 PM", amount: 50000, type: "deposit", icon: "deposit" },
  { id: 5, title: "Sent to Adaeze Okafor", date: "Yesterday", time: "10:00 AM", amount: -8000, type: "sent", icon: "send" },
  { id: 6, title: "Airtel Money Deposit", date: "Oct 12, 2025", time: "02:15 PM", amount: 100000, type: "deposit", icon: "deposit" },
  { id: 7, title: "Lagos Friends Contribution", date: "Oct 12, 2025", time: "09:00 AM", amount: -25000, type: "circles", icon: "circle" },
  { id: 8, title: "Received from Fatima Bello", date: "Oct 12, 2025", time: "08:30 AM", amount: 20000, type: "received", icon: "receive" },
];

const FILTERS = ["All", "Sent", "Received", "Deposits", "Circles"];

export default function TransactionHistory() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Sent") return tx.type === "sent";
    if (activeFilter === "Received") return tx.type === "received";
    if (activeFilter === "Deposits") return tx.type === "deposit";
    if (activeFilter === "Circles") return tx.type === "circles";
    return true;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((acc, tx) => {
    if (!acc[tx.date]) {
      acc[tx.date] = [];
    }
    acc[tx.date].push(tx);
    return acc;
  }, {} as Record<string, typeof MOCK_TRANSACTIONS>);

  const renderIcon = (type: string) => {
    switch (type) {
      case "sent":
        return <ArrowUpRight className="w-5 h-5 text-muted-foreground" />;
      case "received":
        return <ArrowDownLeft className="w-5 h-5 text-primary" />;
      case "circles":
        return <CircleDollarSign className="w-5 h-5 text-primary" />;
      case "deposit":
        return <ArrowDownLeft className="w-5 h-5 text-primary" />;
      default:
        return <ArrowUpRight className="w-5 h-5" />;
    }
  };

  const renderIconBg = (type: string) => {
    switch (type) {
      case "sent":
        return "bg-muted";
      case "received":
        return "bg-primary/20";
      case "circles":
        return "bg-primary/20";
      case "deposit":
        return "bg-primary/30";
      default:
        return "bg-muted";
    }
  };

  const formatAmount = (amount: number) => {
    const isPositive = amount > 0;
    const formatted = Math.abs(amount).toLocaleString();
    return isPositive ? `+₦ ${formatted}` : `-₦ ${formatted}`;
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-20">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">
        
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-center sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <h1 className="text-xl font-bold text-foreground">Transaction History</h1>
        </header>

        {/* Filter Chips */}
        <div className="px-6 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2 no-scrollbar">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                activeFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
              data-testid={`chip-filter-${filter.toLowerCase()}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <main className="px-6 flex-1 flex flex-col gap-6 py-6">
          {Object.entries(groupedTransactions).map(([date, txs], groupIndex) => (
            <div key={date} className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground sticky top-[80px] bg-background/90 py-2 backdrop-blur-sm z-10">
                {date}
              </h3>
              <div className="space-y-4">
                {txs.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: (groupIndex * 0.1) + (index * 0.05) }}
                    className="flex items-center justify-between"
                    data-testid={`transaction-row-${tx.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${renderIconBg(tx.type)}`}>
                        {renderIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm leading-tight">{tx.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{tx.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-primary' : 'text-foreground'}`}>
                        {formatAmount(tx.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm py-12">
              No transactions found.
            </div>
          )}
        </main>
        
        {/* Bottom Navigation */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-background border-t border-border px-6 py-4 flex items-center justify-between z-30 pb-safe">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-home">
            <Wallet className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-primary" data-testid="nav-history">
            <History className="w-6 h-6" fill="currentColor" fillOpacity={0.2} />
            <span className="text-[10px] font-bold">History</span>
          </button>
          <Link to="/circles" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-circles">
            <CircleDollarSign className="w-6 h-6" />
            <span className="text-[10px] font-medium">Circles</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors" data-testid="nav-profile">
            <User className="w-6 h-6" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
        
      </div>
    </div>
  );
}
