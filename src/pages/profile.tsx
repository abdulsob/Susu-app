import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck, Mail, Hash, Calendar, Bell, Lock, Globe,
  HelpCircle, LogOut, ChevronRight, Check, Wallet, History,
  CircleDollarSign, User, Loader2, X, Eye, EyeOff, Copy, QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCircleWallet, getCircleWalletBalance } from "@/lib/arc.ts";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { usePrivy } from "@privy-io/react-auth";
import { useCurrency, CURRENCIES } from "@/context/currency";
import { getOrCreateUser, saveWalletInfo, enableCryptoMode } from "@/lib/supabase";

function getInitials(email: string | undefined): string {
  if (!email) return "SU";
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

function getDisplayName(email: string | undefined): string {
  if (!email) return "Susu User";
  const local = email.split("@")[0];
  return local.split(/[._-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout, authenticated, ready } = usePrivy();
  const { selected, setSelected } = useCurrency();

  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showCryptoMode, setShowCryptoMode] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [cryptoMode, setCryptoMode] = useState(false);
  const [circleWalletAddress, setCircleWalletAddress] = useState("");
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [creatingWallet, setCreatingWallet] = useState(false);

  const userEmail = user?.email?.address;
  const displayName = getDisplayName(userEmail);
  const initials = getInitials(userEmail);

  // Get embedded wallet address from Privy
  const embeddedWallet = user?.linkedAccounts?.find(
    (a: any) => a.type === "wallet" && a.walletClientType === "privy"
  ) as any;
  const walletAddress = embeddedWallet?.address ?? "";

  useEffect(() => {
    if (ready && !authenticated) navigate("/login");
  }, [ready, authenticated]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const p = await getOrCreateUser(user.id, userEmail ?? "");
        setProfile(p);
        // Load crypto mode and Circle wallet if enabled
        if (p.crypto_mode && p.wallet_address) {
          setCryptoMode(true);
          setCircleWalletAddress(p.wallet_address);
          // Load USDC balance
          if (p.wallet_id) {
            const balance = await getCircleWalletBalance(p.wallet_id);
            setUsdcBalance(balance);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [user, walletAddress]);

  if (!ready || !authenticated) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(profile?.account_number ?? "").catch(() => {});
    toast({ title: "Copied!", description: "Account number copied." });
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(circleWalletAddress).catch(() => {});
    toast({ title: "Copied!", description: "Wallet address copied." });
  };

  const handleEnableCryptoMode = async () => {
    if (cryptoMode) {
      setShowCryptoMode(!showCryptoMode);
      return;
    }
    setCreatingWallet(true);
    try {
      console.log("Creating Circle wallet...");
      const { walletId, address } = await createCircleWallet(user!.id);
      console.log("Wallet created:", walletId, address);
      await enableCryptoMode(user!.id, walletId, address);
      setCircleWalletAddress(address);
      setCryptoMode(true);
      setShowCryptoMode(true);
      toast({ title: "Crypto mode enabled!", description: "Your USDC wallet is ready." });
    } catch (e: any) {
      console.error("Wallet creation error:", e);
      toast({ title: "Failed to create wallet", description: e.message ?? "Unknown error", variant: "destructive" });
      alert("Error: " + (e.message ?? "Unknown error"));
    } finally {
      setCreatingWallet(false);
    }
  };

  const handleComingSoon = () => {
    toast({ title: "Coming soon", description: "This feature is not yet available." });
  };

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-NG", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background pb-24">
      <div className="w-full max-w-[430px] flex-1 flex flex-col relative z-10 bg-background/50">

        <header className="px-6 py-6 flex items-center justify-center sticky top-0 bg-background/80 backdrop-blur-md z-20">
          <h1 className="text-xl font-bold text-foreground">Profile</h1>
        </header>

        <main className="px-6 flex-1 flex flex-col gap-8 pb-8">

          {/* Avatar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center mt-2">
            <Avatar className="w-20 h-20 border-4 border-background shadow-md mb-4">
              <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground mt-1">{userEmail ?? "No email linked"}</p>
            <div className="flex items-center gap-1.5 mt-3 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Account
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="rounded-[1.5rem] bg-card border-border/50 shadow-sm overflow-hidden">
              <div className="flex items-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mr-4">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">{userEmail ?? "—"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mr-4">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="text-sm font-medium text-foreground truncate">{profile?.account_number ?? "—"}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 ml-2" onClick={handleCopyAccount}>
                  Copy
                </Button>
              </div>
              <Separator />
              <div className="flex items-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mr-4">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium text-foreground truncate">{memberSince}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Country & Currency */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Country & Currency</h3>
            <Card className="rounded-[1.5rem] bg-card border-border/50 shadow-sm overflow-hidden">
              <button className="flex items-center p-4 w-full text-left hover:bg-muted/50 transition-colors" onClick={() => setShowCurrencySheet(true)}>
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mr-4 text-xl leading-none">
                  {selected.flag}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-muted-foreground">Current country & currency</p>
                  <p className="text-sm font-semibold text-foreground">{selected.country} · {selected.symbol} {selected.currency}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </Card>
          </motion.div>

          {/* Crypto Mode — hidden by default, toggle to reveal */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-3">
            <button className="flex items-center gap-2 w-full" onClick={handleEnableCryptoMode}>
              <h3 className="text-lg font-bold text-foreground">Crypto & Wallet</h3>
              {creatingWallet ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showCryptoMode ? "rotate-90" : ""}`} />
              )}
              {!cryptoMode && <span className="text-xs text-primary font-medium ml-auto">Enable</span>}
            </button>

            <AnimatePresence>
              {showCryptoMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                  <Card className="rounded-[1.5rem] bg-card border-border/50 shadow-sm overflow-hidden">

                    {/* Wallet Address */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground font-medium">Your USDC Wallet Address</p>
                        <button onClick={() => setShowWalletAddress(!showWalletAddress)} className="text-primary">
                          {showWalletAddress ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
                        <p className="text-xs font-mono text-foreground flex-1 truncate">
                          {showWalletAddress
                            ? (circleWalletAddress || "No wallet connected")
                            : "••••••••••••••••••••••••••••••••••••••••••"}
                        </p>
                        {circleWalletAddress && (
                          <button onClick={handleCopyWallet} className="shrink-0 text-primary">
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Send USDC to this address on Arc network to deposit directly.
                      </p>
                    </div>

                    <Separator />

                    {/* USDC Balance */}
                    {usdcBalance > 0 && (
                      <div className="flex items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-4">
                          <span className="text-primary font-bold text-xs">USDC</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">USDC Balance</p>
                          <p className="text-sm font-semibold text-foreground">${usdcBalance.toFixed(2)} USDC</p>
                        </div>
                      </div>
                    )}
                    <Separator />
                    {/* Network info */}
                    <div className="flex items-center p-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mr-4">
                        <Globe className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Network</p>
                        <p className="text-sm font-semibold text-foreground">Arc Testnet · USDC</p>
                      </div>
                      <span className="text-xs bg-yellow-500/10 text-yellow-600 font-semibold px-2 py-1 rounded-full">Testnet</span>
                    </div>

                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Settings</h3>
            <Card className="rounded-[1.5rem] bg-card border-border/50 shadow-sm overflow-hidden flex flex-col">
              <button className="flex items-center p-4 w-full text-left hover:bg-muted/50 transition-colors" onClick={handleComingSoon}>
                <Bell className="w-5 h-5 text-muted-foreground mr-4" />
                <span className="flex-1 font-medium text-sm">Notifications</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <Separator />
              <button className="flex items-center p-4 w-full text-left hover:bg-muted/50 transition-colors" onClick={handleComingSoon}>
                <Lock className="w-5 h-5 text-muted-foreground mr-4" />
                <span className="flex-1 font-medium text-sm">Security & PIN</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <Separator />
              <button className="flex items-center p-4 w-full text-left hover:bg-muted/50 transition-colors" onClick={handleComingSoon}>
                <HelpCircle className="w-5 h-5 text-muted-foreground mr-4" />
                <span className="flex-1 font-medium text-sm">Help & Support</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
              <Separator />
              <button className="flex items-center p-4 w-full text-left hover:bg-destructive/10 transition-colors" onClick={handleSignOut}>
                <LogOut className="w-5 h-5 text-destructive mr-4" />
                <span className="flex-1 font-medium text-sm text-destructive">Sign Out</span>
              </button>
            </Card>
          </motion.div>

        </main>

        {/* Bottom Nav */}
        <div className="fixed bottom-0 w-full max-w-[430px] bg-background border-t border-border px-6 py-4 flex items-center justify-between z-30">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Wallet className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
          <Link to="/circles" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <CircleDollarSign className="w-6 h-6" />
            <span className="text-[10px] font-medium">Circles</span>
          </Link>
          <button className="flex flex-col items-center gap-1 text-primary">
            <User className="w-6 h-6" fill="currentColor" fillOpacity={0.2} />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>

      </div>

      {/* Currency Sheet */}
      <AnimatePresence>
        {showCurrencySheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setShowCurrencySheet(false)} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto bg-background rounded-t-[2rem] z-50 shadow-2xl border-t border-border overflow-hidden">
              <div className="px-6 pt-5 pb-2 flex items-center justify-between">
                <div>
                  <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground">Choose your country</h3>
                  <p className="text-sm text-muted-foreground mt-1">All balances will show in your selected currency</p>
                </div>
                <button onClick={() => setShowCurrencySheet(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center ml-4 mt-1 shrink-0">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="px-6 pb-10 pt-4 space-y-2">
                {CURRENCIES.map((currency) => {
                  const isActive = selected.code === currency.code;
                  return (
                    <button key={currency.code} onClick={() => {
                      setSelected(currency);
                      toast({ title: "Currency updated", description: `Now showing ${currency.symbol} ${currency.currency}` });
                      setTimeout(() => setShowCurrencySheet(false), 300);
                    }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${isActive ? "border-primary bg-primary/5" : "border-transparent bg-muted/30 hover:bg-muted/60"}`}>
                      <span className="text-2xl leading-none">{currency.flag}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{currency.country}</p>
                        <p className="text-xs text-muted-foreground">{currency.symbol} {currency.currency}</p>
                      </div>
                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
