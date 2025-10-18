'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, BadgeCheck, ExternalLink, ShoppingBag, Calendar, Shield } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { getMerchantById } from '@/lib/merchants'

export default function MerchantStorePage({ params }: { params: Promise<{ merchantId: string }> }) {
  const resolvedParams = use(params)
  const merchant = getMerchantById(resolvedParams.merchantId)

  if (!merchant) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingBag className="h-16 w-16 text-[var(--color-warning-500)] mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Merchant Not Found</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              The merchant you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/marketplace">
              <Button variant="accent">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const handleVisitStore = () => {
    window.open(merchant.storeUrl, '_blank', 'noopener,noreferrer')
  }

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
                  {merchant.name}
                </h1>
              </div>
              <p className="text-lg text-[var(--text-secondary)] mb-4">{merchant.description}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-[var(--text-primary)]">{merchant.rating}</span>
                  <span className="text-sm text-[var(--text-muted)]">rating</span>
                </div>
                <div className="text-sm text-[var(--text-muted)]">•</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold">{merchant.totalSales.toLocaleString()}</span> total sales
                </div>
                <div className="text-sm text-[var(--text-muted)]">•</div>
                <Badge variant="secondary">{merchant.category}</Badge>
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
              <h3 className="font-semibold text-[var(--text-primary)]">Integrated</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              {new Date(merchant.integrationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-[var(--color-accent-600)]/10 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-[var(--color-accent-600)]" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Payment Options</h3>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Pay in full or choose 4, 6, or 8 installments
            </p>
          </div>
        </div>

        {/* What They Sell */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">What They Sell</h2>
          <div className="flex flex-wrap gap-3">
            {merchant.features.map((feature) => (
              <div
                key={feature}
                className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)]"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="p-8 bg-gradient-to-r from-[var(--color-accent-600)]/10 to-[var(--color-accent-600)]/5 border border-[var(--color-accent-600)]/20 rounded-2xl">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 text-center">
            How to Shop with BitBNPL at {merchant.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--color-accent-600)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Visit Store</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Click "Visit Store" to browse their products
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
                Select "Pay with BitBNPL" at checkout
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--color-accent-600)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">Pay in Installments</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Choose your plan and complete checkout
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button onClick={handleVisitStore} variant="accent" size="lg" className="group">
              Visit {merchant.name}
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
