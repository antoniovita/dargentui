"use client";
import "@rainbow-me/rainbowkit/styles.css";
import React from "react";
import { http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { anvil } from "wagmi/chains";

const queryClient = new QueryClient();

const rkConfig = getDefaultConfig({
  appName: "Dargent",
  projectId: "DARGENT_LOCAL_DEV",
  chains: [anvil],
  transports: { [anvil.id]: http("http://127.0.0.1:8545") },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={rkConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
