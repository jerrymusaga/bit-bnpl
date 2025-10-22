'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Store, ShoppingBag, Star, BadgeCheck, ExternalLink, Sparkles } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { useAllMerchantsWithDetails, useMerchantDetails } from '@/hooks/useAdminData'

// Component to render individual merchant card
function MerchantCard({ merchantAddress }: { merchantAddress: `0x${string}` }) {
  const { merchant, isLoading } = useMerchantDetails(merchantAddress)

  if (isLoading || !merchant) {
    return (
      <div className="bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl overflow-hidden h-[320px] animate-pulse">
        <div className="h-36 bg-[var(--bg-secondary)]" />
        <div className="p-6 pt-10 space-y-3">
          <div className="h-6 bg-[var(--bg-secondary)] rounded w-3/4" />
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-full" />
          <div className="h-4 bg-[var(--bg-secondary)] rounded w-2/3" />
        </div>
      </div>
    )
  }

  // Only show active AND verified merchants
  if (!merchant.isActive || !merchant.isVerified) {
    return null
  }

  // Calculate rating based on sales (mock calculation)
  const rating = merchant.totalSales > 0 ? (4.5 + (merchant.totalSales % 5) * 0.1).toFixed(1) : '4.5'

  return (
    <Link
      href={`/marketplace/${merchant.address}`}
      className="group block bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl overflow-hidden hover:border-[var(--color-accent-600)] transition-all hover:shadow-xl hover:-translate-y-1"
    >
      {/* Banner */}
      <div
        className="h-36 relative"
        style={{
          background: `linear-gradient(135deg, ${merchant.logoColor}20 0%, ${merchant.logoColor}05 100%)`
        }}
      >
        {/* Decorative element */}
        <div
          className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-30 blur-2xl"
          style={{ backgroundColor: merchant.logoColor }}
        />

        {/* Logo */}
        <div className="absolute -bottom-8 left-6">
          <div
            className="w-16 h-16 rounded-xl border-4 border-[var(--bg-card)] shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform"
            style={{ backgroundColor: merchant.logoColor }}
          >
            <span className="text-white text-xl font-bold">{merchant.logoText}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-10">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--color-accent-600)] transition-colors">
                {merchant.businessName}
              </h3>
              {merchant.isVerified && (
                <BadgeCheck className="h-5 w-5 text-[var(--color-accent-600)]" />
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
              {merchant.storeUrl}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {rating}
            </span>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            {merchant.totalSales.toLocaleString()} sales
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="default" size="sm">
            {merchant.category}
          </Badge>
          <div className="flex items-center space-x-1 text-xs text-[var(--color-accent-600)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Visit Store</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// Component to track and count verified merchants
function VerifiedMerchantCounter({
  merchantAddress,
  countedRef,
  onCountUpdate
}: {
  merchantAddress: `0x${string}`
  countedRef: React.MutableRefObject<Set<string>>
  onCountUpdate: () => void
}) {
  const { merchant, isLoading } = useMerchantDetails(merchantAddress)
  const hasReportedRef = useRef(false)

  useEffect(() => {
    if (!isLoading && merchant && !hasReportedRef.current) {
      const isVerified = merchant.isVerified && merchant.isActive

      // Only count if not already counted
      if (!countedRef.current.has(merchantAddress)) {
        countedRef.current.add(merchantAddress)
        hasReportedRef.current = true

        if (isVerified) {
          onCountUpdate()
        }
      }
    }
  }, [isLoading, merchant?.isVerified, merchant?.isActive, merchantAddress, countedRef, onCountUpdate])

  return null
}

export default function MarketplacePage() {
  // Fetch all merchants from contract
  const { merchantAddresses, isLoading } = useAllMerchantsWithDetails(0, 100)

  // Track verified merchant count
  const [verifiedCount, setVerifiedCount] = useState(0)
  const countedMerchantsRef = useRef(new Set<string>())

  const handleCountUpdate = useCallback(() => {
    setVerifiedCount(prev => prev + 1)
  }, [])

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hidden counters to track verified merchants */}
        {merchantAddresses.map((address) => (
          <VerifiedMerchantCounter
            key={`counter-${address}`}
            merchantAddress={address}
            countedRef={countedMerchantsRef}
            onCountUpdate={handleCountUpdate}
          />
        ))}

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-primary-600)] bg-clip-text text-transparent">
                  Marketplace
                </h1>
              </div>
              <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
                Discover stores that accept BitBNPL payments. Shop on their platforms and pay in installments.
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <BadgeCheck className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">All merchants receive instant settlement</span>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group p-6 bg-gradient-to-br from-[var(--color-accent-600)]/10 to-[var(--color-accent-600)]/5 border-2 border-[var(--color-accent-600)]/20 rounded-xl hover:border-[var(--color-accent-600)]/40 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Total Merchants</span>
              <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-600)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="h-5 w-5 text-[var(--color-accent-600)]" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[var(--text-primary)]">
              {isLoading ? '...' : verifiedCount}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Verified integrations</p>
          </div>
          <div className="group p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-xl hover:border-green-500/40 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Active Merchants</span>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BadgeCheck className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[var(--text-primary)]">
              {isLoading ? '...' : verifiedCount}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Ready to accept payments</p>
          </div>
          <div className="group p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Avg Rating</span>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[var(--text-primary)]">4.7</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Customer satisfaction</p>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            Verified Merchants
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {isLoading ? 'Loading...' : `${verifiedCount} ${verifiedCount === 1 ? 'merchant' : 'merchants'} available`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl overflow-hidden h-[320px] animate-pulse">
                <div className="h-36 bg-[var(--bg-secondary)]" />
                <div className="p-6 pt-10 space-y-3">
                  <div className="h-6 bg-[var(--bg-secondary)] rounded w-3/4" />
                  <div className="h-4 bg-[var(--bg-secondary)] rounded w-full" />
                  <div className="h-4 bg-[var(--bg-secondary)] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Merchants Grid */}
        {!isLoading && merchantAddresses.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No merchants found</h3>
            <p className="text-[var(--text-secondary)]">Be the first merchant to register!</p>
            <Link href="/merchant/register" className="inline-block mt-6">
              <Button variant="accent">Register as Merchant</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchantAddresses.map((address) => (
              <MerchantCard key={address} merchantAddress={address} />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 p-10 bg-gradient-to-br from-[var(--color-accent-600)]/10 via-[var(--color-primary-600)]/5 to-transparent border-2 border-[var(--color-accent-600)]/20 rounded-2xl text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent-600)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-primary-600)]/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-accent-600)]/10 border-2 border-[var(--color-accent-600)]/20 mb-6">
              <Sparkles className="h-8 w-8 text-[var(--color-accent-600)]" />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Are you a merchant?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Integrate BitBNPL and get paid instantly while your customers pay in installments. Zero risk, increase sales by 30%.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/merchant">
                <Button variant="accent" size="lg" className="group">
                  <span className="flex items-center space-x-2">
                    <span>Become a Merchant</span>
                    <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
              <div className="flex items-center space-x-2">
                <BadgeCheck className="h-4 w-4 text-green-500" />
                <span className="text-[var(--text-muted)]">Instant Settlement</span>
              </div>
              <div className="flex items-center space-x-2">
                <BadgeCheck className="h-4 w-4 text-green-500" />
                <span className="text-[var(--text-muted)]">No Chargebacks</span>
              </div>
              <div className="flex items-center space-x-2">
                <BadgeCheck className="h-4 w-4 text-green-500" />
                <span className="text-[var(--text-muted)]">Easy Integration</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
