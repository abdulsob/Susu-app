import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { PrivyProvider } from "@privy-io/react-auth";
import { CurrencyProvider } from "@/context/currency";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Circles from "@/pages/circles";
import CircleDetail from "@/pages/circle-detail";
import Send from "@/pages/send";
import Funds from "@/pages/funds";
import Profile from "@/pages/profile";
import History from "@/pages/history";
import Invest from "@/pages/invest";
import Save from "@/pages/save";

function App() {
  return (
    <PrivyProvider
      appId="cmp2cb7xb00sj0cl8y63c4p0e"
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "light",
          accentColor: "#2d8a52",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          noPromptOnSignature: true,
        },
      }}
    >
      <CurrencyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/circles/:id" element={<CircleDetail />} />
            <Route path="/circles" element={<Circles />} />
            <Route path="/send" element={<Send />} />
            <Route path="/funds" element={<Funds />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/save" element={<Save />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-center" />
        </BrowserRouter>
      </CurrencyProvider>
    </PrivyProvider>
  );
}

export default App;
