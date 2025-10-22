'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { useMerchantRegistry } from '@/hooks/useMerchantRegistry'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Download,
  Code,
  CheckCircle,
  Clock,
  ExternalLink,
  Copy,
  Sparkles,
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MerchantDashboardPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { merchantData, calculatePlatformFee, calculateMerchantAmount } = useMerchantRegistry()

  const [copiedCode, setCopiedCode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Give time for merchant data to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Redirect if not connected
  if (!isConnected) {
    router.push('/merchant/register')
    return null
  }

  // Show loading while data is being fetched
  if (isLoading || merchantData === null) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading your merchant dashboard...</p>
        </div>
      </main>
    )
  }

  // Redirect if not registered (only after loading is complete)
  if (!merchantData?.isActive) {
    router.push('/merchant/register')
    return null
  }

  const formatMUSD = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUSD`
  }

  const formatVolume = (volumeStr: string) => {
    // Convert from wei (18 decimals) to MUSD
    const volumeBigInt = BigInt(volumeStr || '0')
    const musd = Number(volumeBigInt) / 1e18
    return formatMUSD(musd)
  }

  // Example integration code
  const widgetCode = `<!-- Add BitBNPL Widget -->
<script src="https://bitbnpl.com/widget.js"></script>

<!-- Payment Button -->
<button
  class="bitbnpl-checkout"
  data-merchant-wallet="${address}"
  data-amount="299.99"
  data-item-name="Product Name">
  Pay with BitBNPL
</button>`

  const copyCode = () => {
    navigator.clipboard.writeText(widgetCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              {/* Merchant Logo */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: merchantData.logoColor }}
              >
                <span className="text-white text-2xl font-bold">{merchantData.logoText}</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-1">{merchantData.businessName}</h1>
                <div className="flex items-center space-x-3">
                  <Badge variant={merchantData.isVerified ? 'success' : 'warning'} size="sm">
                    {merchantData.isVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Verification
                      </>
                    )}
                  </Badge>
                  <Badge variant="default" size="sm">
                    {merchantData.category}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.open(merchantData.storeUrl, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Store
              </Button>
              <Button variant="accent">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        {!merchantData.isVerified && (
          <div className="mb-8">
            <div className="bg-yellow-500/10 border-2 border-yellow-500/20 p-6 rounded-xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                    Account Verification Pending
                  </h3>
                  <p className="text-[var(--text-secondary)] mb-4">
                    Your account is being reviewed by our team. This usually takes 24-48 hours. Once verified, you can start accepting payments.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-[var(--text-muted)]">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>We will notify you via email when verification is complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card padding="lg" className="group hover:border-[var(--color-accent-600)]/40 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                Total Revenue
              </span>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
              {formatVolume(merchantData.totalVolume)}
            </div>
            <div className="text-sm text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              All-time earnings
            </div>
          </Card>

          <Card padding="lg" className="group hover:border-[var(--color-accent-600)]/40 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                Total Sales
              </span>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
              {merchantData.totalSales}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Completed transactions</div>
          </Card>

          <Card padding="lg" className="group hover:border-[var(--color-accent-600)]/40 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                Avg Order Value
              </span>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
              {merchantData.totalSales > 0
                ? formatVolume((BigInt(merchantData.totalVolume) / BigInt(merchantData.totalSales)).toString())
                : formatMUSD(0)}
            </div>
            <div className="text-sm text-[var(--text-muted)]">Per transaction</div>
          </Card>

          <Card padding="lg" className="group hover:border-[var(--color-accent-600)]/40 transition-all">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                Platform Fee
              </span>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">1%</div>
            <div className="text-sm text-[var(--text-muted)]">vs 3-6% traditional</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Integration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Integration Code */}
            <Card padding="lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    <Code className="h-5 w-5 inline mr-2" />
                    Integration Code
                  </CardTitle>
                  <Badge variant={merchantData.isVerified ? 'success' : 'warning'} size="sm">
                    {merchantData.isVerified ? 'Ready to use' : 'Pending verification'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Add this code to your website to start accepting BitBNPL payments
                  </p>

                  <div className="relative">
                    <pre className="bg-[var(--bg-secondary)] p-4 rounded-lg overflow-x-auto text-xs font-mono text-[var(--text-primary)] border border-[var(--border-color)]">
                      {widgetCode}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyCode}
                      className="absolute top-2 right-2"
                    >
                      {copiedCode ? (
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

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button variant="accent" fullWidth disabled={!merchantData.isVerified}>
                      <Code className="h-4 w-4 mr-2" />
                      View Full Docs
                    </Button>
                    <Button variant="outline" fullWidth disabled={!merchantData.isVerified}>
                      <Download className="h-4 w-4 mr-2" />
                      Download SDK
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fee Calculator */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Fee Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    See how much you will receive for different transaction amounts
                  </p>

                  <div className="space-y-4">
                    {[100, 500, 1000, 5000].map((amount) => (
                      <div
                        key={amount}
                        className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {formatMUSD(amount)} Sale
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Platform fee: {formatMUSD(calculatePlatformFee(amount.toString()))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-500">
                            {formatMUSD(calculateMerchantAmount(amount.toString()))}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">You receive</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Merchant Info */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wide block mb-2">
                      Payment Wallet
                    </span>
                    <p className="font-mono text-xs text-[var(--text-primary)] break-all">
                      {address}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wide block mb-2">
                      Store URL
                    </span>
                    <a
                      href={merchantData.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--color-accent-600)] hover:underline break-all"
                    >
                      {merchantData.storeUrl}
                    </a>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                    <span className="text-xs text-[var(--text-tertiary)] font-medium uppercase tracking-wide block mb-2">
                      Member Since
                    </span>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {new Date(merchantData.registeredAt * 1000).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card padding="lg" className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    Instant Settlement
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    You receive payment immediately when a customer checks out. No waiting for installments.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Paid in seconds, not days</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">Zero Chargebacks</h4>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Crypto payments are final. No chargeback risk, no fraud protection fees.
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-blue-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>100% fraud protection</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Support */}
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-3">
                  <Button variant="outline" fullWidth>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </Button>
                  <Button variant="outline" fullWidth>
                    <Users className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
