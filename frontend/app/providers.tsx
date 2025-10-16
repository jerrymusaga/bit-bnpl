'use client'

import React from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { getConfig } from '@mezo-org/passport'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// Custom RainbowKit theme matching our design system
const customTheme = darkTheme({
  accentColor: '#F7931A', // Bitcoin orange
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
})

// Use Mezo Passport config for Bitcoin + Mezo wallet support
const config = getConfig({
  appName: 'BitBNPL',
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  mezoNetwork: 'testnet', // Use Mezo Testnet (Matsnet)
  // This automatically configures Mezo Testnet + Bitcoin wallets (Unisat, Xverse, OKX)
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}