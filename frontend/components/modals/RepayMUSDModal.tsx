'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui'
import { useMezoContracts, formatMUSD } from '@/hooks/useMezoContracts'
import { parseUnits } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { CheckCircle, Loader2, TrendingUp } from 'lucide-react'

interface RepayMUSDModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RepayMUSDModal({ isOpen, onClose }: RepayMUSDModalProps) {
  const {
    musdBalance,
    currentDebt,
    collateralAmount,
    btcPrice,
    repayMUSD,
    closeTrove,
    isRepaying,
    repayTxHash,
    minNetDebt,
    liquidationReserve,
    isRecoveryMode,
  } = useMezoContracts()

  const [musdAmount, setMusdAmount] = useState('')
  const [error, setError] = useState('')
  const [isClosingTrove, setIsClosingTrove] = useState(false)

  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: repayTxHash,
  })

  // Close modal and reset form when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && isOpen) {
      setTimeout(() => {
        onClose()
        setMusdAmount('')
        setError('')
        setIsClosingTrove(false)
      }, 2000)
    }
  }, [isConfirmed, isOpen, onClose])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMusdAmount('')
      setError('')
      setIsClosingTrove(false)
    }
  }, [isOpen])

  const musdBalanceNum = parseFloat(musdBalance)
  const currentDebtNum = parseFloat(currentDebt)
  const collateralAmountNum = parseFloat(collateralAmount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!musdAmount || parseFloat(musdAmount) <= 0) {
      setError('Please enter a valid MUSD amount')
      return
    }

    if (parseFloat(musdAmount) > musdBalanceNum) {
      setError(`Insufficient MUSD balance. You have ${formatMUSD(musdBalance)}`)
      return
    }

    if (parseFloat(musdAmount) > currentDebtNum) {
      setError(`Cannot repay more than your debt of ${formatMUSD(currentDebt)}`)
      return
    }

    // Check minimum debt requirement
    const remainingDebt = currentDebtNum - parseFloat(musdAmount)
    if (remainingDebt > 0 && remainingDebt < minNetDebt) {
      setError(
        `Remaining debt would be ${formatMUSD(remainingDebt.toString())}, which is below the minimum of ${formatMUSD(minNetDebt.toString())}. Either repay the full amount or leave at least ${formatMUSD(minNetDebt.toString())} debt.`
      )
      return
    }

    try {
      const musdWei = parseUnits(musdAmount, 18)
      await repayMUSD(musdWei)

      // Transaction initiated - loading state will handle UI feedback
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Transaction failed')
    }
  }

  const handleCloseTrove = async () => {
    setError('')
    setIsClosingTrove(true)

    try {
      await closeTrove()
      // Transaction initiated - loading state will handle UI feedback
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Transaction failed')
      setIsClosingTrove(false)
    }
  }

  // Calculate new health factor after repayment (using real BTC price from oracle)
  const collateralValue = collateralAmountNum * btcPrice
  const newDebt = currentDebtNum - parseFloat(musdAmount || '0')
  const newHealthFactor = newDebt > 0 ? collateralValue / (newDebt * 1.1) : 10
  const currentHealthFactor = currentDebtNum > 0 ? collateralValue / (currentDebtNum * 1.1) : 10

  // Calculate interest saved (simplified)
  const interestSaved = parseFloat(musdAmount || '0') * 0.01 // 1% APR annual

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Repay Your Loan" size="md">
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
                <p className="text-xs text-red-300">
                  The system is currently in a safety mode due to low overall collateralization.
                  Certain operations like partial repayments are temporarily restricted.
                  You can still close your position completely to repay your full loan.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Simple Explanation */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            <strong>Your loan:</strong> {formatMUSD(currentDebt)}
          </p>
          <p className="text-sm text-[var(--text-secondary)]">
            <strong>In your wallet:</strong> {formatMUSD(musdBalance)}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-3">
             You borrowed {formatMUSD(currentDebt)}, but {formatMUSD(liquidationReserve.toString())} is held as a security deposit. You&apos;ll get it back when you close your position.
          </p>
        </div>

        {/* Option 1: Partial Repayment */}
        <div className="border border-[var(--border-color)] rounded-lg p-4">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Option 1: Make a Partial Payment</h3>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            Reduce your debt but keep your position open
          </p>

          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Amount to Repay
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
                onClick={() => setMusdAmount(Math.min(musdBalanceNum, currentDebtNum).toFixed(2))}
                className="text-xs text-[var(--color-accent-600)] hover:underline"
              >
                MAX
              </button>
            </div>
          </div>
          <div className="mt-1 text-xs text-[var(--text-muted)]">
            Max you can repay: {formatMUSD(Math.min(musdBalanceNum, currentDebtNum).toString())}
          </div>
          {currentDebtNum > minNetDebt && !isRecoveryMode && (
            <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
              ⚠️ Important: If you repay partially, you must leave at least {formatMUSD(minNetDebt.toString())} remaining
            </div>
          )}
          {isRecoveryMode && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
              🚫 Partial payments are disabled during Recovery Mode. Use &quot;Close Position&quot; below instead.
            </div>
          )}

          <Button
            type="submit"
            variant="outline"
            fullWidth
            className="mt-4"
            disabled={
              isRecoveryMode ||
              isRepaying ||
              isConfirming ||
              isConfirmed ||
              isClosingTrove ||
              !musdAmount ||
              parseFloat(musdAmount) <= 0 ||
              parseFloat(musdAmount) > musdBalanceNum ||
              parseFloat(musdAmount) > currentDebtNum
            }
            loading={isRepaying || isConfirming}
          >
            {isRepaying || isConfirming ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isRepaying ? 'Processing...' : 'Confirming...'}
              </span>
            ) : isConfirmed ? (
              'Success!'
            ) : (
              'Make Partial Payment'
            )}
          </Button>
        </div>

        {/* Impact Summary */}
        {musdAmount && parseFloat(musdAmount) > 0 && (
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] space-y-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Transaction Impact</h4>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">New Total Debt</span>
              <span className="font-semibold text-[var(--color-success-500)]">
                {formatMUSD(Math.max(0, newDebt).toString())}
              </span>
            </div>

            <div className="flex justify-between text-sm items-center">
              <span className="text-[var(--text-secondary)]">Health Factor</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[var(--text-muted)]">
                  {currentHealthFactor.toFixed(2)}
                </span>
                <TrendingUp className="h-3 w-3 text-[var(--color-success-500)]" />
                <span className="font-semibold text-[var(--color-success-500)]">
                  {newHealthFactor.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">Interest Saved (Annual)</span>
              <span className="font-semibold text-[var(--color-success-500)]">
                ~{formatMUSD(interestSaved.toString())}
              </span>
            </div>

            {newDebt === 0 && (
              <div className="flex items-start space-x-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-400">
                  You&apos;ll be debt-free! Your collateral will remain locked until you withdraw it.
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
        {repayTxHash && !isConfirmed && (
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
            <span className="text-sm text-green-400">Repayment successful! Closing modal...</span>
          </div>
        )}

        {/* Transaction Hash */}
        {repayTxHash && (
          <div className="text-xs text-[var(--text-muted)] break-all">
            Tx: {repayTxHash}
          </div>
        )}

        {/* Option 2: Close Position */}
        <div className="border border-[var(--color-accent-600)]/30 rounded-lg p-4 bg-[var(--color-accent-600)]/5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-2">Option 2: Close Position & Get Your Deposit Back</h3>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Repay the full {formatMUSD(currentDebt)} (using your {formatMUSD(musdBalance)} + the {formatMUSD(liquidationReserve.toString())} deposit).
            Your BTC becomes available to withdraw.
          </p>
          <div className="p-3 bg-[var(--bg-secondary)] rounded mb-3">
            <p className="text-xs text-[var(--text-muted)]">
               Debt fully paid<br/>
               Get {formatMUSD(liquidationReserve.toString())} deposit back<br/>
               BTC ready to withdraw
            </p>
          </div>
          <Button
            type="button"
            variant="accent"
            fullWidth
            onClick={handleCloseTrove}
            disabled={isClosingTrove || isRepaying || isConfirming}
            loading={isClosingTrove}
          >
            {isClosingTrove ? 'Closing Position...' : 'Close Position (Recommended)'}
          </Button>
        </div>

        {/* Cancel Button */}
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isRepaying || isClosingTrove}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  )
}
