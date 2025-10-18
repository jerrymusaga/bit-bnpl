'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Store, Search, ShoppingBag, Star, BadgeCheck, ExternalLink, TrendingUp, Sparkles } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { getAllMerchants, getMerchantsByCategory, searchMerchants, CATEGORIES } from '@/lib/merchants'

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Get filtered merchants
  const merchants = searchQuery
    ? searchMerchants(searchQuery)
    : getMerchantsByCategory(selectedCategory.toLowerCase())

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchants, products, or categories..."
              className="w-full pl-12 pr-4 py-4 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)]/50 focus:border-[var(--color-accent-600)] transition-all shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">
            Browse by Category
          </h3>
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setSearchQuery('')
                }}
                className={`px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] text-white shadow-md shadow-[var(--color-accent-600)]/20 scale-105'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:border-[var(--color-accent-600)]/50 hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
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
            <p className="text-4xl font-bold text-[var(--text-primary)]">{getAllMerchants().length}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Active integrations</p>
          </div>
          <div className="group p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-xl hover:border-green-500/40 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Total Sales</span>
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[var(--text-primary)]">
              {getAllMerchants().reduce((acc, m) => acc + m.totalSales, 0).toLocaleString()}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Purchases completed</p>
          </div>
          <div className="group p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-2 border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wide">Avg Rating</span>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <p className="text-4xl font-bold text-[var(--text-primary)]">
              {(getAllMerchants().reduce((acc, m) => acc + m.rating, 0) / getAllMerchants().length).toFixed(1)}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Customer satisfaction</p>
          </div>
        </div>

        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {searchQuery ? `Search results for "${searchQuery}"` : `${selectedCategory} Merchants`}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            {merchants.length} {merchants.length === 1 ? 'merchant' : 'merchants'} found
          </p>
        </div>

        {/* Merchants Grid */}
        {merchants.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No merchants found</h3>
            <p className="text-[var(--text-secondary)]">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchants.map((merchant) => (
              <Link
                key={merchant.id}
                href={`/marketplace/${merchant.id}`}
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
                          {merchant.name}
                        </h3>
                        {merchant.isVerified && (
                          <BadgeCheck className="h-5 w-5 text-[var(--color-accent-600)]" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                        {merchant.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-[var(--border-color)]">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {merchant.rating}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {merchant.totalSales.toLocaleString()} sales
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" size="sm">
                      {merchant.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-[var(--color-accent-600)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Visit Store</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
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
