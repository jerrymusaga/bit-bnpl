'use client'

import { useMoonPay } from '@/hooks/useMoonPay'
import { X, AlertCircle, Wallet, ExternalLink, Bitcoin } from 'lucide-react'
import { useState } from 'react'

export interface BuyBTCModalProps {
  isOpen: boolean
  onClose: () => void
  requiredAmount?: number
  currentBalance?: number
  onSuccess?: () => void
}

export function BuyBTCModal({
  isOpen,
  onClose,
  requiredAmount,
  currentBalance = 0,
  onSuccess,
}: BuyBTCModalProps) {
  const { openBuyWidget, isConnected } = useMoonPay()
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleBuyBTC = () => {
    setIsLoading(true)
    openBuyWidget({
      baseCurrencyAmount: requiredAmount,
      baseCurrencyCode: 'usd',
      onSuccess: (transactionId) => {
        console.log('[BuyBTCModal] Transaction successful:', transactionId)
        setIsLoading(false)
        onSuccess?.()
        onClose()
      },
      onError: (error) => {
        console.error('[BuyBTCModal] Transaction failed:', error)
        setIsLoading(false)
      },
      onClose: () => {
        setIsLoading(false)
      },
    })
  }

  const shortfall = requiredAmount ? requiredAmount - currentBalance : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B35]/20 to-[#F7931A]/20 flex items-center justify-center">
            <Bitcoin className="h-8 w-8 text-[#F7931A]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
          Insufficient BTC Balance
        </h3>

        {/* Description */}
        <p className="text-sm text-[var(--text-muted)] text-center mb-6">
          You need more BTC to complete this purchase. Buy BTC instantly with MoonPay using your credit card or bank account.
        </p>

        {/* Balance Info */}
        <div className="bg-[var(--bg-primary)] rounded-xl p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--text-muted)]">Current Balance</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              ${currentBalance.toFixed(2)}
            </span>
          </div>
          {requiredAmount && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--text-muted)]">Required Amount</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  ${requiredAmount.toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-[var(--border-color)]" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Shortfall
                </span>
                <span className="text-sm font-bold text-[#FF6B35]">
                  ${shortfall.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)] font-medium">Fast & Secure</p>
              <p className="text-xs text-[var(--text-muted)]">Get BTC in minutes via MoonPay</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)] font-medium">Multiple Payment Methods</p>
              <p className="text-xs text-[var(--text-muted)]">Credit card, debit card, or bank transfer</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-primary)] font-medium">Auto-Delivered</p>
              <p className="text-xs text-[var(--text-muted)]">BTC sent directly to your wallet</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] font-medium hover:bg-[var(--card-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleBuyBTC}
            disabled={!isConnected || isLoading}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-[#FF6B35] to-[#F7931A] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Opening...</span>
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                <span>Buy BTC</span>
                <ExternalLink className="h-3 w-3" />
              </>
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-[var(--text-muted)] text-center mt-4">
          Powered by MoonPay. Fees may apply.
        </p>
      </div>
    </div>
  )
}
