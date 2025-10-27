import React, { useState, CSSProperties } from 'react'

export interface BitBNPLButtonProps {
  /** Merchant's Ethereum address (must be verified on BitBNPL) */
  merchantAddress: string
  /** Product price in MUSD */
  amount: number | string
  /** Product name */
  itemName: string
  /** Unique product identifier */
  itemId?: string
  /** Product emoji/icon */
  itemImage?: string
  /** Merchant/store name */
  merchantName?: string
  /** Custom button text (default: "Pay with BitBNPL") */
  children?: React.ReactNode
  /** Custom styles */
  style?: CSSProperties
  /** Custom className */
  className?: string
  /** BitBNPL base URL (default: https://bitbnpl.com) */
  baseUrl?: string
  /** Callback when redirect starts */
  onRedirect?: () => void
  /** Callback on error */
  onError?: (error: Error) => void
  /** Disable the button */
  disabled?: boolean
}

/**
 * BitBNPL Payment Button Component
 *
 * A React component that creates a styled payment button for BitBNPL.
 * When clicked, it redirects users to the BitBNPL checkout page with product details.
 *
 * @example
 * ```tsx
 * import { BitBNPLButton } from '@bitbnpl/react'
 *
 * function ProductPage() {
 *   return (
 *     <BitBNPLButton
 *       merchantAddress="0x..."
 *       amount={299.99}
 *       itemName="Premium Headphones"
 *       itemId="prod_123"
 *       itemImage="🎧"
 *     />
 *   )
 * }
 * ```
 */
export function BitBNPLButton({
  merchantAddress,
  amount,
  itemName,
  itemId,
  itemImage = '🛍️',
  merchantName,
  children,
  style,
  className,
  baseUrl = 'https://bitbnpl.com',
  onRedirect,
  onError,
  disabled = false,
}: BitBNPLButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

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

      // Redirect to checkout
      window.location.href = `${baseUrl}/checkout`

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

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      style={defaultStyles}
      className={className}
      aria-label={`Pay ${numericAmount} MUSD with BitBNPL`}
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
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  )
}

/**
 * Hook to check if a merchant is verified on BitBNPL
 * (Coming soon - requires on-chain integration)
 */
export function useMerchantVerification(merchantAddress: string) {
  // TODO: Implement on-chain merchant verification
  return {
    isVerified: true, // Placeholder
    isLoading: false,
    error: null,
  }
}

/**
 * BitBNPL Context Provider (Coming soon)
 * Will provide global configuration for all BitBNPL components
 */
export function BitBNPLProvider({ children }: { children: React.ReactNode }) {
  // TODO: Implement global configuration context
  return <>{children}</>
}

export default BitBNPLButton
