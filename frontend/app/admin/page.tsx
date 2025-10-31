'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { useMerchantRegistry } from '@/hooks/useMerchantRegistry'
import { useInstallmentProcessor } from '@/hooks/useInstallmentProcessor'
import { usePlatformStats, useAllMerchants, useMerchantDetails, useAllPurchases } from '@/hooks/useAdminData'
import {
  Shield,
  Users,
  Store,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
  Droplet,
  Database,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

// Admin addresses - replace with actual admin addresses
const ADMIN_ADDRESSES = [
  '0x51A4FDB15787bd43FE3C96c49e559526B637bC66',
]

// Component to render individual merchant with real data
function MerchantCard({
  merchantAddress,
  onStatusLoaded,
}: {
  merchantAddress: `0x${string}`
  onStatusLoaded?: (address: string, isVerified: boolean) => void
}) {
  const { merchant, isLoading } = useMerchantDetails(merchantAddress)
  const { verifyMerchant, deactivateMerchant, isVerifying, isDeactivating } = useMerchantRegistry()

  // Report status when merchant data loads
  useEffect(() => {
    if (merchant && onStatusLoaded) {
      onStatusLoaded(merchantAddress, merchant.isVerified)
    }
  }, [merchant, merchantAddress, onStatusLoaded])

  const handleVerifyMerchant = async () => {
    try {
      await verifyMerchant(merchantAddress)
    } catch (error) {
      console.error('Failed to verify merchant:', error)
    }
  }

  const handleDeactivateMerchant = async () => {
    try {
      await deactivateMerchant(merchantAddress)
    } catch (error) {
      console.error('Failed to deactivate merchant:', error)
    }
  }

  if (isLoading || !merchant) {
    return <Card padding="lg"><p>Loading...</p></Card>
  }

  return (
    <Card padding="lg" className="border-[var(--border-color)]">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Logo */}
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: merchant.logoColor }}
          >
            {merchant.logoText}
          </div>

          {/* Merchant Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold">{merchant.businessName}</h3>
              {merchant.isVerified ? (
                <Badge variant="success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending
                </Badge>
              )}
              <Badge variant="default">{merchant.category}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[var(--text-muted)]">Wallet:</span>
                <p className="font-mono text-xs break-all">{merchant.address}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Store URL:</span>
                <a
                  href={merchant.storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-xs"
                >
                  {merchant.storeUrl}
                </a>
              </div>
              <div>
                <span className="text-[var(--text-muted)]">Registered:</span>
                <p className="text-xs">{merchant.registeredAt}</p>
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-3">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Total Sales</span>
                <p className="text-lg font-bold">{merchant.totalSales}</p>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)]">Total Volume</span>
                <p className="text-lg font-bold text-green-500">{merchant.totalVolume} MUSD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 ml-4">
          {!merchant.isVerified ? (
            <Button
              variant="accent"
              size="sm"
              onClick={handleVerifyMerchant}
              disabled={isVerifying}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isVerifying ? 'Verifying...' : 'Verify'}
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeactivateMerchant}
            disabled={isDeactivating}
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isDeactivating ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

// Merchants Tab Component
function MerchantsTab({
  updateMerchantStatus,
  verifiedCount,
  pendingCount
}: {
  updateMerchantStatus: (address: string, isVerified: boolean) => void
  verifiedCount: number
  pendingCount: number
}) {
  const { merchantAddresses, isLoading } = useAllMerchants()
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all')

  // We'll filter on the frontend after loading merchant details
  // For now, show all merchants
  const filteredAddresses = merchantAddresses

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              All ({filteredAddresses.length})
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'verified'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              Verified ({verifiedCount})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'pending'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>
          <Badge variant="default">{filteredAddresses.length} merchants</Badge>
        </div>
      </Card>

      {/* Merchants List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card padding="lg">
            <p className="text-center text-[var(--text-muted)] py-12">Loading merchants...</p>
          </Card>
        ) : filteredAddresses.length === 0 ? (
          <Card padding="lg">
            <p className="text-center text-[var(--text-muted)] py-12">
              No merchants registered yet
            </p>
          </Card>
        ) : (
          filteredAddresses.map((address) => (
            <MerchantCard
              key={address}
              merchantAddress={address}
              onStatusLoaded={updateMerchantStatus}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Transactions Tab Component
function TransactionsTab() {
  const { transactions, isLoading } = useAllPurchases(0, 50)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')

  const filteredTransactions = transactions.filter((t) => {
    if (filterStatus === 'all') return true
    return t.status === filterStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default">
            <Activity className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="success">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'active'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              Active ({transactions.filter((t) => t.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'completed'
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              Completed ({transactions.filter((t) => t.status === 'completed').length})
            </button>
          </div>
          <Badge variant="default">{filteredTransactions.length} transactions</Badge>
        </div>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card padding="lg">
            <p className="text-center text-[var(--text-muted)] py-12">Loading transactions...</p>
          </Card>
        ) : filteredTransactions.length === 0 ? (
          <Card padding="lg">
            <p className="text-center text-[var(--text-muted)] py-12">
              {filterStatus === 'all' ? 'No transactions yet' : `No ${filterStatus} transactions`}
            </p>
          </Card>
        ) : (
          filteredTransactions.map((txn) => {
            const paidInstallments = txn.paymentsTotal - txn.paymentsRemaining
            const platformFee = (parseFloat(txn.amount) * 0.01).toFixed(2)

            return (
              <Card key={`${txn.user}-${txn.id}`} padding="lg" className="hover:border-red-500/50 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold">Purchase #{txn.id}</h3>
                        {getStatusBadge(txn.status)}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">{txn.amount} MUSD</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Platform Fee: ~{platformFee} MUSD
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-[var(--text-muted)]">Buyer:</span>
                        <p className="font-mono text-xs break-all">{txn.user}</p>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Merchant:</span>
                        <p className="font-mono text-xs break-all text-[var(--text-muted)]">
                          {txn.merchant}
                        </p>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)]">Total with Interest:</span>
                        <p className="font-medium">{txn.amountWithInterest} MUSD</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-8">
                      <div>
                        <span className="text-xs text-[var(--text-muted)]">Installments</span>
                        <p className="text-lg font-bold">
                          {paidInstallments}/{txn.paymentsTotal}
                        </p>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-[var(--text-muted)]">Progress</span>
                        <div className="mt-1 w-full bg-[var(--bg-secondary)] rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(paidInstallments / txn.paymentsTotal) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-[var(--text-muted)]">Remaining</span>
                        <p className="font-medium">{txn.paymentsRemaining} payments</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

// Liquidity Tab Component
function LiquidityTab({ stats }: { stats: { liquidityPool: string } }) {
  const {
    depositLiquidity,
    withdrawLiquidity,
    isDepositing,
    isWithdrawing,
    isWithdrawConfirming,
    isWithdrawConfirmed
  } = useInstallmentProcessor()
  const { writeContract, data: approveHash, isPending: isApprovePending } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [depositError, setDepositError] = useState<string | null>(null)
  const [depositSuccess, setDepositSuccess] = useState<string | null>(null)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null)
  const [step, setStep] = useState<'idle' | 'approving' | 'depositing'>('idle')
  const [savedWithdrawAmount, setSavedWithdrawAmount] = useState('')

  const MUSD_ADDRESS = (process.env.NEXT_PUBLIC_MUSD_ADDRESS as `0x${string}`) || '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503'
  const INSTALLMENT_PROCESSOR_ADDRESS = (process.env.NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS as `0x${string}`) || '0x059C79412565a945159c6c9E037e8D54E1093Ef8'

  // Auto-trigger deposit after approval confirms
  useEffect(() => {
    if (isApproveSuccess && step === 'approving' && depositAmount) {
      const performDeposit = async () => {
        try {
          setStep('depositing')
          setDepositError(null)
          await depositLiquidity(depositAmount)
        } catch (error) {
          console.error('Deposit error:', error)
          const err = error as { shortMessage?: string; message?: string }
          setDepositError(err?.shortMessage || err?.message || 'Deposit transaction failed')
          setStep('idle')
        }
      }
      performDeposit()
    }
  }, [isApproveSuccess, step, depositAmount, depositLiquidity])

  // Handle successful deposit
  useEffect(() => {
    if (step === 'depositing' && !isDepositing) {
      // Deposit transaction submitted
      setTimeout(() => {
        setDepositSuccess(`Successfully deposited ${depositAmount} MUSD to liquidity pool!`)
        setDepositAmount('')
        setStep('idle')
      }, 1000)
    }
  }, [isDepositing, step, depositAmount])

  // Handle successful withdraw
  useEffect(() => {
    if (isWithdrawConfirmed && savedWithdrawAmount) {
      setWithdrawSuccess(`Successfully withdrew ${savedWithdrawAmount} MUSD from liquidity pool!`)
      setWithdrawAmount('')
      setSavedWithdrawAmount('')
    }
  }, [isWithdrawConfirmed, savedWithdrawAmount])

  const handleDeposit = async () => {
    // Clear previous messages
    setDepositError(null)
    setDepositSuccess(null)

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setDepositError('Please enter a valid deposit amount')
      return
    }

    try {
      setStep('approving')

      // First approve MUSD spending
      const amountInWei = BigInt(Math.floor(parseFloat(depositAmount) * 10**18))

      // Step 1: Approve
      writeContract({
        address: MUSD_ADDRESS,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }]
          }
        ] as const,
        functionName: 'approve',
        args: [INSTALLMENT_PROCESSOR_ADDRESS, amountInWei],
      })
    } catch (error) {
      console.error('Approval error:', error)
      const err = error as { shortMessage?: string; message?: string }
      setDepositError(err?.shortMessage || err?.message || 'Failed to approve MUSD spending')
      setStep('idle')
    }
  }

  const handleWithdraw = async () => {
    // Clear previous messages
    setWithdrawError(null)
    setWithdrawSuccess(null)

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount')
      return
    }

    try {
      // Save amount to show in success message after confirmation
      setSavedWithdrawAmount(withdrawAmount)
      await withdrawLiquidity(withdrawAmount)
      // Success message will be shown by useEffect when transaction confirms
    } catch (error) {
      console.error('Withdraw error:', error)
      const err = error as { shortMessage?: string; message?: string }
      setWithdrawError(err?.shortMessage || err?.message || 'Withdrawal transaction failed')
      setSavedWithdrawAmount('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Pool Overview */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card padding="lg" className="border-cyan-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                Available Liquidity Pool
              </span>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Funds available to pay merchants instantly for new purchases
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-cyan-500" />
            </div>
          </div>
          <p className="text-5xl font-bold text-cyan-500 mt-4">{stats.liquidityPool} MUSD</p>
        </Card>
      </div>

      {/* Deposit/Withdraw Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit */}
        <Card padding="lg" className="border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-500">
              <DollarSign className="h-5 w-5" />
              <span>Deposit Liquidity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Amount (MUSD)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="10000.00"
                  className="w-full px-4 py-3 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              {depositError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{depositError}</p>
                </div>
              )}

              {depositSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-500">{depositSuccess}</p>
                </div>
              )}

              <Button
                variant="accent"
                className="w-full"
                onClick={handleDeposit}
                disabled={step !== 'idle'}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                {step === 'approving' && (isApprovePending || isApproveConfirming) && 'Approving MUSD...'}
                {step === 'depositing' && 'Depositing...'}
                {step === 'idle' && 'Approve & Deposit'}
              </Button>
              <p className="text-xs text-[var(--text-muted)]">
                {step === 'approving' ? 'Step 1/2: Approving MUSD spending...' : step === 'depositing' ? 'Step 2/2: Depositing to pool...' : 'Two-step process: Approve MUSD → Deposit to pool'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Withdraw */}
        <Card padding="lg" className="border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-500">
              <TrendingUp className="h-5 w-5" />
              <span>Withdraw Liquidity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Amount (MUSD)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="5000.00"
                  className="w-full px-4 py-3 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {withdrawError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-500">{withdrawError}</p>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-500">{withdrawSuccess}</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleWithdraw}
                disabled={isWithdrawing || isWithdrawConfirming}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                {isWithdrawing || isWithdrawConfirming ? 'Processing withdrawal...' : 'Withdraw from Pool'}
              </Button>
              <p className="text-xs text-[var(--text-muted)]">
                {isWithdrawConfirming
                  ? 'Waiting for transaction confirmation...'
                  : 'Only withdraw available funds. Ensure sufficient liquidity for active loans.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liquidity History - Coming Soon */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Liquidity History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4 text-center py-12">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-cyan-500" />
            </div>
            <p className="text-[var(--text-muted)] mb-2">
              Liquidity history tracking coming soon
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Historical deposit/withdraw events will be available once event listeners are implemented
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hidden component to load merchant statuses in the background
function MerchantStatusLoader({
  merchantAddress,
  onStatusLoaded,
}: {
  merchantAddress: `0x${string}`
  onStatusLoaded: (address: string, isVerified: boolean) => void
}) {
  const { merchant } = useMerchantDetails(merchantAddress)

  useEffect(() => {
    if (merchant) {
      onStatusLoaded(merchantAddress, merchant.isVerified)
    }
  }, [merchant, merchantAddress, onStatusLoaded])

  return null // Render nothing
}

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { stats: platformStats } = usePlatformStats()
  const { merchantAddresses } = useAllMerchants() // Load all merchant addresses

  const [selectedTab, setSelectedTab] = useState<'overview' | 'merchants' | 'transactions' | 'liquidity'>('overview')

  // Track merchant verification statuses globally for counting
  const [merchantStatuses, setMerchantStatuses] = useState<Record<string, { isVerified: boolean }>>({})

  // Callback for merchant cards to report their status
  const updateMerchantStatus = useCallback((address: string, isVerified: boolean) => {
    setMerchantStatuses(prev => ({
      ...prev,
      [address]: { isVerified }
    }))
  }, [])

  // Calculate counts from loaded merchant data
  const verifiedCount = Object.values(merchantStatuses).filter(m => m.isVerified).length
  const pendingCount = Object.values(merchantStatuses).filter(m => !m.isVerified).length

  // Check if user is admin
  const isAdmin = address && ADMIN_ADDRESSES.includes(address)

  if (!isConnected || !isAdmin) {
    return (
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              You don&apos;t have permission to access the admin dashboard.
            </p>
            <Button variant="accent" onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // Real data from contracts with calculated verified/pending counts
  const stats = {
    totalMerchants: platformStats.totalMerchants,
    verifiedMerchants: verifiedCount, // Calculated from merchant statuses
    pendingVerification: pendingCount, // Calculated from merchant statuses
    totalTransactions: platformStats.totalPurchases,
    totalVolume: platformStats.totalVolumeProcessed,
    platformFees: platformStats.totalFeesCollected,
    activeUsers: platformStats.activePurchasesCount,
    liquidityPool: platformStats.liquidityPool,
    poolUtilization: '45%', // TODO: Calculate from real data
  }

  const formatMUSD = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MUSD`
  }

  return (
    <main className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hidden status loaders - load merchant data in background for accurate counts */}
        {merchantAddresses.map((address) => (
          <MerchantStatusLoader
            key={`status-loader-${address}`}
            merchantAddress={address}
            onStatusLoaded={updateMerchantStatus}
          />
        ))}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-[var(--text-secondary)]">Platform Management & Monitoring</p>
              </div>
            </div>
            <Badge variant="error" size="sm">
              <Shield className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {[
              { id: 'overview' as const, label: 'Overview', icon: Activity },
              { id: 'merchants' as const, label: 'Merchants', icon: Store },
              { id: 'transactions' as const, label: 'Transactions', icon: TrendingUp },
              { id: 'liquidity' as const, label: 'Liquidity', icon: Droplet },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedTab === tab.id
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-2 border-[var(--border-color)] hover:border-red-500/50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card padding="lg" className="border-green-500/20">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Total Merchants
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">
                  {stats.totalMerchants}
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Badge variant="success" size="sm">{stats.verifiedMerchants} Verified</Badge>
                  <Badge variant="warning" size="sm">{stats.pendingVerification} Pending</Badge>
                </div>
              </Card>

              <Card padding="lg" className="border-blue-500/20">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Total Volume
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">
                  {formatMUSD(stats.totalVolume)}
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  {stats.totalTransactions} transactions
                </div>
              </Card>

              <Card padding="lg" className="border-purple-500/20">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Platform Fees
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">
                  {formatMUSD(stats.platformFees)}
                </div>
                <div className="text-sm text-green-600">1% of volume</div>
              </Card>

              <Card padding="lg" className="border-orange-500/20">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
                    Active Users
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-[var(--text-primary)] mb-1">
                  {stats.activeUsers}
                </div>
                <div className="text-sm text-[var(--text-muted)]">With active loans</div>
              </Card>
            </div>

            {/* Liquidity Pool Status */}
            <Card padding="lg" className="border-cyan-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Droplet className="h-5 w-5 text-cyan-500" />
                    <span>Liquidity Pool Status</span>
                  </CardTitle>
                  <Badge variant="success" size="sm">Healthy</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-4">
                  <div>
                    <span className="text-sm text-[var(--text-tertiary)]">Available Liquidity</span>
                    <p className="text-5xl font-bold text-cyan-500 mt-2">
                      {formatMUSD(stats.liquidityPool)}
                    </p>
                    <p className="text-sm text-[var(--text-muted)] mt-2">
                      Funds available to pay merchants instantly for new installment purchases
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="accent" className="flex-1">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Deposit Liquidity
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card padding="lg">
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Smart Contracts</span>
                      </div>
                      <Badge variant="success" size="sm">Operational</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Liquidity Pool</span>
                      </div>
                      <Badge variant="success" size="sm">Healthy</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Email Service</span>
                      </div>
                      <Badge variant="warning" size="sm">Not Configured</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">RPC Connection</span>
                      </div>
                      <Badge variant="success" size="sm">Connected</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card padding="lg">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mt-4 text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                    <p className="text-[var(--text-muted)] mb-2">
                      Activity feed coming soon
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Real-time activity tracking will be available with blockchain event monitoring
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Merchants Tab */}
        {selectedTab === 'merchants' && (
          <MerchantsTab
            updateMerchantStatus={updateMerchantStatus}
            verifiedCount={verifiedCount}
            pendingCount={pendingCount}
          />
        )}

        {/* Transactions Tab */}
        {selectedTab === 'transactions' && <TransactionsTab />}

        {/* Liquidity Tab */}
        {selectedTab === 'liquidity' && <LiquidityTab stats={stats} />}
      </div>
    </main>
  )
}
