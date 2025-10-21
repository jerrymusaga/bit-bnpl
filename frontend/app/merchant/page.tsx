'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useMerchantRegistry } from '@/hooks/useMerchantRegistry'
import { Card, Button } from '@/components/ui'
import { Store, ArrowRight, Sparkles, Shield, Zap, TrendingUp, CheckCircle, Code } from 'lucide-react'
import Link from 'next/link'

export default function MerchantPage() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const { merchantData } = useMerchantRegistry()

  // Redirect to dashboard if already registered
  useEffect(() => {
    if (isConnected && merchantData?.isActive) {
      router.push('/merchant/dashboard')
    }
  }, [isConnected, merchantData, router])

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,107,0,0.1),transparent)]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[var(--color-accent-600)]/10 border border-[var(--color-accent-600)]/20 mb-8">
              <Sparkles className="h-4 w-4 text-[var(--color-accent-600)]" />
              <span className="text-sm font-medium text-[var(--color-accent-600)]">
                For Merchants & Businesses
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-primary-600)] bg-clip-text text-transparent">
                Get Paid Instantly,
              </span>
              <br />
              While Customers Pay Later
            </h1>

            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-3xl mx-auto leading-relaxed">
              Accept BitBNPL payments and receive <span className="text-[var(--color-accent-600)] font-semibold">100% of your money instantly</span>, while your customers enjoy flexible installments. No chargebacks, no waiting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/merchant/register">
                <Button variant="accent" size="lg" className="group">
                  <span className="flex items-center space-x-2">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg">
                  <span className="flex items-center space-x-2">
                    <span>Learn More</span>
                  </span>
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-muted)]">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-success-500)]" />
                <span>Instant Settlement</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-success-500)]" />
                <span>Only 1% Fee</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-[var(--color-success-500)]" />
                <span>Zero Chargebacks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Merchants Love BitBNPL</h2>
            <p className="text-xl text-[var(--text-secondary)]">
              The payment solution built for modern businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card
              padding="lg"
              className="group hover:border-[var(--color-success-500)]/40 transition-all"
            >
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-green-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Settlement</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Get paid in seconds, not days or weeks. 99% of sale amount hits your wallet immediately when customer checks out.
              </p>
              <div className="text-sm text-green-600 font-medium">
                Average settlement: 3-5 seconds
              </div>
            </Card>

            <Card
              padding="lg"
              className="group hover:border-[var(--color-accent-600)]/40 transition-all"
            >
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-accent-600)]/20 to-[var(--color-accent-600)]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-[var(--color-accent-600)]" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Lowest Fees</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Only 1% platform fee. Save 66-83% compared to credit cards (3%) or traditional BNPL (4-6%).
              </p>
              <div className="text-sm text-[var(--color-accent-600)] font-medium">
                Save $20-50 per $1,000 sale
              </div>
            </Card>

            <Card
              padding="lg"
              className="group hover:border-blue-500/40 transition-all"
            >
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-blue-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Zero Chargebacks</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Crypto payments are final and backed by Bitcoin collateral. No fraud, no disputes, no reversals.
              </p>
              <div className="text-sm text-blue-600 font-medium">
                100% fraud protection
              </div>
            </Card>

            <Card
              padding="lg"
              className="group hover:border-purple-500/40 transition-all"
            >
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code className="h-7 w-7 text-purple-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Integration</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Add BitBNPL to your site in minutes with our widget, SDK, or API. Works with any platform.
              </p>
              <div className="text-sm text-purple-600 font-medium">
                Setup in under 30 minutes
              </div>
            </Card>

            <Card
              padding="lg"
              className="group hover:border-orange-500/40 transition-all"
            >
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">Increase Sales</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                Customers spend 30-40% more when they can pay in installments. Higher AOV, better conversion.
              </p>
              <div className="text-sm text-orange-600 font-medium">
                +35% average order value
              </div>
            </Card>

            <Card
              padding="lg"
              className="group hover:border-pink-500/40 transition-all"
            >
              <div className="mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-7 w-7 text-pink-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3">No Risk</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                We handle all collections and risk. You get paid upfront, users pay us back over time.
              </p>
              <div className="text-sm text-pink-600 font-medium">
                Zero collection responsibility
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-[var(--text-secondary)]">
              Start accepting payments in 3 simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2">Register Your Business</h3>
                  <p className="text-lg text-[var(--text-secondary)]">
                    Connect your wallet, provide business details, and get verified within 24-48 hours. No upfront costs.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2">Add Payment Button</h3>
                  <p className="text-lg text-[var(--text-secondary)]">
                    Copy our widget code or install SDK. Works with Shopify, WooCommerce, custom sites, and more.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold mb-2">Start Getting Paid</h3>
                  <p className="text-lg text-[var(--text-secondary)]">
                    When customers check out, you receive 99% instantly. They pay us back in installments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-[var(--text-secondary)]">
              No hidden fees. No monthly costs. Just 1% per transaction.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card padding="lg" className="border-[var(--color-accent-600)]/30">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold mb-2 bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-accent-500)] bg-clip-text text-transparent">
                  1%
                </div>
                <p className="text-xl text-[var(--text-secondary)]">Platform Fee</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-[var(--text-primary)]">Instant settlement to your wallet</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-[var(--text-primary)]">No monthly fees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-[var(--text-primary)]">No setup fees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-[var(--text-primary)]">No hidden costs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-[var(--text-primary)]">Free integration support</span>
                </div>
              </div>

              <div className="bg-[var(--bg-secondary)] p-6 rounded-xl">
                <h3 className="font-semibold mb-4 text-center">Example: $1,000 Sale</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Sale Amount</span>
                    <span className="font-semibold">$1,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Platform Fee (1%)</span>
                    <span className="font-semibold text-red-500">-$10.00</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[var(--border-color)]">
                    <span className="font-bold">You Receive</span>
                    <span className="font-bold text-green-500 text-xl">$990.00</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card
            padding="lg"
            className="max-w-4xl mx-auto text-center border-[var(--color-accent-600)]/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-accent-600)]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-primary-600)]/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--color-accent-600)]/10 border-2 border-[var(--color-accent-600)]/20 mb-6">
                <Store className="h-10 w-10 text-[var(--color-accent-600)]" />
              </div>

              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
                Join BitBNPL and start receiving instant payments today. No contracts, no commitments.
              </p>

              <Link href="/merchant/register">
                <Button variant="accent" size="lg" className="group">
                  <span className="flex items-center space-x-2">
                    <span>Register Your Business</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}
