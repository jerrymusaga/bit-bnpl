import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { ShoppingBag, TrendingUp, Shield, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Universal Bitcoin Payment Infrastructure
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-8">
              Borrow against your Bitcoin at <span className="text-[var(--color-accent-600)] font-semibold">1% APR</span> and pay for anything digital without selling your BTC
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button variant="accent" size="lg">
                  Try Demo Store
                </Button>
              </Link>
              <Link href="/merchant">
                <Button variant="outline" size="lg">
                  For Merchants
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--color-accent-600)] mb-2">1%</div>
              <div className="text-[var(--text-secondary)]">Annual Interest Rate</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">vs 20%+ traditional BNPL</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--color-accent-600)] mb-2">110%</div>
              <div className="text-[var(--text-secondary)]">Collateralization Ratio</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">Up to 90% LTV</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--color-accent-600)] mb-2">0</div>
              <div className="text-[var(--text-secondary)]">Credit Checks</div>
              <div className="text-sm text-[var(--text-muted)] mt-1">100% approval with collateral</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How BitBNPL Works</h2>
            <p className="text-xl text-[var(--text-secondary)]">
              Simple, fast, and secure Bitcoin-backed payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card padding="lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-600)]/10 flex items-center justify-center mb-4">
                  <span className="text-[var(--color-accent-600)] font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Deposit Bitcoin</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Lock your Bitcoin as collateral in a secure Mezo vault
                </p>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-600)]/10 flex items-center justify-center mb-4">
                  <span className="text-[var(--color-accent-600)] font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Instant Credit</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Receive borrowing capacity up to 90% of your Bitcoin value
                </p>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-600)]/10 flex items-center justify-center mb-4">
                  <span className="text-[var(--color-accent-600)] font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Shop Anywhere</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Use BitBNPL at any integrated merchant at 1% APR
                </p>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-accent-600)]/10 flex items-center justify-center mb-4">
                  <span className="text-[var(--color-accent-600)] font-bold text-xl">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Repay Flexibly</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Pay back anytime, no fixed schedule, unlock your Bitcoin
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card padding="lg" variant="elevated">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-[var(--color-success-500)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Keep Bitcoin Upside</h3>
                  <p className="text-[var(--text-secondary)]">
                    Your Bitcoin stays yours and continues to appreciate while you shop. If BTC grows 50%, your collateral grows 50%.
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg" variant="elevated">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-[var(--color-accent-600)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">20x Lower Interest</h3>
                  <p className="text-[var(--text-secondary)]">
                    Pay just 1% annually compared to 20-30% charged by Klarna, Afterpay, and credit cards.
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg" variant="elevated">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Zap className="h-8 w-8 text-[var(--color-warning-500)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Instant Approval</h3>
                  <p className="text-[var(--text-secondary)]">
                    No credit checks, no income verification, no waiting. Just deposit Bitcoin and start shopping.
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg" variant="elevated">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <ShoppingBag className="h-8 w-8 text-[var(--color-primary-400)]" />
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
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card padding="lg" variant="elevated" className="max-w-4xl mx-auto text-center gradient-primary">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Shopping with Bitcoin?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Try our demo store or integrate BitBNPL into your platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button variant="accent" size="lg">
                  Explore Demo Store
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}
