import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { ShoppingBag, TrendingUp, Shield, Zap, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 gradient-primary opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,107,0,0.1),transparent)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[var(--color-accent-600)]/10 border border-[var(--color-accent-600)]/20 mb-8">
              <Sparkles className="h-4 w-4 text-[var(--color-accent-600)]" />
              <span className="text-sm font-medium text-[var(--color-accent-600)]">
                Bitcoin-Powered Buy Now Pay Later
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-primary-600)] bg-clip-text text-transparent">
                Universal Bitcoin
              </span>
              <br />
              Payment Infrastructure
            </h1>

            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl mx-auto leading-relaxed">
              Mint <span className="text-[var(--color-accent-600)] font-semibold">MUSD</span> against your Bitcoin, pay in installments at <span className="text-[var(--color-accent-600)] font-semibold">1% APR</span>, and shop without selling your BTC
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/marketplace">
                <Button variant="accent" size="lg" className="group">
                  <span className="flex items-center space-x-2">
                    <span>Browse Marketplace</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="group">
                  <span className="flex items-center space-x-2">
                    <span>Try Demo Store</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-muted)]">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-success-500)]" />
                <span>No Credit Checks</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-success-500)]" />
                <span>1% APR</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-success-500)]" />
                <span>Keep Your Bitcoin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card padding="lg" className="text-center border-[var(--color-accent-600)]/20 hover:border-[var(--color-accent-600)]/40 transition-colors">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] bg-clip-text text-transparent mb-3">
                1%
              </div>
              <div className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Annual Interest Rate
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                vs 20%+ traditional BNPL
              </div>
            </Card>

            <Card padding="lg" className="text-center border-[var(--color-accent-600)]/20 hover:border-[var(--color-accent-600)]/40 transition-colors">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] bg-clip-text text-transparent mb-3">
                110%
              </div>
              <div className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Collateralization Ratio
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Up to 90% LTV
              </div>
            </Card>

            <Card padding="lg" className="text-center border-[var(--color-accent-600)]/20 hover:border-[var(--color-accent-600)]/40 transition-colors">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] bg-clip-text text-transparent mb-3">
                0
              </div>
              <div className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                Credit Checks
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                100% approval with collateral
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* MUSD Explainer */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card
            padding="lg"
            className="max-w-4xl mx-auto gradient-accent border-[var(--color-accent-600)]/30 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent-600)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-primary-600)]/5 rounded-full blur-3xl" />

            <div className="text-center relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-accent-600)]/10 border border-[var(--color-accent-600)]/20 mb-6">
                <span className="text-2xl font-bold text-[var(--color-accent-600)]">M</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">What is MUSD?</h2>
              <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
                MUSD is Mezo&apos;s Bitcoin-backed stablecoin. Each MUSD is redeemable for $1 worth of Bitcoin, maintaining its peg through Bitcoin collateral stored in secure Mezo vaults.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="p-6 rounded-xl bg-[var(--bg-card)]/50 border border-[var(--border-color)]">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-600)]/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-[var(--color-accent-600)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">1:1 Bitcoin Backed</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Every MUSD is backed by real Bitcoin collateral, verifiable on-chain
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-card)]/50 border border-[var(--border-color)]">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-600)]/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-[var(--color-accent-600)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Always Redeemable</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Redeem MUSD for $1 worth of BTC anytime, ensuring price stability
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-[var(--bg-card)]/50 border border-[var(--border-color)]">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-600)]/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-[var(--color-accent-600)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Non-Custodial</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    You keep control of your Bitcoin, it stays in your vault
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How BitBNPL Works</h2>
            <p className="text-xl text-[var(--text-secondary)]">
              Simple, fast, and secure Bitcoin-backed payments with MUSD
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card padding="lg" className="relative group hover:border-[var(--color-accent-600)]/40 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-2xl">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Deposit Bitcoin</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Lock your Bitcoin as collateral in a secure Mezo vault
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden lg:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-[var(--color-accent-600)]/50 to-transparent" />
            </Card>

            <Card padding="lg" className="relative group hover:border-[var(--color-accent-600)]/40 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-2xl">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Mint MUSD</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Borrow up to 90% of your Bitcoin value in MUSD stablecoin
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden lg:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-[var(--color-accent-600)]/50 to-transparent" />
            </Card>

            <Card padding="lg" className="relative group hover:border-[var(--color-accent-600)]/40 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-2xl">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Shop with MUSD</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Spend your MUSD at any integrated merchant at 1% APR
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden lg:block absolute top-8 -right-3 w-6 h-0.5 bg-gradient-to-r from-[var(--color-accent-600)]/50 to-transparent" />
            </Card>

            <Card padding="lg" className="relative group hover:border-[var(--color-accent-600)]/40 transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-2xl">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Flexible Repayment</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Choose installments (3, 6, or 12 months) or pay in full anytime
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose BitBNPL</h2>
            <p className="text-xl text-[var(--text-secondary)]">
              The smartest way to use your Bitcoin for everyday purchases
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card
              padding="lg"
              variant="elevated"
              className="group hover:border-[var(--color-success-500)]/40 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-success-500)]/20 to-[var(--color-success-500)]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-7 w-7 text-[var(--color-success-500)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Keep Bitcoin Upside</h3>
                  <p className="text-[var(--text-secondary)]">
                    Your Bitcoin stays yours and continues to appreciate while you shop. If BTC grows 50%, your collateral grows 50%.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              padding="lg"
              variant="elevated"
              className="group hover:border-[var(--color-accent-600)]/40 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-accent-600)]/20 to-[var(--color-accent-600)]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="h-7 w-7 text-[var(--color-accent-600)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">20x Lower Interest</h3>
                  <p className="text-[var(--text-secondary)]">
                    Pay just 1% annually compared to 20-30% charged by Klarna, Afterpay, and credit cards.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              padding="lg"
              variant="elevated"
              className="group hover:border-[var(--color-warning-500)]/40 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-warning-500)]/20 to-[var(--color-warning-500)]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="h-7 w-7 text-[var(--color-warning-500)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Instant Approval</h3>
                  <p className="text-[var(--text-secondary)]">
                    No credit checks, no income verification, no waiting. Just deposit Bitcoin and start shopping.
                  </p>
                </div>
              </div>
            </Card>

            <Card
              padding="lg"
              variant="elevated"
              className="group hover:border-[var(--color-primary-400)]/40 transition-all"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary-400)]/20 to-[var(--color-primary-400)]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-7 w-7 text-[var(--color-primary-400)]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Universal Platform</h3>
                  <p className="text-[var(--text-secondary)]">
                    Works for e-commerce, gaming, subscriptions, creator support, and any digital transaction.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card
            padding="lg"
            variant="elevated"
            className="max-w-4xl mx-auto text-center gradient-primary border-[var(--color-accent-600)]/30 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent-600)]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-primary-600)]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-accent-600)]/10 border-2 border-[var(--color-accent-600)]/20 mb-6">
                <Sparkles className="h-10 w-10 text-[var(--color-accent-600)]" />
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Start Shopping with Bitcoin?
              </h2>
              <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
                Try our demo store or integrate BitBNPL into your platform
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/demo">
                  <Button variant="accent" size="lg" className="group">
                    <span className="flex items-center space-x-2">
                      <span>Explore Demo Store</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" size="lg" className="group">
                    <span className="flex items-center space-x-2">
                      <span>View Dashboard</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}
