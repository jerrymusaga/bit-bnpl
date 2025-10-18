'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { useMezoContracts, formatMUSD } from '@/hooks/useMezoContracts'
import { useInstallmentProcessor } from '@/hooks/useInstallmentProcessor'
import { PaymentTimeline } from '@/components/checkout/PaymentTimeline'
import { TransactionProgress } from '@/components/checkout/TransactionProgress'
import { AlertCircle, CheckCircle, TrendingUp, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'

type InstallmentPlan = '1' | '4' | '6' | '8'

export default function CheckoutPage() {
  const { isConnected, address } = useAccount()
  const {
    borrowingCapacity,
    currentDebt,
    btcPrice,
    collateralAmount,
    isLoading: mezoLoading,
  } = useMezoContracts()

  const {
    createPurchase,
    isCreating,
    isConfirming,
    isConfirmed,
    createError,
  } = useInstallmentProcessor()

  const { cart: cartItems, clearCart } = useCart()

  const [paymentComplete, setPaymentComplete] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan>('4')

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal // No tax for crypto payments

  // Calculate available borrowing capacity
  const borrowingCapacityNum = parseFloat(borrowingCapacity)
  const currentDebtNum = parseFloat(currentDebt)
  const availableCapacity = borrowingCapacityNum - currentDebtNum
  const collateralAmountNum = parseFloat(collateralAmount)

  // Check if user can afford this purchase
  const canAfford = availableCapacity >= total

  // Calculate preserved capacity for each plan
  const calculatePreservedCapacity = (plan: InstallmentPlan) => {
    if (plan === '1') return 0 // Pay in full = borrow full amount now

    const installments = parseInt(plan)
    const perPayment = total / installments

    // With installments, user only borrows per-payment amount initially
    // vs borrowing full amount upfront
    return total - perPayment
  }

  // Payment plan calculations
  const paymentPlans: Record<InstallmentPlan, {
    label: string
    payments: number
    perPayment: number
    interest: number
    interestRate: number
    totalCost: number
    preservedCapacity: number
    daysToFirstPayment: number
  }> = {
    '1': {
      label: 'Pay in Full',
      payments: 1,
      perPayment: total,
      interest: 0,
      interestRate: 0,
      totalCost: total,
      preservedCapacity: 0,
      daysToFirstPayment: 0,
    },
    '4': {
      label: '4 Payments',
      payments: 4,
      perPayment: (total * 1.005) / 4, // 0.5% interest
      interest: total * 0.005,
      interestRate: 0.5,
      totalCost: total * 1.005,
      preservedCapacity: calculatePreservedCapacity('4'),
      daysToFirstPayment: 14,
    },
    '6': {
      label: '6 Payments',
      payments: 6,
      perPayment: (total * 1.01) / 6, // 1% interest
      interest: total * 0.01,
      interestRate: 1.0,
      totalCost: total * 1.01,
      preservedCapacity: calculatePreservedCapacity('6'),
      daysToFirstPayment: 14,
    },
    '8': {
      label: '8 Payments',
      payments: 8,
      perPayment: (total * 1.015) / 8, // 1.5% interest
      interest: total * 0.015,
      interestRate: 1.5,
      totalCost: total * 1.015,
      preservedCapacity: calculatePreservedCapacity('8'),
      daysToFirstPayment: 14,
    },
  }

  const activePlan = paymentPlans[selectedPlan]

  // Get merchant address from cart items
  // In production, this would come from the merchant's registration data
  // For demo purposes, use mock address for demo store, or first cart item's merchantId
  const getMerchantAddress = (): string => {
    if (cartItems.length > 0 && cartItems[0].merchantId) {
      // TODO: Look up actual wallet address from merchant registry
      // For now, return a mock address
      return '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    }
    // Default demo merchant address
    return '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
  }

  // Handle checkout
  const handleCheckout = async () => {
    if (!canAfford) {
      alert('Insufficient borrowing capacity. Please add more BTC collateral.')
      return
    }

    if (!address) {
      alert('Please connect your wallet')
      return
    }

    try {
      const merchantAddress = getMerchantAddress()

      console.log('Creating purchase with:', {
        total,
        selectedPlan,
        availableCapacity,
        merchantAddress,
        items: cartItems.length,
      })

      // Create purchase via InstallmentProcessor contract
      // Platform pays merchant instantly from liquidity pool
      // User pays back platform in bi-weekly installments
      await createPurchase(
        merchantAddress,
        total.toString(),
        parseInt(selectedPlan) as 1 | 4 | 6 | 8,
        availableCapacity.toString()
      )

      console.log('Purchase creation initiated - merchant will receive instant payment')
      // Note: Transaction confirmation is handled by isConfirming/isConfirmed from the hook
      // Success page will be shown automatically when transaction confirms (via useEffect)
    } catch (error) {
      console.error('Checkout failed:', error)
      alert(`Checkout failed: ${(error as Error).message}`)
    }
  }

  // Auto-show success page when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && !paymentComplete) {
      setPaymentComplete(true)
      clearCart() // Clear cart after successful purchase
    }
  }, [isConfirmed, paymentComplete, clearCart])

  // Redirect to store if cart is empty
  if (cartItems.length === 0 && !paymentComplete) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-[var(--color-warning-500)] mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Add some products to your cart before checking out
            </p>
            <Link href="/demo">
              <Button variant="accent" size="lg">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

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
            <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-xl text-[var(--text-secondary)] mb-2">
              Your payment has been processed
            </p>
            <p className="text-lg text-[var(--text-muted)] mb-8">
              {selectedPlan === '1'
                ? 'Paid in full with MUSD'
                : `First payment due in ${activePlan.daysToFirstPayment} days`}
            </p>

            {selectedPlan !== '1' && (
              <Card padding="lg" className="mb-8 text-left border-[var(--color-success-500)]/20">
                <div className="flex items-start space-x-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-[var(--color-success-500)]" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Smart Choice!</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      By choosing installments, you preserved <span className="font-semibold text-[var(--color-success-500)]">
                        {formatMUSD(activePlan.preservedCapacity.toString())}
                      </span> of borrowing capacity for other opportunities.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Payment Amount</p>
                    <p className="font-semibold">{formatMUSD(activePlan.perPayment.toString())}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Every</p>
                    <p className="font-semibold">2 Weeks</p>
                  </div>
                </div>
              </Card>
            )}

            <Card padding="lg" className="mb-8 text-left">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.image} {item.name} x{item.quantity}
                    </span>
                    <span>{formatMUSD(item.price.toString())}</span>
                  </div>
                ))}
                <div className="border-t border-[var(--border-color)] pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatMUSD(total.toString())}</span>
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
            <Link
              href="/demo"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 inline-block"
            >
              ← Back to Store
            </Link>
            <h1 className="text-4xl font-bold mb-2">Checkout</h1>
            <p className="text-[var(--text-secondary)]">Complete your purchase with BitBNPL</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order & Payment Plans */}
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
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl">{item.image}</div>
                          <div>
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-[var(--text-muted)]">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatMUSD(item.price.toString())}</p>
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-[var(--border-color)] pt-4 mt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatMUSD(total.toString())}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Plans */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Choose Your Payment Plan</CardTitle>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Select how you&apos;d like to pay - all plans preserve your Bitcoin
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-3">
                    {(Object.keys(paymentPlans) as InstallmentPlan[]).map((plan) => {
                      const planDetails = paymentPlans[plan]
                      const isSelected = selectedPlan === plan

                      return (
                        <div
                          key={plan}
                          onClick={() => setSelectedPlan(plan)}
                          className={`
                            p-4 rounded-lg border-2 cursor-pointer transition-all
                            ${
                              isSelected
                                ? 'border-[var(--color-accent-600)] bg-[var(--color-accent-600)]/5'
                                : 'border-[var(--border-color)] hover:border-[var(--color-accent-600)]/50'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-lg">{planDetails.label}</h4>
                                {plan === '1' && (
                                  <Badge variant="success" size="sm">
                                    0% Interest
                                  </Badge>
                                )}
                                {plan === '4' && (
                                  <Badge variant="accent" size="sm">
                                    Most Popular
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-1">
                                {plan === '1' ? (
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    Pay {formatMUSD(planDetails.totalCost.toString())} today
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                      {formatMUSD(planDetails.perPayment.toString())} every 2 weeks × {planDetails.payments}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                      {planDetails.interestRate}% interest • First payment in {planDetails.daysToFirstPayment} days
                                    </p>
                                  </>
                                )}
                              </div>

                              {/* Value Props */}
                              {plan !== '1' && (
                                <div className="mt-3 flex items-center space-x-2 text-xs">
                                  <div className="flex items-center space-x-1 text-[var(--color-success-500)]">
                                    <Shield className="h-3 w-3" />
                                    <span>Preserves {formatMUSD(planDetails.preservedCapacity.toString())} capacity</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="text-right ml-4">
                              <p className="font-bold text-lg">{formatMUSD(planDetails.totalCost.toString())}</p>
                              {plan !== '1' && (
                                <p className="text-xs text-[var(--text-muted)]">
                                  +{formatMUSD(planDetails.interest.toString())} interest
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Payment Timeline */}
                  {selectedPlan !== '1' && (
                    <div className="mt-4">
                      <PaymentTimeline
                        totalPayments={activePlan.payments}
                        perPayment={activePlan.perPayment}
                        firstPaymentDays={activePlan.daysToFirstPayment}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Summary & CTA */}
            <div className="space-y-6">
              {/* Borrowing Capacity Card */}
              <Card padding="lg" className="border-[var(--color-primary-400)]/30">
                <h3 className="font-semibold mb-4">Your Borrowing Power</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">BTC Collateral</p>
                    <p className="font-semibold">{parseFloat(collateralAmount).toFixed(4)} BTC</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      ${(collateralAmountNum * btcPrice).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Available Capacity</p>
                    <p className="text-xl font-bold text-[var(--color-success-500)]">
                      {formatMUSD(availableCapacity.toString())}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatMUSD(currentDebt)} currently borrowed
                    </p>
                  </div>

                  {selectedPlan !== '1' && (
                    <div className="pt-3 border-t border-[var(--border-color)]">
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">After This Purchase</p>
                      <p className="font-semibold text-[var(--color-success-500)]">
                        {formatMUSD((availableCapacity - activePlan.perPayment).toString())} preserved
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        vs {formatMUSD((availableCapacity - total).toString())} if paid in full
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Value Props */}
              <Card padding="lg" className="bg-[var(--color-accent-600)]/5 border-[var(--color-accent-600)]/20">
                <h3 className="font-semibold mb-3">Why BitBNPL?</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-4 w-4 text-[var(--color-accent-600)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Keep Your Bitcoin</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Never sell BTC - preserve upside potential
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="h-4 w-4 text-[var(--color-accent-600)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Preserve Capacity</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Keep borrowing power for opportunities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-[var(--color-accent-600)] mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Low Interest</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        0.5-1.5% vs 20%+ on credit cards
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Checkout Button */}
              <Card padding="lg">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">Purchase Total</span>
                    <span className="font-semibold">{formatMUSD(total.toString())}</span>
                  </div>
                  {selectedPlan !== '1' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Interest ({activePlan.interestRate}%)</span>
                        <span className="font-semibold">+{formatMUSD(activePlan.interest.toString())}</span>
                      </div>
                      <div className="flex justify-between text-sm pb-3 border-b border-[var(--border-color)]">
                        <span className="text-[var(--text-secondary)]">Per Payment</span>
                        <span className="font-semibold">{formatMUSD(activePlan.perPayment.toString())}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatMUSD(activePlan.totalCost.toString())}</span>
                  </div>

                  {!canAfford && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Insufficient borrowing capacity. Add more BTC collateral.
                    </div>
                  )}

                  {createError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      {createError.message || 'Transaction failed. Please try again.'}
                    </div>
                  )}

                  <Button
                    variant="accent"
                    size="lg"
                    fullWidth
                    onClick={handleCheckout}
                    disabled={!canAfford || isCreating || isConfirming || mezoLoading}
                    loading={isCreating || isConfirming}
                  >
                    {isCreating
                      ? 'Creating Purchase...'
                      : isConfirming
                      ? 'Confirming Transaction...'
                      : 'Complete Purchase'}
                  </Button>

                  <p className="text-xs text-center text-[var(--text-muted)]">
                    Your Bitcoin stays safe. No credit check required.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Progress Modal */}
      <TransactionProgress
        isProcessing={isCreating}
        isConfirming={isConfirming}
        isConfirmed={isConfirmed}
        hasError={!!createError}
        error={createError?.message}
      />
    </main>
  )
}
