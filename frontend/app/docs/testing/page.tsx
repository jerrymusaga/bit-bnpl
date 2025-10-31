'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { ArrowLeft, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'

export default function TestingPage() {
  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link href="/docs" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--color-accent-600)] transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Testing Your Integration</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Verify your integration works correctly before going live
          </p>
        </div>

        {/* Test Environment */}
        <Card padding="lg" className="mb-8 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader>
            <CardTitle>Test Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <p className="text-[var(--text-secondary)]">
                BitBNPL runs on Mezo Testnet (Matsnet) which allows you to test all features without spending real money.
              </p>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="font-semibold text-blue-600 mb-3">Network Details:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Network Name:</span>
                    <span className="font-mono text-[var(--text-primary)]">Mezo Testnet (Matsnet)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Chain ID:</span>
                    <span className="font-mono text-[var(--text-primary)]">31611</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">RPC URL:</span>
                    <span className="font-mono text-[var(--text-primary)] text-xs">https://rpc.test.mezo.org</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Currency:</span>
                    <span className="font-mono text-[var(--text-primary)]">Testnet BTC</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Test Funds */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>Getting Test Funds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <p className="text-[var(--text-secondary)]">
                To test your integration, you&apos;ll need testnet BTC and MUSD tokens.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Step 1: Get Testnet BTC</h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Join the Mezo Discord to earn &quot;mats&quot; tokens, then convert them to testnet BTC via the Mezo Portal.
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Mezo Discord
                  </Button>
                </div>

                <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Step 2: Get MUSD Tokens</h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Borrow MUSD from the Mezo protocol using your testnet BTC as collateral.
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Mezo Portal
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Checklist */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>Testing Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Verify Button Appearance</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Check that payment buttons render correctly on your site
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Test Checkout Redirect</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Click button and verify it redirects to BitBNPL checkout with correct product details
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Complete Test Purchase</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Connect wallet, select installment plan, and complete a test purchase
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Verify Merchant Settlement</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Check your merchant dashboard to confirm you received payment
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Test Multiple Products</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Verify different amounts and product names work correctly
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-[var(--bg-secondary)] rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">Mobile Testing</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Test on mobile devices to ensure responsive behavior
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card padding="lg" className="mb-8 border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex items-start space-x-3 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Button not appearing</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] ml-8">
                  <strong>Solution:</strong> Ensure the widget script is loaded before your button HTML. Check browser console for errors.
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex items-start space-x-3 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Merchant not verified error</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] ml-8">
                  <strong>Solution:</strong> Your merchant account must be verified by an admin. Check your dashboard status or contact support.
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex items-start space-x-3 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Insufficient MUSD error</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] ml-8">
                  <strong>Solution:</strong> Users need to borrow MUSD from Mezo protocol first. Ensure your test wallet has testnet BTC collateral.
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex items-start space-x-3 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <h4 className="font-semibold text-[var(--text-primary)]">Wrong product details on checkout</h4>
                </div>
                <p className="text-sm text-[var(--text-secondary)] ml-8">
                  <strong>Solution:</strong> Verify your button data attributes or URL parameters match your product info. URL encode special characters.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Scenarios */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>Recommended Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">Scenario 1: Small Purchase (1 Payment)</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Test amount: $50 | Expected: No interest, immediate payment
                </p>
              </div>

              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">Scenario 2: Medium Purchase (4 Payments)</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Test amount: $200 | Expected: 5% interest, 4 bi-weekly payments
                </p>
              </div>

              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">Scenario 3: Large Purchase (8 Payments)</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Test amount: $1000 | Expected: 10% interest, 8 bi-weekly payments
                </p>
              </div>

              <div className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">Scenario 4: Multiple Products</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Test: Add multiple payment buttons on same page with different amounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ready to Go Live */}
        <Card padding="lg" className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardHeader>
            <CardTitle>Ready to Go Live?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <p className="text-[var(--text-secondary)]">
                Once you&apos;ve completed all test scenarios successfully, you&apos;re ready to start accepting real payments!
              </p>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[var(--text-secondary)]">Integration working correctly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[var(--text-secondary)]">Merchant account verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[var(--text-secondary)]">Test purchases completed successfully</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[var(--text-secondary)]">Dashboard showing correct data</span>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/merchant/dashboard">
                  <Button variant="accent" size="lg">
                    Go to Dashboard
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <p className="text-[var(--text-secondary)] mb-4">
                If you encounter issues during testing, our team is here to help.
              </p>
              <div className="flex gap-3">
                <Button variant="outline">
                  Contact Support
                </Button>
                <Link href="/docs/api">
                  <Button variant="outline">
                    View API Docs
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
