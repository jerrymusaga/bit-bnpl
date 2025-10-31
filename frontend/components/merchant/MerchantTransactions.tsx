'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { ShoppingBag, User, CheckCircle, Clock } from 'lucide-react'
import InstallmentProcessorABI from '@/lib/abis/InstallmentProcessor.json'

const INSTALLMENT_PROCESSOR_ADDRESS = (process.env.NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS as `0x${string}`) || '0x78a473F3D3DEC35220E47A45B796CcaB70726439'

interface MerchantPurchase {
  user: string
  purchaseId: number
  amount: string
  amountWithInterest: string
  paymentsTotal: number
  paymentsRemaining: number
  isActive: boolean
}

export function MerchantTransactions() {
  const { address } = useAccount()

  // Fetch all purchases from the contract
  const { data: allPurchasesData, isLoading } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'getAllPurchases',
    args: [BigInt(0), BigInt(1000)], // Get first 1000 purchases
  })

  const formatMUSD = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUSD`
  }

  // Filter purchases for this merchant
  const merchantPurchases: MerchantPurchase[] = []

  if (allPurchasesData && address) {
    const [users, purchaseIds, merchants, amounts, amountsWithInterest, paymentsTotal, paymentsRemaining, isActive] = allPurchasesData as [
      string[],
      bigint[],
      string[],
      bigint[],
      bigint[],
      number[],
      number[],
      boolean[]
    ]

    // Filter for purchases where merchant matches current address
    for (let i = 0; i < merchants.length; i++) {
      if (merchants[i].toLowerCase() === address.toLowerCase()) {
        merchantPurchases.push({
          user: users[i],
          purchaseId: Number(purchaseIds[i]),
          amount: formatUnits(amounts[i], 18),
          amountWithInterest: formatUnits(amountsWithInterest[i], 18),
          paymentsTotal: paymentsTotal[i],
          paymentsRemaining: paymentsRemaining[i],
          isActive: isActive[i],
        })
      }
    }
  }

  // Sort by most recent first (higher purchaseId = more recent)
  merchantPurchases.sort((a, b) => b.purchaseId - a.purchaseId)

  if (isLoading) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>
            <ShoppingBag className="h-5 w-5 inline mr-2" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4 text-center py-8">
            <div className="w-8 h-8 border-4 border-[var(--color-accent-600)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-[var(--text-muted)]">Loading transactions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (merchantPurchases.length === 0) {
    return (
      <Card padding="lg">
        <CardHeader>
          <CardTitle>
            <ShoppingBag className="h-5 w-5 inline mr-2" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4 text-center py-8">
            <ShoppingBag className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-3 opacity-50" />
            <p className="text-[var(--text-muted)]">No transactions yet</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              Purchases will appear here once customers buy from your store
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>
          <ShoppingBag className="h-5 w-5 inline mr-2" />
          Transaction History
        </CardTitle>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          {merchantPurchases.length} total {merchantPurchases.length === 1 ? 'transaction' : 'transactions'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-3">
          {merchantPurchases.map((purchase) => (
            <div
              key={`${purchase.user}-${purchase.purchaseId}`}
              className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors border border-[var(--border-color)]"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-600)]/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-[var(--color-accent-600)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-[var(--text-primary)] truncate">
                      {purchase.user.slice(0, 6)}...{purchase.user.slice(-4)}
                    </p>
                    <Badge
                      variant={purchase.isActive ? 'warning' : 'success'}
                      size="sm"
                    >
                      {purchase.isActive ? (
                        <>
                          <Clock className="h-3 w-3 mr-1" />
                          {purchase.paymentsRemaining}/{purchase.paymentsTotal} payments
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Purchase #{purchase.purchaseId}
                    {purchase.paymentsTotal === 1 && ' • Paid in Full'}
                    {purchase.paymentsTotal > 1 && ` • ${purchase.paymentsTotal} Installments`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--text-primary)]">
                  {formatMUSD(purchase.amount)}
                </p>
                {purchase.paymentsTotal > 1 && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Total: {formatMUSD(purchase.amountWithInterest)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
