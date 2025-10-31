'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function IntegrationPage() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const simpleLink = `<a href="https://bitbnpl.vercel.app/checkout?merchant=YOUR_MERCHANT_ADDRESS&amount=299.99&itemName=Product%20Name&itemId=prod_123&itemImage=https://example.com/image.jpg"
   style="display: inline-block; padding: 12px 24px;
          background: linear-gradient(135deg, #F97316 0%, #EA580C 100%);
          color: white; text-decoration: none; border-radius: 8px;
          font-weight: 600;">
  Pay with BitBNPL
</a>`

  const widgetScript = `<!-- Step 1: Add Widget Script (Once per page) -->
<script src="https://bitbnpl.vercel.app/widget.js"
        data-merchant="YOUR_MERCHANT_ADDRESS">
</script>

<!-- Step 2: Add Payment Buttons -->
<button class="bitbnpl-button"
        data-amount="299.99"
        data-item-name="Product Name"
        data-item-id="prod_123"
        data-item-image="https://example.com/product.jpg">
  Pay with BitBNPL
</button>

<!-- Add as many buttons as you need -->
<button class="bitbnpl-button"
        data-amount="499.99"
        data-item-name="Premium Product"
        data-item-id="prod_456">
  Buy Now with BitBNPL
</button>`

  const reactCode = `// Step 1: Install the package
npm install @bitbnpl/react

// Step 2: Import and use
import { BitBNPLButton } from '@bitbnpl/react'

function ProductPage() {
  return (
    <BitBNPLButton
      merchantAddress="YOUR_MERCHANT_ADDRESS"
      amount={299.99}
      itemName="Product Name"
      itemId="prod_123"
      itemImage="https://example.com/product.jpg"
      merchantName="Your Store"
    />
  )
}

// Advanced: Custom styling
<BitBNPLButton
  merchantAddress="YOUR_MERCHANT_ADDRESS"
  amount={499.99}
  itemName="Premium Product"
  style={{
    borderRadius: '12px',
    padding: '16px 32px',
    fontSize: '18px'
  }}
  onRedirect={(url) => console.log('Redirecting to:', url)}
>
  Custom Button Text
</BitBNPLButton>`

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link href="/docs" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--color-accent-600)] transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Integration Guide</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Three ways to integrate BitBNPL into your store
          </p>
        </div>

        {/* Simple Link */}
        <div id="simple-link" className="mb-12 scroll-mt-20">
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Method 1: Simple Link</CardTitle>
                <span className="text-xs bg-green-500/10 text-green-600 px-3 py-1 rounded-full font-medium">
                  Easiest
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <p className="text-[var(--text-secondary)]">
                  Perfect for static websites, email campaigns, or any place where you can add an HTML link.
                </p>

                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">When to use:</h4>
                  <ul className="space-y-1 text-sm text-[var(--text-secondary)] ml-4">
                    <li>• Static HTML websites</li>
                    <li>• Email marketing campaigns</li>
                    <li>• Social media bio links</li>
                    <li>• No-code website builders</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-3">Implementation:</h4>
                  <div className="relative">
                    <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)]">
                      {simpleLink}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCode(simpleLink, 'simple')}
                      className="absolute top-2 right-2"
                    >
                      {copiedSection === 'simple' ? (
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
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-600 mb-2">URL Parameters:</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">merchant</code> - Your wallet address (required)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">amount</code> - Product price in MUSD (required)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">itemName</code> - Product name (required)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">itemId</code> - Your internal product ID (optional)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">itemImage</code> - Product image URL (optional)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Widget */}
        <div id="widget" className="mb-12 scroll-mt-20">
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Method 2: JavaScript Widget</CardTitle>
                <span className="text-xs bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full font-medium">
                  Most Popular
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <p className="text-[var(--text-secondary)]">
                  Add one script tag, then create unlimited payment buttons anywhere on your site.
                </p>

                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">When to use:</h4>
                  <ul className="space-y-1 text-sm text-[var(--text-secondary)] ml-4">
                    <li>• Shopify/WooCommerce sites</li>
                    <li>• Custom PHP/Ruby/Python apps</li>
                    <li>• Multiple products on one page</li>
                    <li>• Dynamic e-commerce sites</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-3">Implementation:</h4>
                  <div className="relative">
                    <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)] max-h-96">
                      {widgetScript}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCode(widgetScript, 'widget')}
                      className="absolute top-2 right-2"
                    >
                      {copiedSection === 'widget' ? (
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
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-600 mb-2">Data Attributes:</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">data-amount</code> - Product price (required)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">data-item-name</code> - Product name (required)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">data-item-id</code> - Product ID (optional)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">data-item-image</code> - Product image URL (optional)</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-semibold text-green-600 mb-2">Features:</h4>
                  <ul className="space-y-1 text-sm text-[var(--text-secondary)] ml-4">
                    <li>• Automatic styling and branding</li>
                    <li>• Handles URL encoding</li>
                    <li>• Works with dynamically added buttons</li>
                    <li>• Loading states and error handling</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* React SDK */}
        <div id="react" className="mb-12 scroll-mt-20">
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Method 3: React SDK</CardTitle>
                <span className="text-xs bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full font-medium">
                  TypeScript Ready
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-4">
                <p className="text-[var(--text-secondary)]">
                  NPM package for React and Next.js applications with full TypeScript support.
                </p>

                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">When to use:</h4>
                  <ul className="space-y-1 text-sm text-[var(--text-secondary)] ml-4">
                    <li>• React/Next.js applications</li>
                    <li>• TypeScript projects</li>
                    <li>• Need custom event handling</li>
                    <li>• Want full component control</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-3">Implementation:</h4>
                  <div className="relative">
                    <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)] max-h-96">
                      {reactCode}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCode(reactCode, 'react')}
                      className="absolute top-2 right-2"
                    >
                      {copiedSection === 'react' ? (
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
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-600 mb-2">Props:</h4>
                  <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">merchantAddress</code> - Your wallet address (required)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">amount</code> - Product price (required)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">itemName</code> - Product name (required)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">itemId</code> - Product ID (optional)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">itemImage</code> - Product image URL (optional)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">style</code> - Custom CSS styles (optional)</li>
                    <li><code className="bg-[var(--bg-secondary)] px-2 py-1 rounded">onRedirect</code> - Callback before redirect (optional)</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-semibold text-green-600 mb-2">Features:</h4>
                  <ul className="space-y-1 text-sm text-[var(--text-secondary)] ml-4">
                    <li>• Full TypeScript support</li>
                    <li>• React hooks integration</li>
                    <li>• Event callbacks (onRedirect, onError)</li>
                    <li>• Custom styling support</li>
                    <li>• Tree-shakeable imports</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card padding="lg" className="border-[var(--color-accent-600)]/20 bg-gradient-to-br from-[var(--color-accent-600)]/5 to-transparent">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-3">
              <Link href="/docs/testing" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                <span className="font-semibold text-[var(--text-primary)]">Test Your Integration</span>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Use our test environment before going live
                </p>
              </Link>

              <Link href="/docs/api" className="block p-4 bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                <span className="font-semibold text-[var(--text-primary)]">API Reference</span>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Advanced features and customization options
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
