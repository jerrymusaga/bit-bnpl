'use client'

import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import {
  mockMerchantStats,
  mockMerchantTransactions,
  formatMUSD,
  formatDate
} from '@/lib/mockData'
import { DollarSign, ShoppingCart, TrendingUp, Users, Download } from 'lucide-react'

export default function MerchantPage() {
  const { address, isConnected } = useAccount()

  const stats = mockMerchantStats
  const transactions = mockMerchantTransactions

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Merchant Dashboard</h1>
            <p className="text-[var(--text-secondary)]">
              Track your BitBNPL transactions and revenue
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="accent">
              Integration Docs
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card padding="lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--text-tertiary)]">Total Revenue</span>
              <DollarSign className="h-5 w-5 text-[var(--color-success-500)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {formatMUSD(stats.totalRevenue)}
            </div>
            <div className="text-sm text-[var(--color-success-500)]">
              +12.5% from last month
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--text-tertiary)]">Total Transactions</span>
              <ShoppingCart className="h-5 w-5 text-[var(--color-accent-600)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {stats.totalTransactions}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Across all products
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--text-tertiary)]">Average Order</span>
              <TrendingUp className="h-5 w-5 text-[var(--color-primary-400)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {formatMUSD(stats.averageOrderValue)}
            </div>
            <div className="text-sm text-[var(--text-muted)]">
              Per transaction
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-[var(--text-tertiary)]">Conversion Rate</span>
              <Users className="h-5 w-5 text-[var(--color-warning-500)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {stats.conversionRate}%
            </div>
            <div className="text-sm text-[var(--color-success-500)]">
              +3.2% improvement
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-[var(--text-primary)]">
                            {tx.product}
                          </p>
                          <Badge
                            variant={
                              tx.status === 'completed' ? 'success' :
                              tx.status === 'pending' ? 'warning' :
                              'error'
                            }
                            size="sm"
                          >
                            {tx.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-[var(--text-muted)] font-mono">
                            {tx.buyer.slice(0, 8)}...{tx.buyer.slice(-6)}
                          </p>
                          <p className="text-sm text-[var(--text-tertiary)]">
                            {formatDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <p className="font-semibold text-[var(--text-primary)]">
                          {formatMUSD(tx.amount)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Fee: {formatMUSD(tx.fee)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Integration Guide */}
            <Card padding="lg" variant="elevated">
              <CardHeader>
                <CardTitle>How to Integrate BitBNPL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-600)] text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                        Install the SDK
                      </h4>
                      <code className="text-sm bg-[var(--bg-secondary)] px-2 py-1 rounded">
                        npm install @bitbnpl/sdk
                      </code>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-600)] text-white flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                        Add Payment Button
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Drop the BitBNPL button into your checkout page
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-600)] text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                        Receive MUSD
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Get paid in MUSD instantly, settle to USD anytime
                      </p>
                    </div>
                  </div>

                  <Button variant="accent" fullWidth className="mt-4">
                    View Full Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Account Balance */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Account Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  <div>
                    <span className="text-sm text-[var(--text-tertiary)]">Available Balance</span>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                      {formatMUSD(8750.50)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-[var(--text-tertiary)]">Pending Settlement</span>
                    <p className="text-lg font-semibold text-[var(--text-primary)] mt-1">
                      {formatMUSD(1250.00)}
                    </p>
                  </div>
                  <Button variant="accent" fullWidth>
                    Withdraw MUSD
                  </Button>
                  <Button variant="outline" fullWidth>
                    Settlement History
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fee Breakdown */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Fee Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                    <span className="text-sm text-[var(--text-secondary)]">Platform Fee</span>
                    <span className="font-semibold text-[var(--text-primary)]">2.5%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border-color)]">
                    <span className="text-sm text-[var(--text-secondary)]">Total Fees (This Month)</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {formatMUSD(115.20)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-[var(--text-secondary)]">Avg Fee per Transaction</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {formatMUSD(28.80)}
                    </span>
                  </div>
                  <div className="bg-[var(--bg-secondary)] p-3 rounded-lg mt-4">
                    <p className="text-xs text-[var(--text-muted)]">
                      Save 40-60% vs traditional payment processors
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card padding="lg" className="border-[var(--color-success-500)]/20">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-[var(--color-success-500)] mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                    Zero Chargebacks
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)]">
                    BitBNPL payments are backed by Bitcoin collateral, eliminating chargeback risk entirely.
                  </p>
                </div>
              </div>
            </Card>

            {/* Merchant Info */}
            {isConnected && (
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Merchant Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-3">
                    <div>
                      <span className="text-sm text-[var(--text-tertiary)]">Wallet Address</span>
                      <p className="font-mono text-xs text-[var(--text-primary)] mt-1 break-all">
                        {address}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-[var(--text-tertiary)]">Account Status</span>
                      <div className="mt-1">
                        <Badge variant="success" size="sm">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
