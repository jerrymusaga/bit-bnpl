'use client'

import { useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { formatCurrency, formatBTC, formatDate } from '@/lib/mockData'
import { useMezoContracts, formatMUSD } from '@/hooks/useMezoContracts'
import { AddCollateralModal } from '@/components/modals/AddCollateralModal'
import { BorrowMUSDModal } from '@/components/modals/BorrowMUSDModal'
import { RepayMUSDModal } from '@/components/modals/RepayMUSDModal'
import { ActiveInstallments } from '@/components/dashboard/ActiveInstallments'
import { TransactionHistory } from '@/components/dashboard/TransactionHistory'
import { CollateralHealthMeter } from '@/components/dashboard/CollateralHealthMeter'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { BuyBTCButton } from '@/components/onramp'
import { TrendingUp, AlertCircle, Clock, Coins, Wallet, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })

  // Modal states
  const [isAddCollateralOpen, setIsAddCollateralOpen] = useState(false)
  const [isBorrowMUSDOpen, setIsBorrowMUSDOpen] = useState(false)
  const [isRepayMUSDOpen, setIsRepayMUSDOpen] = useState(false)

  // Use real Mezo contract data
  const {
    currentDebt,
    accruedInterest,
    collateralAmount,
    btcPrice,
    liquidationReserve,
    musdBalance,
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
  const accruedInterestNum = parseFloat(accruedInterest)

  // Calculate collateralization ratio using real BTC price from Mezo PriceFeed oracle
  const collateralUSDValue = collateralAmountNum * btcPrice
  const collateralRatio = currentDebtNum > 0
    ? (collateralUSDValue / currentDebtNum) * 100
    : 0

  // Health factor (simplified - should use proper oracle in production)
  const healthFactor = currentDebtNum > 0
    ? collateralUSDValue / (currentDebtNum * 1.1) // 110% minimum
    : 10

  // Member since date (TODO: get from Mezo TroveUpdated event for real trove creation date)
  // For now, show current date if user has collateral, otherwise show placeholder
  const loanCreatedAt = collateralAmountNum > 0 ? new Date() : null

  // Total owed = principal + real accrued interest from Mezo contract
  const totalOwed = currentDebtNum + accruedInterestNum

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-primary-600)] bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-[var(--text-secondary)]">
                Manage your Bitcoin collateral and loans
              </p>
            </div>
            {address && (
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">Connected</p>
                  <p className="text-sm font-mono text-[var(--text-primary)]">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {mezoLoading && (
          <div className="text-center py-12">
            <p className="text-[var(--text-secondary)]">Loading your Mezo data...</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Bitcoin Collateral"
            value={formatBTC(collateralAmountNum)}
            subtitle={formatCurrency(collateralUSDValue)}
            icon={Coins}
            trend={{ value: collateralAmountNum > 0 ? '+100%' : '0%', isPositive: true }}
            color="accent"
          />

          <StatsCard
            title="MUSD Borrowed"
            value={formatMUSD(currentDebt)}
            subtitle="@ 1% APR"
            icon={DollarSign}
            color="primary"
          />

          <StatsCard
            title="MUSD Balance"
            value={formatMUSD(musdBalance)}
            subtitle="In your wallet"
            icon={Wallet}
            color="success"
          />

          <StatsCard
            title="Health Factor"
            value={healthFactor.toFixed(2)}
            subtitle={healthFactor > 1.5 ? 'Healthy' : healthFactor > 1.1 ? 'At Risk' : 'Danger'}
            icon={Activity}
            color={healthFactor > 1.5 ? 'success' : healthFactor > 1.1 ? 'warning' : 'error'}
          />
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
                {/* Summary Banner */}
                {currentDebtNum > 0 ? (
                  <>
                    {/* Collateral Health Meter */}
                    <div className="mb-6">
                      <CollateralHealthMeter
                        collateralRatio={collateralRatio}
                        healthFactor={healthFactor}
                      />
                    </div>
                  </>
                ) : (
                  <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-[var(--color-accent-600)]/10 to-[var(--color-primary-600)]/10 border border-[var(--border-color)]">
                    <div className="text-center">
                      <Wallet className="h-12 w-12 text-[var(--color-accent-600)] mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                        No Active Loan
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-4">
                        Add Bitcoin collateral and borrow MUSD to start shopping with BitBNPL
                      </p>
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => setIsAddCollateralOpen(true)}
                      >
                        Add Bitcoin Collateral
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mt-4">
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">MUSD Principal</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {formatMUSD(currentDebt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Accrued Interest</span>
                    <span className="font-semibold text-[var(--color-accent-600)]">
                      {formatMUSD(accruedInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
                    <span className="text-[var(--text-secondary)]">Total MUSD Owed</span>
                    <span className="font-bold text-lg text-[var(--text-primary)]">
                      {formatMUSD(totalOwed.toString())}
                    </span>
                  </div>
                  {currentDebtNum > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-[var(--border-color)]">
                      <div className="flex items-center space-x-1">
                        <span className="text-[var(--text-secondary)]">Liquidation Reserve</span>
                        <div className="group relative">
                          <AlertCircle className="h-4 w-4 text-[var(--text-muted)] cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg shadow-lg text-xs z-10">
                            <p className="text-[var(--text-secondary)] mb-2">
                              The protocol holds {formatMUSD(liquidationReserve.toString())} from your borrowed amount as a security deposit.
                            </p>
                            <p className="text-[var(--text-muted)]">
                              This reserve is <span className="text-[var(--color-success-500)] font-semibold">returned to you</span> when you fully repay and close your trove.
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold text-[var(--color-warning-500)]">
                        {formatMUSD(liquidationReserve.toString())} (held)
                      </span>
                    </div>
                  )}
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
                  <Button
                    variant="accent"
                    fullWidth
                    onClick={() => setIsRepayMUSDOpen(true)}
                  >
                    Repay MUSD
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setIsBorrowMUSDOpen(true)}
                  >
                    Borrow More MUSD
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Installments */}
            <ActiveInstallments />

            {/* Transaction History - Completed Purchases */}
            <TransactionHistory />
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
                    <Button variant="accent" fullWidth className="group">
                      <span className="flex items-center justify-center space-x-2">
                        <Coins className="h-4 w-4" />
                        <span>Shop with BitBNPL</span>
                      </span>
                    </Button>
                  </Link>

                  <BuyBTCButton
                    variant="primary"
                    size="md"
                    fullWidth
                    onSuccess={() => {
                      // Refresh page after successful BTC purchase
                      window.location.reload()
                    }}
                  />

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setIsAddCollateralOpen(true)}
                    className="group"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <TrendingUp className="h-4 w-4 group-hover:text-[var(--color-success-500)] transition-colors" />
                      <span>Add Bitcoin Collateral</span>
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => setIsBorrowMUSDOpen(true)}
                    className="group"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <DollarSign className="h-4 w-4 group-hover:text-[var(--color-primary-500)] transition-colors" />
                      <span>Borrow More MUSD</span>
                    </span>
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
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wide">
                        Wallet Address
                      </span>
                      <Wallet className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                    <p className="font-mono text-xs text-[var(--text-primary)] break-all">
                      {address}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wide">
                        Wallet Balance
                      </span>
                      <Coins className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : 'Loading...'}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wide">
                        Member Since
                      </span>
                      <Clock className="h-4 w-4 text-[var(--text-muted)]" />
                    </div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {loanCreatedAt ? formatDate(loanCreatedAt) : 'No active trove'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Warning */}
            <Card
              padding="lg"
              className="border-[var(--color-warning-500)]/20 bg-gradient-to-br from-[var(--color-warning-500)]/5 to-transparent"
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-warning-500)]/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-[var(--color-warning-500)]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center space-x-2">
                    <span>Liquidation Risk</span>
                    {healthFactor < 1.5 && healthFactor > 0 && (
                      <Badge variant="warning" size="sm">
                        Monitor Closely
                      </Badge>
                    )}
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Keep your collateral ratio above 110% to avoid liquidation. Add more Bitcoin if BTC price drops.
                  </p>
                  {currentDebtNum > 0 && (
                    <div className="p-2 bg-[var(--bg-card)] rounded border border-[var(--border-color)]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">Liquidation Price</span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          ${((currentDebtNum * 1.1) / collateralAmountNum).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddCollateralModal
        isOpen={isAddCollateralOpen}
        onClose={() => setIsAddCollateralOpen(false)}
      />
      <BorrowMUSDModal
        isOpen={isBorrowMUSDOpen}
        onClose={() => setIsBorrowMUSDOpen(false)}
      />
      <RepayMUSDModal
        isOpen={isRepayMUSDOpen}
        onClose={() => setIsRepayMUSDOpen(false)}
      />
    </main>
  )
}
