'use client'

import Link from 'next/link'
import { ArrowLeft, Star, BadgeCheck, ExternalLink, ShoppingBag, Calendar, Shield, DollarSign } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { useMerchantDetails } from '@/hooks/useAdminData'

export default function MerchantStorePage({ params }: { params: { merchantId: string } }) {
  const merchantAddress = params.merchantId as `0x${string}`

  // Fetch merchant data from contract
  const { merchant, isLoading } = useMerchantDetails(merchantAddress)

  if (isLoading) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-[var(--bg-secondary)] rounded-2xl" />
              <div className="flex space-x-8">
                <div className="w-28 h-28 bg-[var(--bg-secondary)] rounded-2xl" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-[var(--bg-secondary)] rounded w-1/2" />
                  <div className="h-4 bg-[var(--bg-secondary)] rounded w-3/4" />
                  <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!merchant || !merchant.isActive) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 w-16 text-[var(--color-warning-500)] mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Merchant Not Found</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              The merchant you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/marketplace">
              <Button variant="accent">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Redirect to marketplace if merchant is not verified
  if (!merchant.isVerified) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <BadgeCheck className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Merchant Pending Verification</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              This merchant is awaiting admin verification. Only verified merchants can be listed in the marketplace.
            </p>
            <Link href="/marketplace">
              <Button variant="accent">Browse Verified Merchants</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const handleVisitStore = () => {
    window.open(merchant.storeUrl, '_blank', 'noopener,noreferrer')
  }

  // Calculate rating based on sales (mock calculation for now)
  const rating = merchant.totalSales > 0 ? (4.5 + (merchant.totalSales % 5) * 0.1).toFixed(1) : '4.5'

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/marketplace"
          className="inline-flex items-center space-x-2 text-[var(--text-secondary)] hover:text-[var(--color-accent-600)] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Merchant Header */}
        <div className="mb-12">
          {/* Banner */}
          <div
            className="h-48 md:h-64 rounded-2xl relative mb-8"
            style={{
              background: `linear-gradient(135deg, ${merchant.logoColor}20 0%, ${merchant.logoColor}05 100%)`
            }}
          >
            {/* Verified Badge */}
            {merchant.isVerified && (
              <div className="absolute top-6 right-6 bg-[var(--bg-card)] px-4 py-2 rounded-full flex items-center space-x-2 border border-[var(--color-accent-600)]">
                <BadgeCheck className="h-5 w-5 text-[var(--color-accent-600)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Verified Merchant</span>
              </div>
            )}
          </div>

          {/* Merchant Info */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Logo */}
            <div
              className="w-28 h-28 rounded-2xl border-4 border-[var(--bg-primary)] shadow-xl flex-shrink-0 flex items-center justify-center"
              style={{ backgroundColor: merchant.logoColor }}
            >
              <span className="text-white text-4xl font-bold">{merchant.logoText}</span>
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                  {merchant.businessName}
                </h1>
              </div>
              <p className="text-lg text-[var(--text-secondary)] mb-4">
                <a
                  href={merchant.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-accent-600)] transition-colors"
                >
                  {merchant.storeUrl}
                </a>
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-[var(--text-primary)]">{rating}</span>
                  <span className="text-sm text-[var(--text-muted)]">rating</span>
                </div>
                <div className="text-sm text-[var(--text-muted)]">•</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold">{merchant.totalSales.toLocaleString()}</span> total sales
                </div>
                <div className="text-sm text-[var(--text-muted)]">•</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold">{parseFloat(merchant.totalVolume).toFixed(2)} MUSD</span> volume
                </div>
                <div className="text-sm text-[var(--text-muted)]">•</div>
                <Badge variant="default">{merchant.category}</Badge>
              </div>

              <Button onClick={handleVisitStore} variant="accent" size="lg" className="group">
                Visit Store
                <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Instant Settlement</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Merchant receives payment instantly from BitBNPL liquidity pool
            </p>
          </div>

          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Registered</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {merchant.registeredAt}
            </p>
          </div>

          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-[var(--color-accent-600)]/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[var(--color-accent-600)]" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Platform Fee</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              1% transaction fee (99% to merchant)
            </p>
          </div>
        </div>

        {/* Merchant Stats */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Merchant Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
              <div className="text-sm text-[var(--text-muted)] mb-1">Total Sales</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{merchant.totalSales}</div>
            </div>
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
              <div className="text-sm text-[var(--text-muted)] mb-1">Total Volume</div>
              <div className="text-2xl font-bold text-green-500">{parseFloat(merchant.totalVolume).toFixed(2)} MUSD</div>
            </div>
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
              <div className="text-sm text-[var(--text-muted)] mb-1">Rating</div>
              <div className="text-2xl font-bold text-yellow-500">{rating} ⭐</div>
            </div>
            <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
              <div className="text-sm text-[var(--text-muted)] mb-1">Last Transaction</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{merchant.lastTransactionAt}</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="p-8 bg-gradient-to-r from-[var(--color-accent-600)]/10 to-[var(--color-accent-600)]/5 border border-[var(--color-accent-600)]/20 rounded-2xl">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
            How to Shop with BitBNPL at {merchant.businessName}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--color-accent-600)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Visit Store</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Click &quot;Visit Store&quot; to browse their products
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--color-accent-600)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Add to Cart</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Shop normally and add items to your cart
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--color-accent-600)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Pay with BitBNPL</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Select &quot;Pay with BitBNPL&quot; at checkout
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--color-accent-600)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Pay in Installments</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Choose your plan (1, 4, 6, or 8 payments)
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={handleVisitStore} variant="accent" size="lg" className="group">
              Visit {merchant.businessName}
              <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">0.5-1.5% Interest</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Pay just 0.5-1.5% for installment plans, or 0% if you pay in full
            </p>
          </div>

          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Keep Your Bitcoin</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Your BTC stays in your vault and continues to appreciate
            </p>
          </div>

          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">No Credit Checks</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Instant approval with Bitcoin collateral, no income verification
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
