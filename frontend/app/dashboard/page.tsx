'use client'

import { useAccount, useBalance } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import {
  mockTransactions,
  formatCurrency,
  formatBTC,
  formatDate
} from '@/lib/mockData'
import { useMezoContracts, formatMUSD } from '@/hooks/useMezoContracts'
import { TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  // Use real Mezo contract data
  const {
    borrowingCapacity,
    currentDebt,
    collateralAmount,
    isLoading: mezoLoading,
  } = useMezoContracts()

  if (!isConnected) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <AlertCircle className="h-16 w-16 text-[var(--color-warning-500)] mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
              <p className="text-[var(--text-secondary)] mb-6">
                Please connect your wallet to view your dashboard and manage your Bitcoin collateral.
              </p>
              <Link href="/">
                <Button variant="accent" size="lg">
                  Go to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Calculate derived values
  const collateralAmountNum = parseFloat(collateralAmount)
  const currentDebtNum = parseFloat(currentDebt)
  const borrowingCapacityNum = parseFloat(borrowingCapacity)
  const availableMUSD = Math.max(0, borrowingCapacityNum - currentDebtNum)

  // Calculate collateralization ratio (collateral / debt * 100)
  // Assuming 1 BTC = $83,333 (approximate from mock data)
  const btcPrice = 83333
  const collateralUSDValue = collateralAmountNum * btcPrice
  const collateralRatio = currentDebtNum > 0
    ? (collateralUSDValue / currentDebtNum) * 100
    : 0

  // Health factor (simplified - should use proper oracle in production)
  const healthFactor = currentDebtNum > 0
    ? collateralUSDValue / (currentDebtNum * 1.1) // 110% minimum
    : 10

  // Mock loan creation date (in production, get from contract events)
  const loanCreatedAt = new Date('2024-09-15T10:30:00Z')

  // Interest calculation (1% APR - simplified)
  const daysSinceCreation = 30 // Mock value
  const accruedInterest = currentDebtNum * 0.01 * (daysSinceCreation / 365)
  const totalOwed = currentDebtNum + accruedInterest

  // Transaction history (still using mock data for now)
  const transactions = mockTransactions

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your Bitcoin collateral and loans
          </p>
        </div>

        {/* Loading State */}
        {mezoLoading && (
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)]">Loading your Mezo data...</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card padding="lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--text-tertiary)]">Bitcoin Collateral</span>
              <TrendingUp className="h-5 w-5 text-[var(--color-success-500)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {formatBTC(collateralAmountNum)}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              {formatCurrency(collateralUSDValue)}
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--text-tertiary)]">MUSD Borrowed</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {formatMUSD(currentDebt)}
            </div>
            <div className="text-sm text-[var(--color-accent-600)]">
              @ 1% APR
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--text-tertiary)]">Available MUSD</span>
            </div>
            <div className="text-2xl font-bold text-[var(--color-success-500)] mb-1">
              {formatMUSD(availableMUSD.toString())}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              {borrowingCapacityNum > 0
                ? ((availableMUSD / borrowingCapacityNum) * 100).toFixed(0)
                : '0'}% available
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--text-tertiary)]">Health Factor</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {healthFactor.toFixed(2)}
            </div>
            <Badge
              variant={healthFactor > 1.5 ? 'success' : healthFactor > 1.1 ? 'warning' : 'error'}
              size="sm"
            >
              {healthFactor > 1.5 ? 'Healthy' : healthFactor > 1.1 ? 'At Risk' : 'Danger'}
            </Badge>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Loan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Loan Position */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Current Loan Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">MUSD Principal</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {formatMUSD(currentDebt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Accrued Interest (1% APR)</span>
                    <span className="font-semibold text-[var(--color-accent-600)]">
                      {formatMUSD(accruedInterest.toString())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Total MUSD Owed</span>
                    <span className="font-bold text-lg text-[var(--text-primary)]">
                      {formatMUSD(totalOwed.toString())}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-[var(--text-secondary)]">Collateralization Ratio</span>
                    <Badge
                      variant={collateralRatio > 200 ? 'success' : collateralRatio > 150 ? 'warning' : 'error'}
                      size="md"
                    >
                      {collateralRatio.toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="accent" fullWidth>
                    Repay MUSD
                  </Button>
                  <Button variant="outline" fullWidth>
                    Borrow More MUSD
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          tx.type === 'purchase' ? 'bg-[var(--color-accent-600)]/10' :
                          tx.type === 'borrow' ? 'bg-[var(--color-primary-600)]/10' :
                          'bg-[var(--color-success-500)]/10'
                        }`}>
                          {tx.status === 'completed' ? (
                            <CheckCircle className={`h-5 w-5 ${
                              tx.type === 'purchase' ? 'text-[var(--color-accent-600)]' :
                              tx.type === 'borrow' ? 'text-[var(--color-primary-400)]' :
                              'text-[var(--color-success-500)]'
                            }`} />
                          ) : (
                            <Clock className="h-5 w-5 text-[var(--color-warning-500)]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">
                            {tx.type === 'purchase' ? tx.product :
                             tx.type === 'borrow' ? 'Borrowed MUSD' :
                             'Loan Repayment'}
                          </p>
                          <p className="text-sm text-[var(--text-muted)]">
                            {formatDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.type === 'repayment' ? 'text-[var(--color-success-500)]' :
                          'text-[var(--text-primary)]'
                        }`}>
                          {tx.type === 'repayment' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <Badge
                          variant={tx.status === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  <Link href="/demo">
                    <Button variant="accent" fullWidth>
                      Shop with BitBNPL
                    </Button>
                  </Link>
                  <Button variant="outline" fullWidth>
                    Add Bitcoin Collateral
                  </Button>
                  <Button variant="outline" fullWidth>
                    Withdraw Available
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  <div>
                    <span className="text-sm text-[var(--text-tertiary)]">Wallet Address</span>
                    <p className="font-mono text-sm text-[var(--text-primary)] mt-1 break-all">
                      {address}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--text-tertiary)]">Wallet Balance</span>
                    <p className="font-semibold text-[var(--text-primary)] mt-1">
                      {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--text-tertiary)]">Member Since</span>
                    <p className="font-semibold text-[var(--text-primary)] mt-1">
                      {formatDate(loanCreatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Warning */}
            <Card padding="lg" className="border-[var(--color-warning-500)]/20">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-[var(--color-warning-500)] mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                    Liquidation Risk
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Keep your collateral ratio above 110% to avoid liquidation. Add more Bitcoin if BTC price drops.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
