'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { Book, Code, Zap, ArrowRight, CheckCircle, ExternalLink } from 'lucide-react'

export default function DocsPage() {
  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-600)] to-[var(--color-accent-500)] flex items-center justify-center">
              <Book className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--color-accent-600)] to-[var(--color-primary-600)] bg-clip-text text-transparent">
              Documentation
            </h1>
          </div>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
            Everything you need to integrate BitBNPL into your store and start accepting installment payments.
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/docs/getting-started">
            <Card padding="lg" className="group hover:border-[var(--color-accent-600)]/40 transition-all hover:shadow-xl cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--color-accent-600)] transition-colors">
                    Getting Started
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Quick setup guide to integrate BitBNPL in under 5 minutes
                  </p>
                  <div className="flex items-center text-sm text-[var(--color-accent-600)] font-medium">
                    <span>Start here</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/docs/integration">
            <Card padding="lg" className="group hover:border-[var(--color-accent-600)]/40 transition-all hover:shadow-xl cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--color-accent-600)] transition-colors">
                    Integration Guide
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Complete integration methods: Simple Link, Widget, and React SDK
                  </p>
                  <div className="flex items-center text-sm text-[var(--color-accent-600)] font-medium">
                    <span>View guides</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/docs/api">
            <Card padding="lg" className="group hover:border-[var(--color-accent-600)]/40 transition-all hover:shadow-xl cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Book className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--color-accent-600)] transition-colors">
                    API Reference
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Complete API documentation and smart contract reference
                  </p>
                  <div className="flex items-center text-sm text-[var(--color-accent-600)] font-medium">
                    <span>Browse API</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>What is BitBNPL?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  <p className="text-[var(--text-secondary)]">
                    BitBNPL is a Buy Now Pay Later platform built on the Mezo blockchain. It allows customers to
                    split their purchases into installments while merchants receive instant settlement.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">Instant Settlement</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Merchants get paid immediately, no waiting for customer installments
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">Zero Chargebacks</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Crypto payments are final - no fraud protection fees or chargeback risk
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">Easy Integration</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Three integration methods: Simple Link, Widget, or React SDK
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">Low Fees</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Only 1% platform fee, significantly lower than traditional BNPL providers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Guides */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Popular Guides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  <Link href="/docs/getting-started" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors border border-[var(--border-color)] hover:border-[var(--color-accent-600)]/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-1">Quick Start Guide</h4>
                        <p className="text-sm text-[var(--text-secondary)]">Get started in under 5 minutes</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                    </div>
                  </Link>

                  <Link href="/docs/integration#widget" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors border border-[var(--border-color)] hover:border-[var(--color-accent-600)]/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-1">Widget Integration</h4>
                        <p className="text-sm text-[var(--text-secondary)]">Add payment buttons to any website</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                    </div>
                  </Link>

                  <Link href="/docs/integration#react" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors border border-[var(--border-color)] hover:border-[var(--color-accent-600)]/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-1">React SDK</h4>
                        <p className="text-sm text-[var(--text-secondary)]">TypeScript-ready React components</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                    </div>
                  </Link>

                  <Link href="/docs/testing" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors border border-[var(--border-color)] hover:border-[var(--color-accent-600)]/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-1">Testing Your Integration</h4>
                        <p className="text-sm text-[var(--text-secondary)]">Use our test environment to verify</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Links */}
          <div className="space-y-6">
            {/* Resources */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  <a href="https://github.com/yourusername/bitbnpl" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                    <span className="text-sm font-medium text-[var(--text-primary)]">GitHub Repository</span>
                    <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
                  </a>

                  <Link href="/docs/api" className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Smart Contracts</span>
                    <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
                  </Link>

                  <Link href="/docs/testing" className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Test Environment</span>
                    <ArrowRight className="h-4 w-4 text-[var(--text-muted)]" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card padding="lg" className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    Can&apos;t find what you&apos;re looking for? Our team is here to help.
                  </p>
                  <Button variant="accent" fullWidth>
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Contract Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Merchant Registry</p>
                    <code className="text-xs font-mono bg-[var(--bg-secondary)] px-2 py-1 rounded break-all">
                      0xC80a70e2C2a8d3534043F200C83D772943AF0D91
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Installment Processor</p>
                    <code className="text-xs font-mono bg-[var(--bg-secondary)] px-2 py-1 rounded break-all">
                      0x78a473F3D3DEC35220E47A45B796CcaB70726439
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">MUSD Token</p>
                    <code className="text-xs font-mono bg-[var(--bg-secondary)] px-2 py-1 rounded break-all">
                      0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
