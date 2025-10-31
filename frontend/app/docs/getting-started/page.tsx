'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { ArrowLeft, CheckCircle, Copy, ExternalLink, Zap } from 'lucide-react'
import { useState } from 'react'

export default function GettingStartedPage() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyCode = (code: string, step: number) => {
    navigator.clipboard.writeText(code)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Back Link */}
        <Link href="/docs" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--color-accent-600)] transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Getting Started</h1>
          </div>
          <p className="text-lg text-[var(--text-secondary)]">
            Integrate BitBNPL into your store in under 5 minutes
          </p>
        </div>

        {/* Prerequisites */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Merchant Account</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    You need a verified merchant account. <Link href="/merchant/register" className="text-[var(--color-accent-600)] hover:underline">Register here</Link> if you haven&apos;t already.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Website or Online Store</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Works with any platform: Shopify, WooCommerce, custom sites, or static HTML
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Basic HTML Knowledge</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Ability to add HTML code to your website (or use our no-code options)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-8">
          {/* Step 1 */}
          <Card padding="lg">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-600)] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Register as a Merchant</h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  First, create your merchant account and wait for verification (typically 24-48 hours).
                </p>
                <Link href="/merchant/register">
                  <Button variant="accent">
                    Register Now
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Step 2 */}
          <Card padding="lg">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-600)] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Get Your Merchant Address</h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  Once verified, your wallet address becomes your merchant identifier. You&apos;ll find it in your dashboard.
                </p>
                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <p className="text-xs text-[var(--text-muted)] mb-2">Example Merchant Address:</p>
                  <code className="text-sm font-mono text-[var(--text-primary)]">
                    0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
                  </code>
                </div>
              </div>
            </div>
          </Card>

          {/* Step 3 */}
          <Card padding="lg">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-600)] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Choose Your Integration Method</h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  Pick the integration method that works best for your stack:
                </p>

                <div className="space-y-3">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--color-accent-600)]/40 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">Simple Link</h4>
                        <Badge variant="success" size="sm" className="mt-1">Recommended for beginners</Badge>
                      </div>
                      <Link href="/docs/integration#simple-link">
                        <Button variant="ghost" size="sm">View Guide</Button>
                      </Link>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Copy and paste an HTML link - works anywhere, no setup required
                    </p>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--color-accent-600)]/40 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">JavaScript Widget</h4>
                        <Badge variant="default" size="sm" className="mt-1">Most popular</Badge>
                      </div>
                      <Link href="/docs/integration#widget">
                        <Button variant="ghost" size="sm">View Guide</Button>
                      </Link>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Add one script tag, then create buttons anywhere on your site
                    </p>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] hover:border-[var(--color-accent-600)]/40 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">React SDK</h4>
                        <Badge variant="default" size="sm" className="mt-1">TypeScript ready</Badge>
                      </div>
                      <Link href="/docs/integration#react">
                        <Button variant="ghost" size="sm">View Guide</Button>
                      </Link>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      NPM package for React and Next.js applications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Step 4 */}
          <Card padding="lg">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-600)] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Add Payment Button</h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  Example using the Simple Link method:
                </p>

                <div className="relative">
                  <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)]">
{`<a href="https://bitbnpl.vercel.app/checkout?merchant=YOUR_ADDRESS&amount=299.99&itemName=Product%20Name&itemId=prod_123"
   style="display: inline-block; padding: 12px 24px;
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
          color: white; text-decoration: none; border-radius: 8px;
          font-weight: 600;">
  Pay with BitBNPL
</a>`}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCode('<a href="https://bitbnpl.vercel.app/checkout?merchant=YOUR_ADDRESS&amount=299.99&itemName=Product%20Name&itemId=prod_123" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Pay with BitBNPL</a>', 4)}
                    className="absolute top-2 right-2"
                  >
                    {copiedStep === 4 ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-600 font-semibold mb-2">Important:</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Replace <code className="bg-[var(--bg-secondary)] px-1 py-0.5 rounded">YOUR_ADDRESS</code> with your actual merchant wallet address
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Step 5 */}
          <Card padding="lg">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-600)] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">5</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">Test Your Integration</h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  Use our test environment to verify everything works before going live.
                </p>
                <Link href="/docs/testing">
                  <Button variant="outline">
                    View Testing Guide
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Step 6 */}
          <Card padding="lg">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-3">You&apos;re Live!</h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  Once testing is complete, you&apos;re ready to accept payments. Customers can now:
                </p>
                <ul className="space-y-2 text-[var(--text-secondary)]">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Split purchases into 1, 4, 6, or 8 installments</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Pay with Bitcoin/Mezo wallets</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>You get paid instantly, they pay over time</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Next Steps */}
        <Card padding="lg" className="mt-8 border-[var(--color-accent-600)]/20 bg-gradient-to-br from-[var(--color-accent-600)]/5 to-transparent">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-3">
              <Link href="/docs/integration" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">Complete Integration Guide</span>
                  <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Detailed guides for all three integration methods
                </p>
              </Link>

              <Link href="/docs/api" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">API Reference</span>
                  <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Smart contract methods and advanced features
                </p>
              </Link>

              <Link href="/merchant/dashboard" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">View Your Dashboard</span>
                  <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Monitor transactions and manage your account
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
