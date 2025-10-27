import { useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'

/**
 * Hook to listen for MoonPay transaction updates via postMessage
 *
 * This hook listens for messages from the MoonPay widget popup
 * and can trigger callbacks based on transaction status
 */

export interface MoonPayTransactionEvent {
  type: 'transaction_created' | 'transaction_updated' | 'transaction_completed' | 'transaction_failed' | 'widget_closed'
  data?: {
    id?: string
    status?: string
    currency?: string
    cryptoAmount?: number
    baseCurrencyAmount?: number
    failureReason?: string
  }
}

export interface UseMoonPayNotificationsOptions {
  onTransactionCreated?: (data: any) => void
  onTransactionUpdated?: (data: any) => void
  onTransactionCompleted?: (data: any) => void
  onTransactionFailed?: (data: any) => void
  onWidgetClosed?: () => void
}

export function useMoonPayNotifications(options: UseMoonPayNotificationsOptions = {}) {
  const { address } = useAccount()

  const handleMessage = useCallback(
    (event: MessageEvent<MoonPayTransactionEvent>) => {
      // Verify origin is from MoonPay
      if (
        !event.origin.includes('moonpay.com') &&
        !event.origin.includes('moonpay.io')
      ) {
        return
      }

      const { type, data } = event.data

      console.log(`[MoonPay Notification] ${type}`, data)

      // Call appropriate callback
      switch (type) {
        case 'transaction_created':
          options.onTransactionCreated?.(data)
          break

        case 'transaction_updated':
          options.onTransactionUpdated?.(data)
          break

        case 'transaction_completed':
          options.onTransactionCompleted?.(data)
          // Show success notification
          if (data) {
            showNotification({
              title: 'BTC Purchase Successful!',
              message: `You've received ${data.cryptoAmount} BTC`,
              type: 'success',
            })
          }
          break

        case 'transaction_failed':
          options.onTransactionFailed?.(data)
          // Show error notification
          showNotification({
            title: 'Transaction Failed',
            message: data?.failureReason || 'Please try again',
            type: 'error',
          })
          break

        case 'widget_closed':
          options.onWidgetClosed?.()
          break

        default:
          console.log(`[MoonPay Notification] Unknown event type: ${type}`)
      }
    },
    [options]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  return {
    isListening: true,
    userAddress: address,
  }
}

/**
 * Simple notification function (can be replaced with a toast library)
 */
function showNotification(params: {
  title: string
  message: string
  type: 'success' | 'error' | 'info'
}) {
  // For now, use browser notification
  // In production, replace with a toast library like react-hot-toast
  console.log(`[Notification] ${params.type}: ${params.title} - ${params.message}`)

  // Browser notification (requires permission)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(params.title, {
      body: params.message,
      icon: '/favicon.ico',
    })
  }
}
