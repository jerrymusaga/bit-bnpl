'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { useInstallmentProcessor } from '@/hooks/useInstallmentProcessor'
import { useMerchantDetails } from '@/hooks/useAdminData'
import { CheckCircle, ShoppingCart, Loader2 } from 'lucide-react'
import type { Purchase } from '@/hooks/useInstallmentProcessor'
import { formatMUSD } from '@/hooks/useMezoContracts'

// Component to display individual purchase with merchant name
function PurchaseItem({ purchase, purchaseId }: { purchase: Purchase; purchaseId: number }) {
  const { merchant: merchantData } = useMerchantDetails(purchase.merchant as `0x${string}`)

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-[var(--color-success-500)]/10 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-[var(--color-success-500)]" />
        </div>
        <div>
          <p className="font-medium text-[var(--text-primary)]">
            {merchantData?.businessName || 'Loading...'}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Purchase #{purchaseId}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-[var(--text-primary)]">
          {formatMUSD(purchase.totalAmount)}
        </p>
        <Badge variant="success" size="sm">
          Completed
        </Badge>
      </div>
    </div>
  )
}

export function TransactionHistory() {
  const { userPurchaseCount, getPurchase, isLoading } = useInstallmentProcessor()
  const [completedPurchases, setCompletedPurchases] = useState<Array<Purchase & { purchaseId: number }>>([])
  const [loadingPurchases, setLoadingPurchases] = useState(true)

  // Load all purchases and filter for completed ones
  useEffect(() => {
    const loadCompletedPurchases = async () => {
      if (userPurchaseCount === 0) {
        setCompletedPurchases([])
        setLoadingPurchases(false)
        return
      }

      console.log('📜 Loading transaction history...')
      setLoadingPurchases(true)

      const allPurchaseDetails = await Promise.all(
        Array.from({ length: userPurchaseCount }, (_, i) => i).map(async (id) => {
          const purchase = await getPurchase(id)
          return purchase ? { ...purchase, purchaseId: id } : null
        })
      )

      // Filter for completed purchases (not active = completed or paid in full)
      const completed = allPurchaseDetails.filter(
        (p) => p && !p.isActive
      ) as Array<Purchase & { purchaseId: number }>

      console.log('✅ Loaded completed purchases:', completed)
      setCompletedPurchases(completed)
      setLoadingPurchases(false)
    }

    loadCompletedPurchases()
  }, [userPurchaseCount, getPurchase])

  if (isLoading || loadingPurchases) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--text-muted)]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (completedPurchases.length === 0) {
    return null // Don't show section if no completed purchases
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-3">
          {completedPurchases.map((purchase) => (
            <PurchaseItem
              key={purchase.purchaseId}
              purchase={purchase}
              purchaseId={purchase.purchaseId}
            />
          ))}
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
          <div className="flex items-start space-x-2">
            <ShoppingCart className="h-4 w-4 text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--text-secondary)]">
              <p className="font-semibold mb-1">Your Purchase History</p>
              <p>All completed purchases are shown here. Active installment plans are shown above.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
