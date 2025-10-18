'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Badge } from '@/components/ui'
import { useMezoContracts } from '@/hooks/useMezoContracts'
import { parseUnits } from 'viem'
import { useAccount, useBalance, useWaitForTransactionReceipt } from 'wagmi'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface AddCollateralModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddCollateralModal({ isOpen, onClose }: AddCollateralModalProps) {
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const { addCollateral, borrowMUSD, isBorrowing, borrowTxHash, collateralAmount, btcPrice, minNetDebt } = useMezoContracts()

  const [btcAmount, setBtcAmount] = useState('')
  const [musdAmount, setMusdAmount] = useState('')
  const [error, setError] = useState('')

  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: borrowTxHash,
  })

  // Close modal and reset form when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && isOpen) {
      setTimeout(() => {
        onClose()
        setBtcAmount('')
        setMusdAmount('')
        setError('')
      }, 2000)
    }
  }, [isConfirmed, isOpen, onClose])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBtcAmount('')
      setMusdAmount('')
      setError('')
    }
  }, [isOpen])

  const hasExistingTrove = parseFloat(collateralAmount) > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('=== FORM SUBMIT DEBUG ===')
    console.log('BTC Amount:', btcAmount)
    console.log('MUSD Amount:', musdAmount)
    console.log('Has Existing Trove:', hasExistingTrove)
    console.log('Is Connected:', !!address)

    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    if (!btcAmount || parseFloat(btcAmount) <= 0) {
      setError('Please enter a valid BTC amount')
      return
    }

    try {
      const btcWei = parseUnits(btcAmount, 18)
      console.log('BTC Wei:', btcWei.toString())

      if (hasExistingTrove) {
        // User has existing trove, just add collateral
        console.log('Adding collateral to existing trove...')
        await addCollateral(btcWei)
      } else {
        // User doesn't have a trove, open one
        if (!musdAmount || parseFloat(musdAmount) <= 0) {
          setError('Please enter MUSD amount to borrow')
          return
        }
        const musdWei = parseUnits(musdAmount, 18)
        console.log('MUSD Wei:', musdWei.toString())
        console.log('Calling borrowMUSD...')
        const result = await borrowMUSD(musdWei, btcWei)
        console.log('borrowMUSD result:', result)
      }

      // Transaction initiated successfully
      // Don't show success or close modal yet - user needs to confirm in wallet
      // The isBorrowing/loading state will handle the UI feedback
    } catch (err) {
      const error = err as Error
      console.error('Transaction error:', error)
      setError(error.message || 'Transaction failed')
    }
  }

  const btcBalance = balance ? parseFloat(balance.formatted) : 0
  const maxBtc = Math.max(0, btcBalance - 0.001) // Keep some for gas

  // Calculate potential MUSD borrowing (90% LTV, real BTC price from oracle)
  const potentialMUSD = btcAmount ? parseFloat(btcAmount) * btcPrice * 0.9 : 0

  // Validation: Check if MUSD amount exceeds borrowing capacity or below minimum
  const musdAmountNum = parseFloat(musdAmount) || 0
  const isOverBorrowing = !hasExistingTrove && musdAmountNum > potentialMUSD
  const isBelowMinimum = !hasExistingTrove && musdAmountNum > 0 && musdAmountNum < minNetDebt

  // Button should be disabled if:
  // - Transaction is in progress
  // - No BTC amount entered
  // - For new troves: no MUSD amount, below minimum, or over-borrowing
  const isButtonDisabled =
    isBorrowing ||
    isConfirming ||
    isConfirmed ||
    !btcAmount ||
    parseFloat(btcAmount) <= 0 ||
    (!hasExistingTrove && (!musdAmount || parseFloat(musdAmount) <= 0 || isBelowMinimum || isOverBorrowing))

  console.log('Button state:', {
    isButtonDisabled,
    isBorrowing,
    isConfirming,
    isConfirmed,
    btcAmount,
    musdAmount,
    hasExistingTrove,
    isOverBorrowing,
    potentialMUSD,
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Bitcoin Collateral" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-[var(--color-primary-400)] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[var(--text-secondary)]">
              {hasExistingTrove ? (
                <p>Add more BTC to your existing collateral to increase your borrowing capacity.</p>
              ) : (
                <p>Opening your first trove. You&apos;ll deposit BTC and borrow MUSD in one transaction.</p>
              )}
            </div>
          </div>
        </div>

        {/* BTC Amount Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            BTC Amount to Deposit
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.00000001"
              value={btcAmount}
              onChange={(e) => setBtcAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">BTC</span>
              <button
                type="button"
                onClick={() => setBtcAmount(maxBtc.toFixed(8))}
                className="text-xs text-[var(--color-accent-600)] hover:underline"
              >
                MAX
              </button>
            </div>
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            Available: {btcBalance.toFixed(8)} BTC
          </div>
        </div>

        {/* MUSD Amount Input (only for new troves) */}
        {!hasExistingTrove && (
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              MUSD to Borrow
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={musdAmount}
                onChange={(e) => setMusdAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="text-sm font-semibold text-[var(--text-secondary)]">MUSD</span>
              </div>
            </div>
            <div className="mt-1 text-xs text-[var(--text-muted)]">
              Min: {minNetDebt.toFixed(2)} MUSD | Max: ~{potentialMUSD.toFixed(2)} MUSD (90% LTV)
            </div>
            {isBelowMinimum && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                Amount must be at least {minNetDebt.toFixed(2)} MUSD (protocol minimum)
              </div>
            )}
            {isOverBorrowing && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                Amount exceeds maximum borrowing capacity of {potentialMUSD.toFixed(2)} MUSD
              </div>
            )}
          </div>
        )}

        {/* Summary */}
        {btcAmount && parseFloat(btcAmount) > 0 && (
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">BTC Deposit</span>
              <span className="font-semibold text-[var(--text-primary)]">{btcAmount} BTC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">USD Value</span>
              <span className="font-semibold text-[var(--text-primary)]">
                ${(parseFloat(btcAmount) * btcPrice).toLocaleString()}
              </span>
            </div>
            {!hasExistingTrove && musdAmount && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">MUSD Borrowed</span>
                  <span className="font-semibold text-[var(--color-accent-600)]">{musdAmount} MUSD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">Interest Rate</span>
                  <Badge variant="success" size="sm">1% APR</Badge>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Transaction Status Messages */}
        {borrowTxHash && !isConfirmed && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center space-x-2">
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
            <span className="text-sm text-blue-400">
              {isConfirming ? 'Confirming transaction...' : 'Transaction submitted. Waiting for confirmation...'}
            </span>
          </div>
        )}

        {isConfirmed && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">Transaction confirmed! Closing modal...</span>
          </div>
        )}

        {/* Transaction Hash */}
        {borrowTxHash && (
          <div className="text-xs text-[var(--text-muted)] break-all">
            Tx: {borrowTxHash}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isBorrowing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="accent"
            fullWidth
            disabled={isButtonDisabled}
            loading={isBorrowing || isConfirming}
          >
            {isBorrowing || isConfirming ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isBorrowing ? 'Waiting for wallet...' : 'Confirming...'}
              </span>
            ) : isConfirmed ? (
              'Success!'
            ) : hasExistingTrove ? (
              'Add Collateral'
            ) : (
              'Open Trove & Borrow'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
