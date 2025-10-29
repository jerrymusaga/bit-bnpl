'use client'

import { useState, useEffect, useRef } from 'react'
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
    approveMUSD,
    checkMUSDAllowance,
    isPaymentLate,
    isPaying,
    isApproving,
    isApprovingConfirming,
    isApprovingConfirmed,
    isConfirming,
    isConfirmed,
    isLoading,
    paymentError,
    approvalError,
  } = useInstallmentProcessor()

  const [purchases, setPurchases] = useState<(Purchase & { purchaseId: number; isLate: boolean })[]>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)
  const [payingPurchaseId, setPayingPurchaseId] = useState<number | null>(null)
  const [approvingPurchaseId, setApprovingPurchaseId] = useState<number | null>(null)
  const [needsApproval, setNeedsApproval] = useState<Record<number, boolean>>({})
  const [paymentSuccess, setPaymentSuccess] = useState<number | null>(null)
  const [approvalSuccess, setApprovalSuccess] = useState<number | null>(null)
  const isLoadingRef = useRef(false)
  const lastActivePurchasesRef = useRef<number[]>([])
  const hasLoadedRef = useRef(false)

  // Load purchase details when activePurchases changes
  useEffect(() => {
    const loadPurchaseDetails = async () => {
      // Prevent multiple simultaneous loads
      if (isLoadingRef.current) {
        console.log('⏭️ Already loading, skipping...')
        return
      }

      // Check if purchase IDs actually changed
      const purchaseIdsChanged = JSON.stringify(activePurchases) !== JSON.stringify(lastActivePurchasesRef.current)
      if (hasLoadedRef.current && !purchaseIdsChanged) {
        console.log('⏭️ Purchase IDs unchanged, skipping...')
        return
      }

      console.log('📦 Active purchases from contract:', activePurchases)

      if (activePurchases.length === 0) {
        console.log('ℹ️ No active purchases found')
        setPurchases([])
        setLoadingPurchases(false)
        hasLoadedRef.current = true
        lastActivePurchasesRef.current = []
        return
      }

      console.log(`🔍 Loading details for ${activePurchases.length} purchase(s)...`)
      isLoadingRef.current = true
      setLoadingPurchases(true)
      lastActivePurchasesRef.current = activePurchases

      try {
        const purchaseDetails = await Promise.all(
          activePurchases.map(async (id) => {
            const purchase = await getPurchase(id)
            const late = await isPaymentLate(id)
            console.log(`Purchase #${id}:`, purchase)

            // Check if this purchase needs approval
            if (purchase) {
              const hasAllowance = await checkMUSDAllowance(purchase.amountPerPayment)
              setNeedsApproval(prev => ({ ...prev, [id]: !hasAllowance }))
            }

            return purchase ? { ...purchase, purchaseId: id, isLate: late } : null
          })
        )

        const filteredPurchases = purchaseDetails.filter(Boolean) as Array<Purchase & { purchaseId: number; isLate: boolean }>
        console.log('✅ Loaded purchases:', filteredPurchases)
        setPurchases(filteredPurchases)
        hasLoadedRef.current = true
      } catch (error) {
        console.error('❌ Error loading purchases:', error)
      } finally {
        setLoadingPurchases(false)
        isLoadingRef.current = false
      }
    }

    loadPurchaseDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePurchases])

  // Handle make payment with auto-approval if needed
  const handleMakePayment = async (purchaseId: number) => {
    const purchase = purchases.find(p => p.purchaseId === purchaseId)
    if (!purchase) return

    try {
      // Check if we need approval first
      if (needsApproval[purchaseId]) {
        console.log('🔐 MUSD approval needed, requesting approval first...')
        setApprovingPurchaseId(purchaseId)
        await approveMUSD(purchase.amountPerPayment)
        console.log('✅ Approval transaction submitted, waiting for confirmation...')
        // Payment will be triggered after approval confirms (see useEffect below)
      } else {
        // Already approved, proceed with payment
        console.log('💰 Making payment...')
        setPayingPurchaseId(purchaseId)
        await makePayment(purchaseId)
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      setPayingPurchaseId(null)
      setApprovingPurchaseId(null)
    }
  }

  // Reset paying state when transaction is confirmed and show success
  useEffect(() => {
    if (isConfirmed && payingPurchaseId !== null) {
      console.log('✅ Payment confirmed!')
      setPaymentSuccess(payingPurchaseId)
      setPayingPurchaseId(null)

      // Clear success message after 5 seconds
      const timeout = setTimeout(() => {
        setPaymentSuccess(null)
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [isConfirmed, payingPurchaseId])

  // When approval is confirmed, automatically trigger payment
  useEffect(() => {
    if (isApprovingConfirmed && approvingPurchaseId !== null) {
      console.log('✅ Approval confirmed! Now proceeding with payment...')
      setApprovalSuccess(approvingPurchaseId)
      setNeedsApproval(prev => ({ ...prev, [approvingPurchaseId]: false }))

      // Automatically trigger payment after approval
      const purchaseId = approvingPurchaseId
      setApprovingPurchaseId(null)
      setPayingPurchaseId(purchaseId)

      // Small delay to ensure state updates
      setTimeout(async () => {
        try {
          await makePayment(purchaseId)
          console.log('💰 Payment transaction submitted!')
        } catch (error) {
          console.error('Payment failed after approval:', error)
          setPayingPurchaseId(null)
        }
      }, 100)

      // Clear success message after 5 seconds
      const timeout = setTimeout(() => {
        setApprovalSuccess(null)
      }, 5000)

      return () => clearTimeout(timeout)
    }
  }, [isApprovingConfirmed, approvingPurchaseId, makePayment])

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

                {/* Action Button - Single click approve + pay */}
                <Button
                  variant={isOverdue ? 'danger' : 'accent'}
                  fullWidth
                  onClick={() => handleMakePayment(purchase.purchaseId)}
                  disabled={
                    (approvingPurchaseId === purchase.purchaseId && (isApproving || isApprovingConfirming)) ||
                    (payingPurchaseId === purchase.purchaseId && (isPaying || isConfirming))
                  }
                  loading={
                    (approvingPurchaseId === purchase.purchaseId && (isApproving || isApprovingConfirming)) ||
                    (payingPurchaseId === purchase.purchaseId && (isPaying || isConfirming))
                  }
                >
                  {approvingPurchaseId === purchase.purchaseId && isApproving ? (
                    'Step 1/2: Approving MUSD...'
                  ) : approvingPurchaseId === purchase.purchaseId && isApprovingConfirming ? (
                    'Step 1/2: Confirming Approval...'
                  ) : payingPurchaseId === purchase.purchaseId && isPaying ? (
                    'Step 2/2: Processing Payment...'
                  ) : payingPurchaseId === purchase.purchaseId && isConfirming ? (
                    'Step 2/2: Confirming Payment...'
                  ) : (
                    `Make Payment (${parseFloat(purchase.amountPerPayment).toFixed(2)} MUSD)`
                  )}
                </Button>

                {/* Success Messages */}
                {paymentSuccess === purchase.purchaseId && (
                  <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-400">
                      Payment successful! Your transaction has been confirmed.
                    </p>
                  </div>
                )}
                {approvalSuccess === purchase.purchaseId && !payingPurchaseId && (
                  <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-green-400">
                      MUSD approved! Processing payment automatically...
                    </p>
                  </div>
                )}

                {/* Error Messages */}
                {payingPurchaseId === purchase.purchaseId && paymentError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">
                      {paymentError.message || 'Payment failed. Please try again.'}
                    </p>
                  </div>
                )}
                {approvingPurchaseId === purchase.purchaseId && approvalError && (
                  <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-400">
                      {approvalError.message || 'Approval failed. Please try again.'}
                    </p>
                  </div>
                )}
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
