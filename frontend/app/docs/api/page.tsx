'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { ArrowLeft, Code, Database } from 'lucide-react'

export default function APIReferencePage() {
  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Link href="/docs" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--color-accent-600)] transition-colors mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">API Reference</h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Complete smart contract and integration API documentation
          </p>
        </div>

        {/* Contract Addresses */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>
              <Database className="h-5 w-5 inline mr-2" />
              Smart Contract Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">MerchantRegistry</h4>
                <code className="text-xs font-mono bg-[var(--bg-card)] px-2 py-1 rounded block break-all">
                  0xC80a70e2C2a8d3534043F200C83D772943AF0D91
                </code>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Manages merchant registration, verification, and metadata
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">InstallmentProcessor</h4>
                <code className="text-xs font-mono bg-[var(--bg-card)] px-2 py-1 rounded block break-all">
                  0x78a473F3D3DEC35220E47A45B796CcaB70726439
                </code>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Handles purchases, installment payments, and merchant settlement
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-2">MUSD Token</h4>
                <code className="text-xs font-mono bg-[var(--bg-card)] px-2 py-1 rounded block break-all">
                  0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
                </code>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Mezo USD stablecoin used for all transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MerchantRegistry */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>
              <Code className="h-5 w-5 inline mr-2" />
              MerchantRegistry Contract
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-6">
              {/* Read Functions */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Read Functions</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">getMerchant(address walletAddress)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Returns merchant details for a given wallet address
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)] mb-1">Returns:</p>
                      <ul className="ml-4 space-y-1 text-[var(--text-secondary)]">
                        <li>• businessName (string)</li>
                        <li>• storeUrl (string)</li>
                        <li>• category (string)</li>
                        <li>• logoText (string)</li>
                        <li>• logoColor (string)</li>
                        <li>• isActive (bool)</li>
                        <li>• isVerified (bool)</li>
                        <li>• totalSales (uint256)</li>
                        <li>• totalVolume (uint256)</li>
                        <li>• registeredAt (uint256)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">isActiveMerchant(address walletAddress)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Checks if merchant is active and verified
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)]">Returns: bool</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">getTotalMerchants()</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Returns total number of registered merchants
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)]">Returns: uint256</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">getMerchants(uint256 offset, uint256 limit)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Returns paginated list of merchant addresses
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)]">Returns: address[]</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Write Functions */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Write Functions</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">registerMerchant(...)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Register a new merchant account
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)] mb-1">Parameters:</p>
                      <ul className="ml-4 space-y-1 text-[var(--text-secondary)]">
                        <li>• walletAddress (address)</li>
                        <li>• businessName (string)</li>
                        <li>• storeUrl (string)</li>
                        <li>• category (string)</li>
                        <li>• logoText (string)</li>
                        <li>• logoColor (string)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">updateMerchant(...)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Update merchant business details
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)]">Note: Only callable by merchant owner</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">verifyMerchant(address merchant)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Verify a merchant (admin only)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* InstallmentProcessor */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>
              <Code className="h-5 w-5 inline mr-2" />
              InstallmentProcessor Contract
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-6">
              {/* Read Functions */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Read Functions</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">getPurchase(address user, uint256 purchaseId)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Get details of a specific purchase
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)] mb-1">Returns:</p>
                      <ul className="ml-4 space-y-1 text-[var(--text-secondary)]">
                        <li>• merchant (address)</li>
                        <li>• totalAmount (uint256)</li>
                        <li>• totalWithInterest (uint256)</li>
                        <li>• amountPerPayment (uint256)</li>
                        <li>• paymentsTotal (uint8)</li>
                        <li>• paymentsRemaining (uint8)</li>
                        <li>• nextPaymentDue (uint256)</li>
                        <li>• lateFees (uint256)</li>
                        <li>• isActive (bool)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">getUserActivePurchases(address user)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Get all active purchases for a user
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)]">Returns: uint256[]</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">getTotalOwed(address user)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Get total amount user owes across all purchases
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)]">Returns: uint256</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">liquidityPool()</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Get current liquidity pool balance
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)]">Returns: uint256</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">getPlatformStats()</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Get platform-wide statistics
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)] mb-1">Returns:</p>
                      <ul className="ml-4 space-y-1 text-[var(--text-secondary)]">
                        <li>• totalPurchases (uint256)</li>
                        <li>• totalVolumeProcessed (uint256)</li>
                        <li>• totalFeesCollected (uint256)</li>
                        <li>• liquidityPool (uint256)</li>
                        <li>• activePurchasesCount (uint256)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Write Functions */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Write Functions</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">createPurchase(...)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Create a new installment purchase
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)] mb-1">Parameters:</p>
                      <ul className="ml-4 space-y-1 text-[var(--text-secondary)]">
                        <li>• merchant (address)</li>
                        <li>• amount (uint256) - in MUSD</li>
                        <li>• installments (uint8) - 1, 4, 6, or 8</li>
                        <li>• userBorrowingCapacity (uint256)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">makePayment(uint256 purchaseId)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Make an installment payment
                    </p>
                    <div className="mt-3 text-xs">
                      <p className="text-[var(--text-muted)]">Note: User must approve MUSD spending first</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">depositLiquidity(uint256 amount)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Deposit MUSD into liquidity pool (admin only)
                    </p>
                  </div>

                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                    <code className="font-mono text-sm text-[var(--color-accent-600)]">withdrawLiquidity(uint256 amount)</code>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Withdraw MUSD from liquidity pool (admin only)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interest Rates */}
        <Card padding="lg" className="mb-8">
          <CardHeader>
            <CardTitle>Interest Rates & Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-color)]">
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-primary)]">Installments</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-primary)]">Interest Rate</th>
                      <th className="text-left py-3 px-4 font-semibold text-[var(--text-primary)]">Payment Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--border-color)]">
                      <td className="py-3 px-4">1 payment</td>
                      <td className="py-3 px-4">0%</td>
                      <td className="py-3 px-4">Immediate</td>
                    </tr>
                    <tr className="border-b border-[var(--border-color)]">
                      <td className="py-3 px-4">4 payments</td>
                      <td className="py-3 px-4">5%</td>
                      <td className="py-3 px-4">Bi-weekly</td>
                    </tr>
                    <tr className="border-b border-[var(--border-color)]">
                      <td className="py-3 px-4">6 payments</td>
                      <td className="py-3 px-4">8%</td>
                      <td className="py-3 px-4">Bi-weekly</td>
                    </tr>
                    <tr className="border-b border-[var(--border-color)]">
                      <td className="py-3 px-4">8 payments</td>
                      <td className="py-3 px-4">10%</td>
                      <td className="py-3 px-4">Bi-weekly</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <span className="font-semibold text-[var(--text-primary)]">Platform Fee:</span>
                  <span className="text-[var(--text-secondary)] ml-2">1% of purchase amount (deducted from merchant)</span>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <span className="font-semibold text-[var(--text-primary)]">Late Payment Fee:</span>
                  <span className="text-[var(--text-secondary)] ml-2">2% per missed payment</span>
                </div>
                <div className="p-3 bg-[var(--bg-secondary)] rounded-lg">
                  <span className="font-semibold text-[var(--text-primary)]">Payment Interval:</span>
                  <span className="text-[var(--text-secondary)] ml-2">14 days (2 weeks)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Smart Contract Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <code className="font-mono text-sm text-[var(--color-accent-600)]">MerchantRegistered(address indexed merchant)</code>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Emitted when a new merchant registers
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <code className="font-mono text-sm text-[var(--color-accent-600)]">MerchantVerified(address indexed merchant)</code>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Emitted when admin verifies a merchant
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <code className="font-mono text-sm text-[var(--color-accent-600)]">PurchaseCreated(address indexed user, address indexed merchant, uint256 purchaseId, uint256 amount)</code>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Emitted when a new purchase is created
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <code className="font-mono text-sm text-[var(--color-accent-600)]">PaymentMade(address indexed user, uint256 purchaseId, uint256 amount)</code>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Emitted when an installment payment is made
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <code className="font-mono text-sm text-[var(--color-accent-600)]">PurchaseCompleted(address indexed user, uint256 purchaseId)</code>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Emitted when all installments are paid
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
