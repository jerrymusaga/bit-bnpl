'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { Code, Package, CheckCircle, Zap } from 'lucide-react'
import BitBNPLButton from '@/components/BitBNPLButton'

export default function SDKDemoPage() {
  const DEMO_MERCHANT_ADDRESS = '0x131EC028Bb8Bd936A3416635777D905497F3D21f'

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Package className="h-8 w-8 text-[var(--color-accent-600)]" />
            <h1 className="text-4xl font-bold">@bitbnpl/react SDK Demo</h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            React SDK for seamless BitBNPL integration in React/Next.js apps
          </p>
        </div>

        {/* Installation */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>Installation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-sm font-mono border border-[var(--border-color)]">
                npm install @bitbnpl/react
              </pre>
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-green-300 font-semibold mb-2">✅ Package Published!</p>
                    <p className="text-xs text-[var(--text-muted)] mb-3">
                      @bitbnpl/react is now available on npm. Install it and start building!
                    </p>
                    <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                      <p>📦 <strong>npm:</strong>{' '}
                        <a
                          href="https://www.npmjs.com/package/@bitbnpl/react"
                          target="_blank"
                          className="text-green-400 hover:underline"
                        >
                          View on npm
                        </a>
                      </p>
                      <p>📚 <strong>GitHub:</strong>{' '}
                        <a
                          href="https://github.com/bitbnpl/react-sdk"
                          target="_blank"
                          className="text-green-400 hover:underline"
                        >
                          Source code
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card padding="lg">
            <CardHeader>
              <CardTitle>
                <Zap className="h-5 w-5 inline mr-2" />
                Live Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-6">
                <p className="text-sm text-[var(--text-secondary)]">
                  These buttons use the React SDK component. Click to test the integration!
                </p>

                {/* Product 1 */}
                <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="text-6xl">⌚</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Smart Watch Pro</h3>
                      <p className="text-sm text-[var(--text-muted)] mb-2">
                        Advanced fitness tracking and health monitoring
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-accent-600)]">
                        $399.99
                      </p>
                    </div>
                  </div>
                  <BitBNPLButton
                    merchantAddress={DEMO_MERCHANT_ADDRESS}
                    amount={399.99}
                    itemName="Smart Watch Pro"
                    itemId="watch_001"
                    itemImage="⌚"
                    merchantName="Demo Store"
                  />
                </div>

                {/* Product 2 */}
                <div className="p-6 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="text-6xl">📷</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Digital Camera</h3>
                      <p className="text-sm text-[var(--text-muted)] mb-2">
                        Professional 4K video and 50MP photos
                      </p>
                      <p className="text-2xl font-bold text-[var(--color-accent-600)]">
                        $1,299.99
                      </p>
                    </div>
                  </div>
                  <BitBNPLButton
                    merchantAddress={DEMO_MERCHANT_ADDRESS}
                    amount={1299.99}
                    itemName="Digital Camera"
                    itemId="camera_001"
                    itemImage="📷"
                    merchantName="Demo Store"
                  >
                    Buy Camera with BitBNPL
                  </BitBNPLButton>
                </div>

                {/* Product 3 - Custom Styled */}
                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="text-6xl">🎮</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">Gaming Console</h3>
                      <p className="text-sm text-[var(--text-muted)] mb-2">
                        Next-gen gaming with 8K support
                      </p>
                      <p className="text-2xl font-bold text-purple-400">
                        $599.99
                      </p>
                    </div>
                  </div>
                  <BitBNPLButton
                    merchantAddress={DEMO_MERCHANT_ADDRESS}
                    amount={599.99}
                    itemName="Gaming Console"
                    itemId="console_001"
                    itemImage="🎮"
                    merchantName="Demo Store"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      padding: '14px 28px',
                    }}
                  >
                    Buy Console Now
                  </BitBNPLButton>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <div className="space-y-6">
            <Card padding="lg">
              <CardHeader>
                <CardTitle>
                  <Code className="h-5 w-5 inline mr-2" />
                  Basic Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)]">
{`import { BitBNPLButton } from '@bitbnpl/react'

function ProductPage() {
  return (
    <BitBNPLButton
      merchantAddress="0x..."
      amount={399.99}
      itemName="Smart Watch Pro"
      itemId="watch_001"
      itemImage="⌚"
    />
  )
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle>Custom Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)]">
{`<BitBNPLButton
  merchantAddress="0x..."
  amount={1299.99}
  itemName="Digital Camera"
  itemId="camera_001"
  itemImage="📷"
>
  Buy Camera with BitBNPL
</BitBNPLButton>`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle>Custom Styling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)]">
{`<BitBNPLButton
  merchantAddress="0x..."
  amount={599.99}
  itemName="Gaming Console"
  style={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    padding: '14px 28px'
  }}
>
  Get Console Now
</BitBNPLButton>`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle>With Callbacks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono border border-[var(--border-color)]">
{`<BitBNPLButton
  merchantAddress="0x..."
  amount={99.99}
  itemName="Product"
  onRedirect={() => {
    console.log('Redirecting...')
  }}
  onError={(error) => {
    console.error(error)
  }}
/>`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>SDK Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">TypeScript Support</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Full type definitions included
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Zero Dependencies</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Only requires React 18+
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Customizable</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Custom styles and text
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Error Handling</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    onError and onRedirect callbacks
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Next.js Compatible</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Works with App Router and Pages
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">SSR Safe</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Server-side rendering compatible
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
