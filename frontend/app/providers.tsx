'use client'

import React from 'react'
import { WagmiProvider, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

// Custom RainbowKit theme matching our design system
const customTheme = darkTheme({
  accentColor: '#F7931A', // Bitcoin orange
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
})

// Define Mezo testnet
const mezoTestnet = defineChain({
  id: 31611,
  name: 'Mezo Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test.mezo.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Mezo Explorer',
      url: 'https://explorer.test.mezo.org',
    },
  },
  testnet: true,
})

// Configure wagmi with RainbowKit
const config = getDefaultConfig({
  appName: 'BitBNPL',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mezoTestnet],
  transports: {
    [mezoTestnet.id]: http(),
  },
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} initialChain={mezoTestnet}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}