'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { mockUserCollateral, formatCurrency, formatMUSD } from '@/lib/mockData'
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { isConnected } = useAccount()
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'full' | '3' | '6' | '12'>('full')

  // Mock cart data (in real app, this would come from global state/context)
  const cartItems = [
    { id: '1', name: 'MacBook Pro 14"', price: 1999, quantity: 1 },
    { id: '2', name: 'AirPods Pro', price: 249, quantity: 1 },
  ]

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const collateral = mockUserCollateral
  const canAfford = collateral.musdAvailable >= total

  // Payment plan calculations
  const paymentPlans = {
    full: {
      label: 'Pay in Full',
      months: 0,
      monthlyPayment: total,
      totalInterest: 0,
      totalCost: total,
    },
    '3': {
      label: 'Split in 3 months',
      months: 3,
      monthlyPayment: (total * (1 + 0.01 * 0.25)) / 3, // 0.25% interest (1% annual / 4)
      totalInterest: total * 0.01 * 0.25,
      totalCost: total * (1 + 0.01 * 0.25),
    },
    '6': {
      label: 'Split in 6 months',
      months: 6,
      monthlyPayment: (total * (1 + 0.01 * 0.5)) / 6, // 0.5% interest (1% annual / 2)
      totalInterest: total * 0.01 * 0.5,
      totalCost: total * (1 + 0.01 * 0.5),
    },
    '12': {
      label: 'Split in 12 months',
      months: 12,
      monthlyPayment: (total * (1 + 0.01)) / 12, // 1% interest (1% annual)
      totalInterest: total * 0.01,
      totalCost: total * (1 + 0.01),
    },
  }

  const activePlan = paymentPlans[selectedPlan]

  if (!isConnected) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-[var(--color-warning-500)] mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Connect Wallet to Checkout</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Please connect your wallet to proceed with BitBNPL checkout
            </p>
            <Link href="/demo">
              <Button variant="outline" size="lg">
                Back to Store
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (paymentComplete) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-20 w-20 text-[var(--color-success-500)] mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Your order has been placed and will be delivered soon
            </p>
            <Card padding="lg" className="mb-8 text-left">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-[var(--border-color)] pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </Card>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button variant="accent" size="lg">
                  View Dashboard
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/demo" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 inline-block">
              ← Back to Store
            </Link>
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-[var(--text-secondary)]">
              Complete your purchase with BitBNPL
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Items */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg"
                      >
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            {item.name}
                          </h3>
                          <p className="text-sm text-[var(--text-muted)]">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[var(--text-primary)]">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-2 border-t border-[var(--border-color)] pt-4">
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[var(--text-secondary)]">
                      <span>Tax (8%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-color)]">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BitBNPL Info */}
              <Card padding="lg" className="bg-[var(--color-accent-600)]/5">
                <div className="flex items-start space-x-4">
                  <CreditCard className="h-6 w-6 text-[var(--color-accent-600)] mt-1" />
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                      Pay with BitBNPL
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                      This purchase will be paid using MUSD borrowed against your Bitcoin collateral at only 1% APR.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-muted)]">Interest (1 year):</span>
                        <p className="font-semibold text-[var(--color-accent-600)]">
                          {formatCurrency(total * 0.01)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Traditional BNPL:</span>
                        <p className="font-semibold text-[var(--text-muted)] line-through">
                          {formatCurrency(total * 0.20)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Payment */}
            <div className="space-y-6">
              {/* Collateral Status */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Your BitBNPL Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-4">
                    <div>
                      <span className="text-sm text-[var(--text-tertiary)]">Available MUSD</span>
                      <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                        {formatMUSD(collateral.musdAvailable)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-[var(--text-tertiary)]">Current Borrowed</span>
                      <p className="text-lg font-semibold text-[var(--text-primary)] mt-1">
                        {formatMUSD(collateral.musdBorrowed)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-[var(--text-tertiary)]">Health Factor</span>
                      <div className="mt-1">
                        <Badge variant="success" size="md">
                          {collateral.healthFactor.toFixed(2)} - Healthy
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Plan Selection */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Choose Payment Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-3">
                    {/* Pay in Full */}
                    <button
                      onClick={() => setSelectedPlan('full')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPlan === 'full'
                          ? 'border-[var(--color-accent-600)] bg-[var(--color-accent-600)]/10'
                          : 'border-[var(--border-color)] hover:border-[var(--border-color-light)]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[var(--text-primary)]">Pay in Full</span>
                        <Badge variant="success" size="sm">0% Interest</Badge>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatMUSD(paymentPlans.full.totalCost)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Due today</p>
                    </button>

                    {/* 3 Months */}
                    <button
                      onClick={() => setSelectedPlan('3')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPlan === '3'
                          ? 'border-[var(--color-accent-600)] bg-[var(--color-accent-600)]/10'
                          : 'border-[var(--border-color)] hover:border-[var(--border-color-light)]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[var(--text-primary)]">3 Monthly Payments</span>
                        <Badge variant="accent" size="sm">0.25% Interest</Badge>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatMUSD(paymentPlans['3'].monthlyPayment)}<span className="text-sm">/mo</span>
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Total: {formatMUSD(paymentPlans['3'].totalCost)}
                      </p>
                    </button>

                    {/* 6 Months */}
                    <button
                      onClick={() => setSelectedPlan('6')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPlan === '6'
                          ? 'border-[var(--color-accent-600)] bg-[var(--color-accent-600)]/10'
                          : 'border-[var(--border-color)] hover:border-[var(--border-color-light)]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[var(--text-primary)]">6 Monthly Payments</span>
                        <Badge variant="accent" size="sm">0.5% Interest</Badge>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatMUSD(paymentPlans['6'].monthlyPayment)}<span className="text-sm">/mo</span>
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Total: {formatMUSD(paymentPlans['6'].totalCost)}
                      </p>
                    </button>

                    {/* 12 Months */}
                    <button
                      onClick={() => setSelectedPlan('12')}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPlan === '12'
                          ? 'border-[var(--color-accent-600)] bg-[var(--color-accent-600)]/10'
                          : 'border-[var(--border-color)] hover:border-[var(--border-color-light)]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[var(--text-primary)]">12 Monthly Payments</span>
                        <Badge variant="accent" size="sm">1% Interest</Badge>
                      </div>
                      <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {formatMUSD(paymentPlans['12'].monthlyPayment)}<span className="text-sm">/mo</span>
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Total: {formatMUSD(paymentPlans['12'].totalCost)}
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Confirm Payment Button */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Confirm Purchase</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    {/* Selected Plan Summary */}
                    <div className="bg-[var(--bg-secondary)] p-4 rounded-lg mb-4">
                      <p className="text-sm text-[var(--text-muted)] mb-2">Your Plan:</p>
                      <p className="font-semibold text-[var(--text-primary)]">{activePlan.label}</p>
                      {activePlan.months > 0 && (
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {activePlan.months} payments of {formatMUSD(activePlan.monthlyPayment)}
                        </p>
                      )}
                      <div className="flex justify-between mt-3 pt-3 border-t border-[var(--border-color)]">
                        <span className="text-sm text-[var(--text-muted)]">Total Interest:</span>
                        <span className="text-sm font-semibold text-[var(--color-accent-600)]">
                          {formatMUSD(activePlan.totalInterest)}
                        </span>
                      </div>
                    </div>

                    {canAfford ? (
                      <>
                        <Button
                          variant="accent"
                          size="lg"
                          fullWidth
                          onClick={() => {
                            // Simulate payment processing
                            setTimeout(() => {
                              setPaymentComplete(true)
                            }, 1500)
                          }}
                        >
                          <CreditCard className="h-5 w-5 mr-2" />
                          Confirm & Pay with MUSD
                        </Button>
                        <p className="text-xs text-[var(--text-muted)] text-center mt-3">
                          Secured by your Bitcoin collateral
                        </p>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="lg" fullWidth disabled>
                          Insufficient MUSD Available
                        </Button>
                        <Link href="/dashboard">
                          <Button variant="accent" size="sm" fullWidth className="mt-3">
                            Add Bitcoin Collateral
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Info */}
              <Card padding="md" className="border-[var(--color-success-500)]/20">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-[var(--color-success-500)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Your Bitcoin remains yours. Payments are backed by collateral, not credit.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
