'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Badge } from '@/components/ui'
import { useMezoContracts, formatMUSD } from '@/hooks/useMezoContracts'
import { parseUnits } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { AlertCircle, CheckCircle, Loader2, TrendingDown } from 'lucide-react'

interface BorrowMUSDModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BorrowMUSDModal({ isOpen, onClose }: BorrowMUSDModalProps) {
  const {
    borrowingCapacity,
    currentDebt,
    collateralAmount,
    btcPrice,
    adjustTrove,
    isBorrowing,
    borrowTxHash,
    isRecoveryMode,
  } = useMezoContracts()

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
        setMusdAmount('')
        setError('')
      }, 2000)
    }
  }, [isConfirmed, isOpen, onClose])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMusdAmount('')
      setError('')
    }
  }, [isOpen])

  const borrowingCapacityNum = parseFloat(borrowingCapacity)
  const currentDebtNum = parseFloat(currentDebt)
  const collateralAmountNum = parseFloat(collateralAmount)
  const availableMUSD = Math.max(0, borrowingCapacityNum - currentDebtNum)

  // Calculate collateral value and ratios
  const collateralValue = collateralAmountNum * btcPrice
  const newDebt = currentDebtNum + parseFloat(musdAmount || '0')

  // Health factors (for UI display)
  const newHealthFactor = newDebt > 0 ? collateralValue / (newDebt * 1.1) : 10
  const currentHealthFactor = currentDebtNum > 0 ? collateralValue / (currentDebtNum * 1.1) : 10

  // Collateral ratios (ICR = Individual Collateral Ratio)
  const currentICR = currentDebtNum > 0 ? (collateralValue / currentDebtNum) * 100 : 0
  const newICR = newDebt > 0 ? (collateralValue / newDebt) * 100 : 0

  // CCR is 150% in Recovery Mode, MCR is ~110% in Normal Mode
  const requiredRatio = isRecoveryMode ? 150 : 110
  const willViolateRatio = newICR < requiredRatio && parseFloat(musdAmount || '0') > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!musdAmount || parseFloat(musdAmount) <= 0) {
      setError('Please enter a valid MUSD amount')
      return
    }

    if (parseFloat(musdAmount) > availableMUSD) {
      setError(`Cannot borrow more than ${formatMUSD(availableMUSD.toString())}`)
      return
    }

    if (willViolateRatio) {
      setError(`This would violate the minimum ${requiredRatio}% collateral ratio requirement`)
      return
    }

    try {
      const musdWei = parseUnits(musdAmount, 18)
      // Use adjustTrove to borrow more MUSD without adding collateral
      // collWithdrawal = 0, debtChange = musdWei, isDebtIncrease = true
      await adjustTrove(0n, musdWei, true, 0n)

      // Transaction initiated - loading state will handle UI feedback
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Transaction failed')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Borrow More MUSD" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recovery Mode Warning */}
        {isRecoveryMode && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">
                  Protocol in Recovery Mode
                </p>
                <p className="text-xs text-red-300 mb-2">
                  The system requires stricter collateral requirements. Your position must maintain at least 150% collateral ratio (normally 110%).
                </p>
                <p className="text-xs text-red-300">
                  <strong>Your current ratio: {currentICR.toFixed(1)}%</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-[var(--color-primary-400)] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-[var(--text-secondary)]">
              <p>Borrow additional MUSD against your existing Bitcoin collateral at 1% APR.</p>
            </div>
          </div>
        </div>

        {/* Current Position */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)] mb-1">Current Debt</div>
            <div className="text-lg font-bold text-[var(--text-primary)]">
              {formatMUSD(currentDebt)}
            </div>
          </div>
          <div className="p-3 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
            <div className="text-xs text-[var(--text-muted)] mb-1">Available to Borrow</div>
            <div className="text-lg font-bold text-[var(--color-success-500)]">
              {formatMUSD(availableMUSD.toString())}
            </div>
          </div>
        </div>

        {/* MUSD Amount Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            MUSD Amount to Borrow
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">MUSD</span>
              <button
                type="button"
                onClick={() => setMusdAmount(availableMUSD.toFixed(2))}
                className="text-xs text-[var(--color-accent-600)] hover:underline"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        {musdAmount && parseFloat(musdAmount) > 0 && (
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] space-y-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Transaction Impact</h4>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">New Total Debt</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {formatMUSD(newDebt.toString())}
              </span>
            </div>

            <div className="flex justify-between text-sm items-center">
              <span className="text-[var(--text-secondary)]">Health Factor</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[var(--text-muted)]">
                  {currentHealthFactor.toFixed(2)}
                </span>
                <TrendingDown className="h-3 w-3 text-[var(--color-warning-500)]" />
                <span className={`font-semibold ${
                  newHealthFactor > 1.5 ? 'text-[var(--color-success-500)]' :
                  newHealthFactor > 1.1 ? 'text-[var(--color-warning-500)]' :
                  'text-[var(--color-error-500)]'
                }`}>
                  {newHealthFactor.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Interest Rate</span>
              <Badge variant="success" size="sm">1% APR</Badge>
            </div>

            {newHealthFactor < 1.5 && (
              <div className="flex items-start space-x-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-400">
                  Warning: Your health factor will decrease. Keep it above 1.1 to avoid liquidation.
                </p>
              </div>
            )}

            {/* Collateral Ratio Warning */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-secondary)]">Collateral Ratio</span>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[var(--text-muted)]">
                    {currentICR.toFixed(1)}%
                  </span>
                  <span className="text-[var(--text-muted)]">→</span>
                  <span className={`font-semibold ${
                    newICR >= 150 ? 'text-[var(--color-success-500)]' :
                    newICR >= 110 ? 'text-[var(--color-warning-500)]' :
                    'text-[var(--color-error-500)]'
                  }`}>
                    {newICR.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Minimum required: {requiredRatio}% {isRecoveryMode && '(Recovery Mode)'}
              </div>
            </div>

            {willViolateRatio && (
              <div className="flex items-start space-x-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">
                  <strong>Cannot borrow this amount!</strong> Your collateral ratio would drop to {newICR.toFixed(1)}%, below the required {requiredRatio}%.
                  {isRecoveryMode ? ' Try adding more BTC collateral first, or wait for Recovery Mode to end.' : ' Add more collateral or borrow less.'}
                </p>
              </div>
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
            disabled={
              isBorrowing ||
              isConfirming ||
              isConfirmed ||
              !musdAmount ||
              parseFloat(musdAmount) <= 0 ||
              parseFloat(musdAmount) > availableMUSD ||
              willViolateRatio
            }
            loading={isBorrowing || isConfirming}
          >
            {isBorrowing || isConfirming ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isBorrowing ? 'Waiting for wallet...' : 'Confirming...'}
              </span>
            ) : isConfirmed ? (
              'Success!'
            ) : (
              'Borrow MUSD'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
