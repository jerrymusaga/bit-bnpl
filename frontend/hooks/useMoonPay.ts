import { useState, useCallback, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { buildMoonPayUrl } from '@/config/moonpay.config'

export interface MoonPayOptions {
  baseCurrencyAmount?: number
  baseCurrencyCode?: string
  email?: string
  onSuccess?: (transactionId: string) => void
  onClose?: () => void
  onError?: (error: Error) => void
}

export function useMoonPay() {
  const { address } = useAccount()
  const [isOpen, setIsOpen] = useState(false)
  const [moonpayWindow, setMoonpayWindow] = useState<Window | null>(null)

  /**
   * Open MoonPay Buy Widget
   */
  const openBuyWidget = useCallback(
    (options: MoonPayOptions = {}) => {
      if (!address) {
        options.onError?.(new Error('No wallet connected'))
        return
      }

      try {
        const url = buildMoonPayUrl({
          type: 'buy',
          walletAddress: address,
          baseCurrencyAmount: options.baseCurrencyAmount,
          baseCurrencyCode: options.baseCurrencyCode || 'usd',
          email: options.email,
          externalCustomerId: address,
        })

        // Open in popup window
        const width = 500
        const height = 700
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2

        const popup = window.open(
          url,
          'moonpay_buy',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )

        if (popup) {
          setMoonpayWindow(popup)
          setIsOpen(true)
        } else {
          options.onError?.(new Error('Popup blocked. Please allow popups for this site.'))
        }
      } catch (error) {
        options.onError?.(error as Error)
      }
    },
    [address]
  )

  /**
   * Open MoonPay Sell Widget (for merchants)
   */
  const openSellWidget = useCallback(
    (options: MoonPayOptions = {}) => {
      if (!address) {
        options.onError?.(new Error('No wallet connected'))
        return
      }

      try {
        const url = buildMoonPayUrl({
          type: 'sell',
          walletAddress: address,
          baseCurrencyAmount: options.baseCurrencyAmount,
          baseCurrencyCode: options.baseCurrencyCode || 'usd',
          email: options.email,
          externalCustomerId: address,
        })

        // Open in popup window
        const width = 500
        const height = 700
        const left = window.screen.width / 2 - width / 2
        const top = window.screen.height / 2 - height / 2

        const popup = window.open(
          url,
          'moonpay_sell',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )

        if (popup) {
          setMoonpayWindow(popup)
          setIsOpen(true)
        } else {
          options.onError?.(new Error('Popup blocked. Please allow popups for this site.'))
        }
      } catch (error) {
        options.onError?.(error as Error)
      }
    },
    [address]
  )

  /**
   * Close the MoonPay widget
   */
  const closeWidget = useCallback(() => {
    if (moonpayWindow && !moonpayWindow.closed) {
      moonpayWindow.close()
    }
    setMoonpayWindow(null)
    setIsOpen(false)
  }, [moonpayWindow])

  /**
   * Monitor popup window for close events
   */
  useEffect(() => {
    if (!moonpayWindow) return

    const checkClosed = setInterval(() => {
      if (moonpayWindow.closed) {
        setIsOpen(false)
        setMoonpayWindow(null)
        clearInterval(checkClosed)
      }
    }, 500)

    return () => clearInterval(checkClosed)
  }, [moonpayWindow])

  /**
   * Listen for postMessage events from MoonPay widget
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin is from MoonPay
      if (
        !event.origin.includes('moonpay.com') &&
        !event.origin.includes('moonpay.io')
      ) {
        return
      }

      // Handle MoonPay events
      const { type, data } = event.data

      switch (type) {
        case 'transaction_created':
          console.log('[MoonPay] Transaction created:', data)
          break
        case 'transaction_updated':
          console.log('[MoonPay] Transaction updated:', data)
          break
        case 'transaction_completed':
          console.log('[MoonPay] Transaction completed:', data)
          break
        case 'widget_closed':
          closeWidget()
          break
        default:
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [closeWidget])

  return {
    openBuyWidget,
    openSellWidget,
    closeWidget,
    isOpen,
    isConnected: !!address,
  }
}
