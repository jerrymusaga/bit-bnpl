'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { useInstallmentProcessor } from '@/hooks/useInstallmentProcessor'
import { AlertCircle, Clock, CheckCircle2, Calendar, TrendingUp, Loader2 } from 'lucide-react'
import type { Purchase } from '@/hooks/useInstallmentProcessor'

export function ActiveInstallments() {
  const {
    activePurchases,
    totalOwed,
    getPurchase,
    makePayment,
    isPaymentLate,
    isPaying,
    isConfirming,
    isConfirmed,
    isLoading,
  } = useInstallmentProcessor()

  const [purchases, setPurchases] = useState<(Purchase & { purchaseId: number; isLate: boolean })[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const [payingPurchaseId, setPayingPurchaseId] = useState<number | null>(null)

  // Load purchase details when activePurchases changes
  useEffect(() => {
    const loadPurchaseDetails = async () => {
      if (activePurchases.length === 0) {
        setPurchases([])
        setLoadingPurchases(false)
        return
      }

      setLoadingPurchases(true)
      const purchaseDetails = await Promise.all(
        activePurchases.map(async (id) => {
          const purchase = await getPurchase(id)
          const late = await isPaymentLate(id)
          return purchase ? { ...purchase, purchaseId: id, isLate: late } : null
        })
      )

      setPurchases(purchaseDetails.filter(Boolean) as Array<Purchase & { purchaseId: number; isLate: boolean }>)
      setLoadingPurchases(false)
    }

    loadPurchaseDetails()
  }, [activePurchases, getPurchase, isPaymentLate])

  // Handle make payment
  const handleMakePayment = async (purchaseId: number) => {
    setPayingPurchaseId(purchaseId)
    try {
      await makePayment(purchaseId)
    } catch (error) {
      console.error('Payment failed:', error)
      setPayingPurchaseId(null)
    }
  }

  // Reset paying state when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setPayingPurchaseId(null)
    }
  }, [isConfirmed])

  // Helper to calculate days until due
  const getDaysUntilDue = (dueTimestamp: number): number => {
    const now = Math.floor(Date.now() / 1000)
    const secondsUntil = dueTimestamp - now
    return Math.ceil(secondsUntil / (24 * 60 * 60))
  }

  // Helper to format date
  const formatDueDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Helper to get interest rate
  const getInterestRate = (paymentsTotal: number): string => {
    const rates: Record<number, string> = {
      1: '0%',
      4: '0.5%',
      6: '1.0%',
      8: '1.5%',
    }
    return rates[paymentsTotal] || '0%'
  }

  if (isLoading || loadingPurchases) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Active Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--text-muted)]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (purchases.length === 0) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Active Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-[var(--color-success-500)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)] mb-2">No active installments</p>
            <p className="text-sm text-[var(--text-muted)]">
              Make a purchase to start paying in installments
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Installments</CardTitle>
          {parseFloat(totalOwed) > 0 && (
            <div className="text-right">
              <p className="text-sm text-[var(--text-muted)]">Total Owed</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">
                {parseFloat(totalOwed).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                MUSD
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const daysUntil = getDaysUntilDue(purchase.nextPaymentDue)
            const isOverdue = daysUntil < 0
            const paymentsMade = purchase.paymentsTotal - purchase.paymentsRemaining
            const progress = (paymentsMade / purchase.paymentsTotal) * 100

            return (
              <div
                key={purchase.purchaseId}
                className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--bg-secondary)] hover:border-[var(--color-accent-600)] transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                      Purchase #{purchase.purchaseId}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      Merchant: {purchase.merchant.slice(0, 6)}...{purchase.merchant.slice(-4)}
                    </p>
                  </div>
                  <Badge
                    variant={purchase.isLate ? 'error' : 'success'}
                    size="sm"
                  >
                    {paymentsMade} of {purchase.paymentsTotal} paid
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-[var(--bg-primary)] rounded-full h-2">
                    <div
                      className="bg-[var(--color-accent-600)] h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Total Amount</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {parseFloat(purchase.totalAmount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      MUSD
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Per Payment</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {parseFloat(purchase.amountPerPayment).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      MUSD
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Interest Rate</p>
                    <p className="text-sm font-semibold text-[var(--color-success-500)]">
                      {getInterestRate(purchase.paymentsTotal)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Next Payment</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {formatDueDate(purchase.nextPaymentDue)}
                    </p>
                  </div>
                </div>

                {/* Late Fees Warning */}
                {parseFloat(purchase.lateFees) > 0 && (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded mb-3 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">
                      Late fee: {parseFloat(purchase.lateFees).toFixed(2)} MUSD (1%)
                    </p>
                  </div>
                )}

                {/* Due Date Warning */}
                {isOverdue ? (
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded mb-3 flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">
                      Payment is {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} overdue
                    </p>
                  </div>
                ) : daysUntil <= 3 && (
                  <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded mb-3 flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <p className="text-xs text-yellow-400">
                      Payment due in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  variant={isOverdue ? 'danger' : 'accent'}
                  fullWidth
                  onClick={() => handleMakePayment(purchase.purchaseId)}
                  disabled={isPaying || isConfirming}
                  loading={payingPurchaseId === purchase.purchaseId && (isPaying || isConfirming)}
                >
                  {payingPurchaseId === purchase.purchaseId && isPaying ? (
                    'Processing...'
                  ) : payingPurchaseId === purchase.purchaseId && isConfirming ? (
                    'Confirming...'
                  ) : (
                    `Make Payment (${parseFloat(purchase.amountPerPayment).toFixed(2)} MUSD)`
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-300">
              <p className="font-semibold mb-1">Payment Schedule</p>
              <p>Payments are due bi-weekly (every 2 weeks). Late payments incur a 1% fee after a 1-week grace period.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
