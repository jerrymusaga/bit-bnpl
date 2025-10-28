'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useSearchParams } from 'next/navigation'
import { parseUnits } from 'viem'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { useMezoContracts, formatMUSD } from '@/hooks/useMezoContracts'
import { useInstallmentProcessor } from '@/hooks/useInstallmentProcessor'
import { useMerchantDetails } from '@/hooks/useAdminData'
import { PaymentTimeline } from '@/components/checkout/PaymentTimeline'
import { TransactionProgress } from '@/components/checkout/TransactionProgress'
import { AlertCircle, CheckCircle, TrendingUp, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { useCart, CartItem } from '@/contexts/CartContext'
import MUSDDeployment from '@mezo-org/musd-contracts/deployments/matsnet/MUSD.json'

type InstallmentPlan = '1' | '4' | '6' | '8'

export default function CheckoutPage() {
  const { isConnected, address } = useAccount()
  const searchParams = useSearchParams()
  const {
    borrowingCapacity,
    currentDebt,
    btcPrice,
    collateralAmount,
    musdBalance,
    isLoading: mezoLoading,
  } = useMezoContracts()

  const {
    createPurchase,
    isCreating,
    isConfirming,
    isConfirmed,
    createError,
    createHash,
  } = useInstallmentProcessor()

  // MUSD approval for pay in full
  const {
    writeContract: approveWrite,
    data: approveHash,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract()

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  const { cart: cartItems, clearCart, addToCart } = useCart()

  const [paymentComplete, setPaymentComplete] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<InstallmentPlan>('4')
  const [urlMerchant, setUrlMerchant] = useState<string | null>(null)
  const [merchantVerificationError, setMerchantVerificationError] = useState<string | null>(null)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [completedPurchase, setCompletedPurchase] = useState<{
    items: CartItem[]
    total: number
    plan: InstallmentPlan
  } | null>(null)
  const [urlItemAdded, setUrlItemAdded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Mark as initialized after mount to ensure cart has loaded from localStorage
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // Verify merchant if coming from URL
  const merchantAddress = urlMerchant || (cartItems[0]?.merchantId as `0x${string}`) || null
  const { merchant: merchantInfo } = useMerchantDetails(merchantAddress as `0x${string}` | undefined)

  // Handle URL parameters AND sessionStorage for direct merchant integration
  useEffect(() => {
    // Wait for initialization to ensure cart has loaded from localStorage
    if (!isInitialized) return

    // Only run once to prevent infinite loop
    if (urlItemAdded) return

    // Check sessionStorage first (from widget), then fall back to URL params
    let merchant = searchParams.get('merchant')
    let amount = searchParams.get('amount')
    let itemName = searchParams.get('itemName') || searchParams.get('item')
    let itemId = searchParams.get('itemId') || searchParams.get('id')
    let itemImage = searchParams.get('itemImage') || searchParams.get('image') || '🛍️'
    let merchantName = searchParams.get('merchantName') || 'Merchant'

    // Try to read from sessionStorage if URL params not present
    if (!merchant || !amount) {
      try {
        const sessionData = sessionStorage.getItem('bitbnpl_checkout_data')
        if (sessionData) {
          const data = JSON.parse(sessionData)
          // Use sessionStorage data if it's fresh (within last 5 minutes)
          if (data.timestamp && Date.now() - data.timestamp < 5 * 60 * 1000) {
            merchant = data.merchant
            amount = data.amount
            itemName = data.itemName || 'Product'
            itemId = data.itemId
            itemImage = data.itemImage || '🛍️'
            merchantName = data.merchantName || 'Merchant'

            // Clear sessionStorage after reading
            sessionStorage.removeItem('bitbnpl_checkout_data')
          }
        }
      } catch (error) {
        console.error('Failed to read checkout data from sessionStorage:', error)
      }
    }

    if (merchant && amount && itemName) {
      // Validate merchant address format
      if (!merchant.startsWith('0x') || merchant.length !== 42) {
        setMerchantVerificationError('Invalid merchant address format')
        setUrlItemAdded(true) // Prevent retrying
        return
      }

      // Store merchant address for verification
      setUrlMerchant(merchant)

      // Check if item is already in cart (from localStorage)
      const itemExists = cartItems.some(item =>
        item.id === itemId && item.merchantId === merchant
      )

      // Only add if not already in cart
      if (!itemExists) {
        const priceNum = parseFloat(amount)
        if (!isNaN(priceNum)) {
          addToCart({
            id: itemId || `url-item-${Date.now()}`,
            name: itemName,
            price: priceNum,
            image: itemImage,
            merchantId: merchant,
            merchantName: merchantName,
          })
        }
      }

      setUrlItemAdded(true) // Mark as added to prevent re-adding

      // Clear URL params to prevent re-adding on refresh
      window.history.replaceState({}, '', '/checkout')
    }
  }, [searchParams, addToCart, urlItemAdded, isInitialized, cartItems])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal // No tax for crypto payments

  // Get user's MUSD balance
  const musdBalanceNum = parseFloat(musdBalance)

  // Calculate available borrowing capacity
  const borrowingCapacityNum = parseFloat(borrowingCapacity)
  const currentDebtNum = parseFloat(currentDebt)
  const availableCapacity = borrowingCapacityNum - currentDebtNum
  const collateralAmountNum = parseFloat(collateralAmount)

  // Check payment options available
  const canPayInFull = musdBalanceNum >= total // Can pay with MUSD balance
  // For installments: check if total borrowing capacity (from collateral) covers the purchase
  // Contract checks userBorrowingCapacity >= amount, not available capacity
  const canUseInstallments = borrowingCapacityNum >= total // Can use BNPL (needs collateral)

  // Check if user can afford based on selected plan
  const canAffordSelectedPlan = selectedPlan === '1' ? canPayInFull : canUseInstallments
  const canAfford = canPayInFull || canUseInstallments // For general error message

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

  // Get merchant address from URL params or cart items
  const getMerchantAddress = (): string | null => {
    // Priority 1: URL parameter (direct merchant integration)
    if (urlMerchant) {
      return urlMerchant
    }

    // Priority 2: Cart item's merchantId (the merchant's registered wallet address)
    if (cartItems.length > 0 && cartItems[0].merchantId) {
      return cartItems[0].merchantId
    }

    // No merchant address available
    return null
  }

  // Handle MUSD approval for pay in full
  const handleApprove = async () => {
    if (!address) return

    const MUSD_ADDRESS = process.env.NEXT_PUBLIC_MUSD_ADDRESS as `0x${string}`
    const INSTALLMENT_PROCESSOR_ADDRESS = process.env.NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS as `0x${string}`

    // Approve max amount to avoid needing approval again
    const maxApproval = parseUnits('1000000', 18) // 1M MUSD

    approveWrite({
      address: MUSD_ADDRESS,
      abi: MUSDDeployment.abi,
      functionName: 'approve',
      args: [INSTALLMENT_PROCESSOR_ADDRESS, maxApproval],
    })
  }

  // Auto-proceed to purchase after approval confirms
  useEffect(() => {
    if (isApproveConfirmed && needsApproval) {
      setNeedsApproval(false)
      // Trigger checkout again
      handleCheckout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isApproveConfirmed, needsApproval])

  // Handle checkout
  const handleCheckout = async () => {
    if (!canAffordSelectedPlan || !address) {
      return // Error messages already shown inline
    }

    const merchantAddress = getMerchantAddress()
    if (!merchantAddress) {
      return // Shouldn't happen if cart has items, but safety check
    }

    // If paying in full, check if approval is needed
    if (selectedPlan === '1') {
      // For pay in full, need MUSD approval first
      if (!isApproveConfirmed && !needsApproval) {
        setNeedsApproval(true)
        await handleApprove()
        return // Will continue after approval confirms
      }
    }

    // Create purchase via InstallmentProcessor contract
    // Pass total borrowing capacity (from collateral), not available capacity
    await createPurchase(
      merchantAddress,
      total.toString(),
      parseInt(selectedPlan) as 1 | 4 | 6 | 8,
      borrowingCapacity
    )

    // Note: Transaction confirmation is handled by isConfirming/isConfirmed from the hook
    // Success page will be shown automatically when transaction confirms (via useEffect)
    // Errors are displayed via createError state in the UI
  }

  // Auto-show success page when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && !paymentComplete) {
      console.log('✅ Purchase confirmed! Transaction successful')
      // Save purchase details before clearing cart
      setCompletedPurchase({
        items: cartItems,
        total: total,
        plan: selectedPlan,
      })
      setPaymentComplete(true)
      clearCart() // Clear cart after successful purchase
    }
  }, [isConfirmed, paymentComplete, clearCart, cartItems, total, selectedPlan])

  // Log transaction states for debugging
  useEffect(() => {
    if (isCreating) console.log('🔄 Creating purchase transaction...')
    if (isConfirming) console.log('⏳ Waiting for transaction confirmation...')
    if (createError) console.error('❌ Create purchase error:', createError)
  }, [isCreating, isConfirming, createError])

  // Check if merchant is verified
  const isMerchantVerified = merchantInfo?.isVerified && merchantInfo?.isActive

  // Show merchant verification error
  if (merchantVerificationError || (merchantInfo && !isMerchantVerified)) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Merchant Not Verified</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              {merchantVerificationError ||
                'This merchant is not verified on BitBNPL. Only verified merchants can accept payments.'}
            </p>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-6">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Security: Only shop with verified merchants to ensure payment protection.
            </div>
            <Link href="/marketplace">
              <Button variant="accent" size="lg">
                Browse Verified Merchants
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

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
    // If no completed purchase data, redirect to demo
    if (!completedPurchase) {
      return (
        <main className="min-h-screen py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <CheckCircle className="h-20 w-20 text-[var(--color-success-500)] mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Order Confirmed!</h1>
              <p className="text-xl text-[var(--text-secondary)] mb-8">
                Your payment has been processed successfully
              </p>
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

    // Calculate completed purchase details
    const completedTotal = completedPurchase.total
    const completedPlan = completedPurchase.plan
    const completedPlanDetails = paymentPlans[completedPlan]

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
              {completedPlan === '1'
                ? 'Paid in full with MUSD'
                : `First payment due in ${completedPlanDetails.daysToFirstPayment} days`}
            </p>

            {completedPlan !== '1' && (
              <Card padding="lg" className="mb-8 text-left border-[var(--color-success-500)]/20">
                <div className="flex items-start space-x-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-[var(--color-success-500)]" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Smart Choice!</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      By choosing installments, you preserved <span className="font-semibold text-[var(--color-success-500)]">
                        {formatMUSD(completedPlanDetails.preservedCapacity.toString())}
                      </span> of borrowing capacity for other opportunities.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--border-color)]">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Payment Amount</p>
                    <p className="font-semibold">{formatMUSD(completedPlanDetails.perPayment.toString())}</p>
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
                {completedPurchase.items.map((item) => (
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
                    <span>{formatMUSD(completedTotal.toString())}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Transaction Hash */}
            {createHash && (
              <Card padding="lg" className="bg-[var(--bg-secondary)]">
                <div className="space-y-2">
                  <p className="text-sm text-[var(--text-secondary)]">Transaction Hash</p>
                  <a
                    href={`https://explorer.test.mezo.org/tx/${createHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono text-[var(--color-accent-600)] hover:text-[var(--color-accent-500)] break-all flex items-center gap-2"
                  >
                    {createHash}
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <p className="text-xs text-[var(--text-muted)]">View on Mezo Explorer</p>
                </div>
              </Card>
            )}

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

                  {/* Educational guidance when user cannot afford */}
                  {!canAfford && (
                    <div className="space-y-3">
                      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <p className="text-sm font-semibold text-orange-300">
                              {collateralAmountNum === 0 && musdBalanceNum === 0
                                ? "Let's Get You Started with BitBNPL"
                                : selectedPlan === '1'
                                ? "Need More MUSD"
                                : "Need BTC Collateral for Installments"}
                            </p>
                            <p className="text-xs text-[var(--text-secondary)]">
                              {collateralAmountNum === 0 && musdBalanceNum === 0
                                ? "To use BitBNPL, you'll need either MUSD tokens or Bitcoin collateral. Here's how to get started:"
                                : selectedPlan === '1'
                                ? `You need ${formatMUSD(total.toString())} MUSD but currently have ${formatMUSD(musdBalance)}.`
                                : `You need ${formatMUSD(total.toString())} borrowing capacity but currently have ${formatMUSD(availableCapacity.toString())}.`}
                            </p>
                          </div>
                        </div>

                        {/* Next Steps - Simple Call to Action */}
                        <div className="mt-4">
                          <Link href="/dashboard">
                            <Button variant="accent" size="lg" fullWidth className="mb-3">
                              Go to Dashboard to Add Funds
                            </Button>
                          </Link>

                          <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 border border-[var(--border-color)]">
                            <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">How BitBNPL works:</p>
                            <ul className="text-xs text-[var(--text-muted)] space-y-1.5">
                              <li>• <span className="text-[var(--text-secondary)]">Buy BTC</span> and lock it as collateral</li>
                              <li>• <span className="text-[var(--text-secondary)]">Borrow MUSD</span> against your Bitcoin</li>
                              <li>• <span className="text-[var(--text-secondary)]">Shop with MUSD</span> while keeping your BTC upside</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show helpful message about payment options */}
                  {canAfford && selectedPlan === '1' && !canPayInFull && canUseInstallments && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-300 font-medium mb-1">💡 Tip: Use Installments Instead</p>
                          <p className="text-xs text-blue-200">
                            You have {formatMUSD(availableCapacity.toString())} borrowing capacity from your BTC collateral.
                            Choose a 4, 6, or 8 payment plan below to complete this purchase!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {canAfford && selectedPlan !== '1' && canUseInstallments && canPayInFull && (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-300 font-medium mb-1">💡 Alternative Option Available</p>
                          <p className="text-xs text-blue-200">
                            You have {formatMUSD(musdBalance)} MUSD. You could also pay in full with 0% interest,
                            but installments preserve more borrowing capacity for future purchases.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {canAfford && selectedPlan !== '1' && !canUseInstallments && canPayInFull && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-orange-300 font-medium mb-1">Installments Not Available</p>
                          <p className="text-xs text-orange-200">
                            You need {formatMUSD(total.toString())} borrowing capacity for installments, but you have {formatMUSD(availableCapacity.toString())}.
                            Select &quot;Pay in Full&quot; above to use your {formatMUSD(musdBalance)} MUSD instead.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {createError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      {createError.message || 'Transaction failed. Please try again.'}
                    </div>
                  )}

                  {approveError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                      <AlertCircle className="inline h-4 w-4 mr-1" />
                      Approval failed. Please try again.
                    </div>
                  )}

                  <Button
                    variant="accent"
                    size="lg"
                    fullWidth
                    onClick={handleCheckout}
                    disabled={!canAffordSelectedPlan || isCreating || isConfirming || isApproving || isApproveConfirming || mezoLoading}
                    loading={isCreating || isConfirming || isApproving || isApproveConfirming}
                  >
                    {isApproving
                      ? 'Approving MUSD...'
                      : isApproveConfirming
                      ? 'Confirming Approval...'
                      : isCreating
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
