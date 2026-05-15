import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CurrencyOption = {
  country: string;
  currency: string;
  symbol: string;
  code: string;
  locale: string;
  flag: string;
};

export const CURRENCIES: CurrencyOption[] = [
  { country: "Nigeria",    currency: "Naira",    symbol: "₦",   code: "NGN", locale: "en-NG", flag: "🇳🇬" },
  { country: "Ghana",      currency: "Cedis",    symbol: "₵",   code: "GHS", locale: "en-GH", flag: "🇬🇭" },
  { country: "Kenya",      currency: "Shillings",symbol: "KSh", code: "KES", locale: "en-KE", flag: "🇰🇪" },
  { country: "Zimbabwe",   currency: "Dollar",   symbol: "ZWL", code: "ZWL", locale: "en-ZW", flag: "🇿🇼" },
  { country: "Uganda",     currency: "Shilling", symbol: "USh", code: "UGX", locale: "en-UG", flag: "🇺🇬" },
  { country: "Tanzania",   currency: "Shilling", symbol: "TSh", code: "TZS", locale: "en-TZ", flag: "🇹🇿" },
];

type CurrencyContextType = {
  selected: CurrencyOption;
  setSelected: (c: CurrencyOption) => void;
  format: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "susu_currency_code";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelectedState] = useState<CurrencyOption>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const found = CURRENCIES.find((c) => c.code === saved);
      if (found) return found;
    }
    return CURRENCIES[0];
  });

  const setSelected = (c: CurrencyOption) => {
    setSelectedState(c);
    localStorage.setItem(STORAGE_KEY, c.code);
  };

  const format = (amount: number): string => {
    try {
      return new Intl.NumberFormat(selected.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return amount.toFixed(2);
    }
  };

  return (
    <CurrencyContext.Provider value={{ selected, setSelected, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
