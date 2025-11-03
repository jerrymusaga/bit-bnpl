'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui'
import { useMezoContracts, formatMUSD } from '@/hooks/useMezoContracts'
import { useCollateralProtection } from '@/hooks/useCollateralProtection'
import { parseUnits } from 'viem'
import { useWaitForTransactionReceipt } from 'wagmi'
import { CheckCircle, Loader2, AlertTriangle, ShoppingCart, TrendingDown } from 'lucide-react'

interface WithdrawCollateralModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WithdrawCollateralModal({ isOpen, onClose }: WithdrawCollateralModalProps) {
  const {
    collateralAmount,
    currentDebt,
    btcPrice,
    withdrawCollateral,
    isBorrowing,
    borrowTxHash,
  } = useMezoContracts()

  const {
    canWithdrawCollateral,
    maxSafeWithdrawal,
    protectionSummary,
  } = useCollateralProtection()

  const [btcAmount, setBtcAmount] = useState('')
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
        setError('')
      }, 2000)
    }
  }, [isConfirmed, isOpen, onClose])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setBtcAmount('')
      setError('')
    }
  }, [isOpen])

  const collateralAmountNum = parseFloat(collateralAmount)
  const currentDebtNum = parseFloat(currentDebt)

  // Calculate collateral value
  const collateralValueUSD = collateralAmountNum * btcPrice

  // Calculate new metrics after withdrawal
  const withdrawalAmount = parseFloat(btcAmount || '0')
  const newCollateralBTC = collateralAmountNum - withdrawalAmount
  const newCollateralValue = newCollateralBTC * btcPrice

  // Health factor calculation
  const currentHealthFactor = currentDebtNum > 0 ? collateralValueUSD / (currentDebtNum * 1.1) : 10
  const newHealthFactor = currentDebtNum > 0 ? newCollateralValue / (currentDebtNum * 1.1) : 10

  // Collateral ratio
  const currentICR = currentDebtNum > 0 ? (collateralValueUSD / currentDebtNum) * 100 : 0
  const newICR = currentDebtNum > 0 ? (newCollateralValue / currentDebtNum) * 100 : 0

  const willViolateHealthFactor = newHealthFactor < 1.1 && withdrawalAmount > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!btcAmount || parseFloat(btcAmount) <= 0) {
      setError('Please enter a valid BTC amount')
      return
    }

    if (parseFloat(btcAmount) > collateralAmountNum) {
      setError(`Cannot withdraw more than ${collateralAmountNum.toFixed(8)} BTC`)
      return
    }

    // Check collateral protection
    if (!canWithdrawCollateral.allowed) {
      setError(canWithdrawCollateral.reason || 'Cannot withdraw collateral at this time')
      return
    }

    // Check if exceeds max safe withdrawal
    if (withdrawalAmount > maxSafeWithdrawal.btcAmount) {
      setError(`Maximum safe withdrawal is ${maxSafeWithdrawal.btcAmount.toFixed(8)} BTC. ${maxSafeWithdrawal.reason || ''}`)
      return
    }

    // Check health factor
    if (willViolateHealthFactor) {
      setError('This withdrawal would put your position at risk of liquidation (health factor < 1.1)')
      return
    }

    try {
      const btcWei = parseUnits(btcAmount, 18)
      await withdrawCollateral(btcWei)

      // Transaction initiated - loading state will handle UI feedback
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Transaction failed')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw BTC Collateral" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Active Installments Warning */}
        {protectionSummary.hasActiveInstallments && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <ShoppingCart className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-400 mb-1">
                  Active Installments Detected
                </p>
                <p className="text-xs text-orange-300 mb-2">
                  You have {protectionSummary.activeInstallmentCount} active installment payment(s) totaling {formatMUSD(protectionSummary.totalInstallmentDebt.toString())}.
                </p>
                {!protectionSummary.hasEnoughMUSD ? (
                  <div className="p-2 bg-red-500/20 border border-red-500/30 rounded mt-2">
                    <p className="text-xs text-red-300">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      <strong>Withdrawal Blocked:</strong> You only have {formatMUSD(protectionSummary.musdBalance.toString())} MUSD but need {formatMUSD(protectionSummary.totalInstallmentDebt.toString())} for installments.
                      <br/>
                      <strong>Required:</strong> Add {formatMUSD(protectionSummary.musdNeeded.toString())} MUSD to your balance before withdrawing collateral.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-green-400 mt-2">
                    ✓ You have enough MUSD ({formatMUSD(protectionSummary.musdBalance.toString())}) to cover your installments. Withdrawal allowed.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cannot Withdraw Warning */}
        {!canWithdrawCollateral.allowed && canWithdrawCollateral.reason && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-400 mb-1">
                  Withdrawal Not Allowed
                </p>
                <p className="text-xs text-red-300">
                  {canWithdrawCollateral.reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning Message */}
        {canWithdrawCollateral.allowed && canWithdrawCollateral.warning && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-400">
                {canWithdrawCollateral.warning}
              </p>
            </div>
          </div>
        )}

        {/* Current Position */}
        <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Current Position</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">BTC Collateral</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {collateralAmountNum.toFixed(8)} BTC
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                ≈ ${collateralValueUSD.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)] mb-1">MUSD Debt</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">
                {formatMUSD(currentDebt)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Health: {currentHealthFactor.toFixed(2)}x
              </div>
            </div>
          </div>
        </div>

        {/* BTC Amount Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            BTC Amount to Withdraw
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.00000001"
              value={btcAmount}
              onChange={(e) => setBtcAmount(e.target.value)}
              placeholder="0.00000000"
              disabled={!canWithdrawCollateral.allowed}
              className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-600)] disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">BTC</span>
              {canWithdrawCollateral.allowed && maxSafeWithdrawal.btcAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setBtcAmount(maxSafeWithdrawal.btcAmount.toFixed(8))}
                  className="text-xs text-[var(--color-accent-600)] hover:underline"
                >
                  MAX
                </button>
              )}
            </div>
          </div>
          {maxSafeWithdrawal.btcAmount > 0 && (
            <div className="mt-1 text-xs text-[var(--text-muted)]">
              Max safe withdrawal: {maxSafeWithdrawal.btcAmount.toFixed(8)} BTC (keeps health factor above 1.5)
            </div>
          )}
          {maxSafeWithdrawal.reason && (
            <div className="mt-1 text-xs text-red-400">
              {maxSafeWithdrawal.reason}
            </div>
          )}
        </div>

        {/* Impact Summary */}
        {btcAmount && parseFloat(btcAmount) > 0 && canWithdrawCollateral.allowed && (
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)] space-y-3">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Withdrawal Impact</h4>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">New BTC Collateral</span>
              <span className="font-semibold text-[var(--text-primary)]">
                {newCollateralBTC.toFixed(8)} BTC
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">New Collateral Value</span>
              <span className="font-semibold text-[var(--text-primary)]">
                ${newCollateralValue.toFixed(2)}
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

            {newHealthFactor < 1.5 && newHealthFactor >= 1.1 && (
              <div className="flex items-start space-x-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-400">
                  Warning: Your health factor will decrease. Keep it above 1.1 to avoid liquidation.
                </p>
              </div>
            )}

            {willViolateHealthFactor && (
              <div className="flex items-start space-x-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">
                  <strong>Cannot withdraw this amount!</strong> Your health factor would drop to {newHealthFactor.toFixed(2)}, putting you at risk of immediate liquidation. Maximum safe withdrawal is {maxSafeWithdrawal.btcAmount.toFixed(8)} BTC.
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
            <span className="text-sm text-green-400">Withdrawal successful! Closing modal...</span>
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
              !canWithdrawCollateral.allowed ||
              isBorrowing ||
              isConfirming ||
              isConfirmed ||
              !btcAmount ||
              parseFloat(btcAmount) <= 0 ||
              parseFloat(btcAmount) > collateralAmountNum ||
              willViolateHealthFactor ||
              withdrawalAmount > maxSafeWithdrawal.btcAmount
            }
            loading={isBorrowing || isConfirming}
          >
            {isBorrowing || isConfirming ? (
              <span className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isBorrowing ? 'Processing...' : 'Confirming...'}
              </span>
            ) : isConfirmed ? (
              'Success!'
            ) : (
              'Withdraw BTC Collateral'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
