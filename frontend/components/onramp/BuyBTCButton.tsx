'use client'

import { useMoonPay } from '@/hooks/useMoonPay'
import { Wallet, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export interface BuyBTCButtonProps {
  amount?: number
  variant?: 'default' | 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function BuyBTCButton({
  amount,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  onSuccess,
  onError,
}: BuyBTCButtonProps) {
  const { openBuyWidget, isConnected } = useMoonPay()
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    openBuyWidget({
      baseCurrencyAmount: amount,
      baseCurrencyCode: 'usd',
      onSuccess: (transactionId) => {
        console.log('[BuyBTC] Transaction successful:', transactionId)
        setIsLoading(false)
        onSuccess?.()
      },
      onError: (error) => {
        console.error('[BuyBTC] Transaction failed:', error)
        setIsLoading(false)
        onError?.(error)
      },
      onClose: () => {
        setIsLoading(false)
      },
    })
  }

  // Variant styles
  const variantStyles = {
    default: 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--card-hover)]',
    primary: 'bg-gradient-to-r from-[#FF6B35] to-[#F7931A] text-white hover:opacity-90',
    outline: 'border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10',
    ghost: 'text-[var(--text-primary)] hover:bg-[var(--card-hover)]',
  }

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      onClick={handleClick}
      disabled={!isConnected || isLoading}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthClass}
        ${className}
        rounded-lg font-medium
        transition-all duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
          <span>Opening MoonPay...</span>
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          <span>Buy BTC</span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </>
      )}
    </button>
  )
}
