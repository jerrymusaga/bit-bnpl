'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Code, Zap, CheckCircle } from 'lucide-react'
import Script from 'next/script'

export default function WidgetDemoPage() {
  return (
    <>
      {/* Load the widget */}
      <Script
        src="/widget.js"
        data-merchant="0x51A4FDB15787bd43FE3C96c49e559526B637bC66"
        strategy="afterInteractive"
      />

      <main className="min-h-screen py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">BitBNPL Widget Demo</h1>
            <p className="text-[var(--text-secondary)]">
              See how easy it is to integrate BitBNPL payment buttons on any website
            </p>
          </div>

          {/* Live Demo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card padding="lg">
              <CardHeader>
                <CardTitle>
                  <Zap className="h-5 w-5 inline mr-2" />
                  Live Widget Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-6">
                  <p className="text-sm text-[var(--text-secondary)]">
                    These buttons are powered by the BitBNPL widget. Click any button to see the checkout flow!
                  </p>

                  {/* Demo Product 1 */}
                  <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-start space-x-4">
                      <div className="text-6xl">💻</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">Premium Laptop</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-3">
                          High-performance laptop for professionals
                        </p>
                        <p className="text-2xl font-bold text-[var(--color-accent-600)] mb-4">
                          $1,299.99
                        </p>
                        <button
                          className="bitbnpl-button"
                          data-amount="1299.99"
                          data-item-name="Premium Laptop"
                          data-item-id="laptop_001"
                          data-item-image="💻"
                        >
                          Pay with BitBNPL
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Demo Product 2 */}
                  <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-start space-x-4">
                      <div className="text-6xl">📱</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">Smartphone Pro</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-3">
                          Latest flagship smartphone with advanced features
                        </p>
                        <p className="text-2xl font-bold text-[var(--color-accent-600)] mb-4">
                          $899.99
                        </p>
                        <button
                          className="bitbnpl-button"
                          data-amount="899.99"
                          data-item-name="Smartphone Pro"
                          data-item-id="phone_001"
                          data-item-image="📱"
                        >
                          Pay with BitBNPL
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Demo Product 3 */}
                  <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <div className="flex items-start space-x-4">
                      <div className="text-6xl">🎧</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">Wireless Headphones</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-3">
                          Premium noise-cancelling headphones
                        </p>
                        <p className="text-2xl font-bold text-[var(--color-accent-600)] mb-4">
                          $299.99
                        </p>
                        <button
                          className="bitbnpl-button"
                          data-amount="299.99"
                          data-item-name="Wireless Headphones"
                          data-item-id="headphones_001"
                          data-item-image="🎧"
                        >
                          Pay with BitBNPL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integration Code */}
            <div className="space-y-6">
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>
                    <Code className="h-5 w-5 inline mr-2" />
                    Integration Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Step 1: Add the script tag</h4>
                      <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)]">
{`<script
  src="https://bitbnpl.com/widget.js"
  data-merchant="YOUR_MERCHANT_ADDRESS">
</script>`}
                      </pre>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Step 2: Add payment buttons</h4>
                      <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)]">
{`<button
  class="bitbnpl-button"
  data-amount="299.99"
  data-item-name="Product Name"
  data-item-id="prod_123"
  data-item-image="🛍️">
  Pay with BitBNPL
</button>`}
                      </pre>
                    </div>

                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-600 font-medium mb-2">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        That&apos;s it! No additional configuration needed.
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        The widget handles everything: styling, verification, and checkout flow.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Auto-styled Buttons</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Beautiful, branded buttons with hover effects
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Merchant Verification</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Automatically checks if merchant is verified on-chain
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Dynamic Button Support</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Works with dynamically added buttons (React, Vue, etc.)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Zero Dependencies</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Pure vanilla JavaScript, no external libraries needed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Error Handling</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Clear error messages for invalid configurations
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card padding="lg" className="bg-orange-500/5 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-orange-600">Customization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="text-[var(--text-secondary)]">
                      <strong>data-amount</strong> - Product price (required)
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      <strong>data-item-name</strong> - Product name
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      <strong>data-item-id</strong> - Unique product ID
                    </p>
                    <p className="text-[var(--text-secondary)]">
                      <strong>data-item-image</strong> - Product emoji/icon
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
