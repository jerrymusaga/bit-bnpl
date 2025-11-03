'use client'

import { useMemo } from 'react'
import { useMezoContracts } from './useMezoContracts'
import { useInstallmentProcessor } from './useInstallmentProcessor'

/**
 * Hook to protect BitBNPL from collateral withdrawal risks
 *
 * This hook links the Mezo lending system with the BitBNPL installment system
 * to prevent users from withdrawing BTC collateral while having unpaid installments.
 *
 * Protection rules:
 * 1. Users cannot withdraw collateral if they have active installments
 * 2. Users cannot repay full MUSD debt and close trove if they have active installments
 * 3. Users must have enough MUSD to cover remaining installments before withdrawing
 */
export function useCollateralProtection() {
  const {
    musdBalance,
    currentDebt,
    collateralAmount,
    btcPrice,
  } = useMezoContracts()

  const {
    activePurchases,
    totalOwed,
    isLoading: isInstallmentLoading,
  } = useInstallmentProcessor()

  // Parse numeric values
  const musdBalanceNum = parseFloat(musdBalance)
  const currentDebtNum = parseFloat(currentDebt)
  const collateralAmountNum = parseFloat(collateralAmount)
  const totalOwedNum = parseFloat(totalOwed)

  // Calculate collateral value in USD
  const collateralValueUSD = collateralAmountNum * btcPrice

  /**
   * Check if user has active installments
   */
  const hasActiveInstallments = activePurchases.length > 0

  /**
   * Check if user has enough MUSD to cover installments
   * User must have enough MUSD balance to pay all remaining installments
   */
  const hasEnoughMUSDForInstallments = musdBalanceNum >= totalOwedNum

  /**
   * Check if user can withdraw collateral
   * Returns: { allowed, reason }
   */
  const canWithdrawCollateral = useMemo(() => {
    // If no active installments, withdrawal is allowed
    if (!hasActiveInstallments) {
      return {
        allowed: true,
        reason: null,
      }
    }

    // If has active installments, check if they have enough MUSD
    if (!hasEnoughMUSDForInstallments) {
      return {
        allowed: false,
        reason: `You have ${totalOwedNum.toFixed(2)} MUSD in unpaid installments but only ${musdBalanceNum.toFixed(2)} MUSD balance. Add ${(totalOwedNum - musdBalanceNum).toFixed(2)} MUSD to your balance before withdrawing collateral.`,
      }
    }

    // Has active installments but enough MUSD - show warning but allow
    return {
      allowed: true,
      reason: null,
      warning: `⚠️ You have ${activePurchases.length} active installment(s) with ${totalOwedNum.toFixed(2)} MUSD remaining. Make sure you have enough MUSD to complete your payments.`,
    }
  }, [hasActiveInstallments, hasEnoughMUSDForInstallments, totalOwedNum, musdBalanceNum, activePurchases.length])

  /**
   * Check if user can repay full debt and close trove
   * Returns: { allowed, reason }
   */
  const canCloseTrove = useMemo(() => {
    // If no active installments, closing is allowed
    if (!hasActiveInstallments) {
      return {
        allowed: true,
        reason: null,
      }
    }

    // If has active installments, check if they have enough MUSD after repayment
    const musdAfterRepayment = musdBalanceNum - currentDebtNum

    if (musdAfterRepayment < totalOwedNum) {
      return {
        allowed: false,
        reason: `Cannot close trove. After repaying ${currentDebtNum.toFixed(2)} MUSD debt, you will have ${musdAfterRepayment.toFixed(2)} MUSD left, but you need ${totalOwedNum.toFixed(2)} MUSD for installments. You need ${(totalOwedNum - musdAfterRepayment).toFixed(2)} more MUSD.`,
      }
    }

    // Has enough MUSD after repayment - show warning but allow
    return {
      allowed: true,
      reason: null,
      warning: `⚠️ After closing your trove, you'll have ${musdAfterRepayment.toFixed(2)} MUSD left for your ${activePurchases.length} active installment(s) (${totalOwedNum.toFixed(2)} MUSD needed).`,
    }
  }, [hasActiveInstallments, musdBalanceNum, currentDebtNum, totalOwedNum, activePurchases.length])

  /**
   * Calculate maximum safe withdrawal amount
   * Maximum BTC that can be withdrawn while keeping enough collateral
   * to maintain health factor AND having MUSD for installments
   */
  const maxSafeWithdrawal = useMemo(() => {
    // If no debt, can withdraw all
    if (currentDebtNum === 0) {
      // But check installments
      if (hasActiveInstallments && !hasEnoughMUSDForInstallments) {
        return {
          btcAmount: 0,
          reason: 'Must have enough MUSD for installments before withdrawing',
        }
      }
      return {
        btcAmount: collateralAmountNum,
        reason: null,
      }
    }

    // If has debt, calculate based on health factor (keep > 1.5 for safety)
    const minCollateralValue = currentDebtNum * 1.5 // 150% collateralization
    const maxWithdrawValue = collateralValueUSD - minCollateralValue
    const maxWithdrawBTC = maxWithdrawValue / btcPrice

    // Check installments
    if (hasActiveInstallments && !hasEnoughMUSDForInstallments) {
      return {
        btcAmount: 0,
        reason: 'Must have enough MUSD for installments before withdrawing',
      }
    }

    return {
      btcAmount: Math.max(0, maxWithdrawBTC),
      reason: maxWithdrawBTC <= 0 ? 'Would violate health factor' : null,
    }
  }, [currentDebtNum, collateralAmountNum, collateralValueUSD, btcPrice, hasActiveInstallments, hasEnoughMUSDForInstallments])

  /**
   * Get protection summary for UI display
   */
  const protectionSummary = useMemo(() => ({
    hasActiveInstallments,
    activeInstallmentCount: activePurchases.length,
    totalInstallmentDebt: totalOwedNum,
    musdBalance: musdBalanceNum,
    musdNeeded: Math.max(0, totalOwedNum - musdBalanceNum),
    hasEnoughMUSD: hasEnoughMUSDForInstallments,
    mezoDebt: currentDebtNum,
    collateralValue: collateralValueUSD,
  }), [
    hasActiveInstallments,
    activePurchases.length,
    totalOwedNum,
    musdBalanceNum,
    hasEnoughMUSDForInstallments,
    currentDebtNum,
    collateralValueUSD,
  ])

  return {
    // Protection checks
    canWithdrawCollateral,
    canCloseTrove,
    maxSafeWithdrawal,
    protectionSummary,

    // Raw data
    hasActiveInstallments,
    hasEnoughMUSDForInstallments,
    isLoading: isInstallmentLoading,
  }
}
