'use client'

import React, { useState, CSSProperties } from 'react'

export interface BitBNPLButtonProps {
  merchantAddress: string
  amount: number | string
  itemName: string
  itemId?: string
  itemImage?: string
  merchantName?: string
  children?: React.ReactNode
  style?: CSSProperties
  className?: string
  baseUrl?: string
  onRedirect?: () => void
  onError?: (error: Error) => void
  disabled?: boolean
}

export default function BitBNPLButton({
  merchantAddress,
  amount,
  itemName,
  itemId,
  itemImage = '🛍️',
  merchantName,
  children,
  style,
  className,
  baseUrl,
  onRedirect,
  onError,
  disabled = false,
}: BitBNPLButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Use window.location.origin in browser, fallback for SSR
  const effectiveBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://bitbnpl.vercel.app')

  // Validate merchant address
  if (!merchantAddress || !merchantAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.error('[BitBNPL] Invalid merchant address:', merchantAddress)
  }

  // Validate amount
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numericAmount) || numericAmount <= 0) {
    console.error('[BitBNPL] Invalid amount:', amount)
  }

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // Validate before redirect
    if (!merchantAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      const error = new Error('Invalid merchant address format')
      console.error('[BitBNPL]', error)
      onError?.(error)
      return
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      const error = new Error('Invalid amount')
      console.error('[BitBNPL]', error)
      onError?.(error)
      return
    }

    try {
      setIsLoading(true)

      // Store checkout data in sessionStorage
      const checkoutData = {
        merchant: merchantAddress,
        amount: numericAmount.toString(),
        itemName: itemName,
        itemId: itemId || `item_${Date.now()}`,
        itemImage: itemImage,
        merchantName: merchantName,
        timestamp: Date.now()
      }

      sessionStorage.setItem('bitbnpl_checkout_data', JSON.stringify(checkoutData))

      // Notify parent component
      onRedirect?.()

      // Small delay for UX
      setTimeout(() => {
        window.location.href = `${effectiveBaseUrl}/checkout`
      }, 100)

    } catch (error) {
      console.error('[BitBNPL] Checkout error:', error)
      setIsLoading(false)
      onError?.(error as Error)
    }
  }

  const defaultStyles: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(249, 115, 22, 0.3)',
    opacity: disabled ? 0.6 : 1,
    ...style,
  }

  const hoverStyles = !disabled && !isLoading ? {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
  } : {}

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={defaultStyles}
      className={className}
      aria-label={`Pay ${numericAmount} MUSD with BitBNPL`}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          Object.assign(e.currentTarget.style, hoverStyles)
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(249, 115, 22, 0.3)'
      }}
    >
      {!isLoading && <span style={{ marginRight: '8px', fontSize: '18px' }}>🟠</span>}
      {isLoading ? (
        <>
          <span style={{
            width: '14px',
            height: '14px',
            marginRight: '8px',
            border: '2px solid white',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.6s linear infinite',
          }} />
          Redirecting...
        </>
      ) : (
        children || 'Pay with BitBNPL'
      )}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}
