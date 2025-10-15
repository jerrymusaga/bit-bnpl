'use client'

import { useChainId, useConnect, useAccount, useDisconnect, useBalance } from 'wagmi'
import { useEffect } from 'react'

export function WalletConnect() {
  const chainId = useChainId()
  const { connectors, connect, isPending } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
  })

  // Log connection status for debugging
  useEffect(() => {
    console.log('Connected:', isConnected)
    console.log('Address:', address)
    console.log('Chain ID:', chainId)
    console.log('Balance:', balance)
  }, [isConnected, address, chainId, balance])

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Connected</p>
          <p className="font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {balanceLoading ? (
            <p className="text-xs text-gray-500 mt-1">Loading balance...</p>
          ) : balance ? (
            <p className="text-xs text-gray-700 mt-1 font-semibold">
              {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </p>
          ) : null}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Connect Your Wallet</h2>
      <div className="grid gap-3">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => {
              connect({ connector, chainId })
            }}
            disabled={isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connector.name}
            {isPending && ' (Connecting...)'}
          </button>
        ))}
      </div>
    </div>
  )
}