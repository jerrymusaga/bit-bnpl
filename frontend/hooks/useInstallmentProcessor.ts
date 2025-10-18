'use client'

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import InstallmentProcessorABI from '@/lib/abi/InstallmentProcessor.json'

// InstallmentProcessor contract address (will be set after deployment)
const INSTALLMENT_PROCESSOR_ADDRESS = (process.env.NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

export interface Purchase {
  merchant: string
  totalAmount: string
  totalWithInterest: string
  amountPerPayment: string
  paymentsTotal: number
  paymentsRemaining: number
  nextPaymentDue: number
  lateFees: string
  isActive: boolean
}

export interface InstallmentProcessorData {
  liquidityPool: string
  userPurchaseCount: number
  activePurchases: number[]
  totalOwed: string
  isLoading: boolean
  error: Error | null
}

export interface InstallmentProcessorActions {
  createPurchase: (
    merchant: string,
    amount: string,
    installments: 1 | 4 | 6 | 8,
    userBorrowingCapacity: string
  ) => Promise<void>
  makePayment: (purchaseId: number) => Promise<void>
  getPurchase: (purchaseId: number) => Promise<Purchase | null>
  isPaymentLate: (purchaseId: number) => Promise<boolean>
  isCreating: boolean
  isPaying: boolean
  isConfirming: boolean
  isConfirmed: boolean
  createError: Error | null
  paymentError: Error | null
}

export function useInstallmentProcessor(): InstallmentProcessorData & InstallmentProcessorActions {
  const { address } = useAccount()

  // Write contract hooks
  const {
    writeContract: createWrite,
    data: createHash,
    isPending: isCreating,
    error: createError,
  } = useWriteContract()

  const {
    writeContract: payWrite,
    data: payHash,
    isPending: isPaying,
    error: paymentError,
  } = useWriteContract()

  // Transaction confirmation hooks
  const { isLoading: isCreateConfirming, isSuccess: isCreateConfirmed } = useWaitForTransactionReceipt({
    hash: createHash,
  })

  const { isLoading: isPayConfirming, isSuccess: isPayConfirmed } = useWaitForTransactionReceipt({
    hash: payHash,
  })

  // Read contract hooks
  const { data: liquidityPoolData, isLoading: liquidityLoading } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'liquidityPool',
  })

  const { data: userPurchaseCountData, isLoading: countLoading } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'userPurchaseCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: activePurchasesData, isLoading: activePurchasesLoading } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'getUserActivePurchases',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: totalOwedData, isLoading: totalOwedLoading } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'getTotalOwed',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Parse data
  const liquidityPool = liquidityPoolData ? formatUnits(liquidityPoolData as bigint, 18) : '0'
  const userPurchaseCount = userPurchaseCountData ? Number(userPurchaseCountData) : 0
  const activePurchases = activePurchasesData ? (activePurchasesData as bigint[]).map(id => Number(id)) : []
  const totalOwed = totalOwedData ? formatUnits(totalOwedData as bigint, 18) : '0'

  const isLoading = liquidityLoading || countLoading || activePurchasesLoading || totalOwedLoading

  /**
   * Create a new installment purchase
   * @param merchant Merchant address to receive payment
   * @param amount Purchase amount in MUSD (as string, e.g., "1199.99")
   * @param installments Number of payments (1, 4, 6, or 8)
   * @param userBorrowingCapacity User's available borrowing capacity (as string)
   * @returns Transaction hash
   */
  const createPurchase = async (
    merchant: string,
    amount: string,
    installments: 1 | 4 | 6 | 8,
    userBorrowingCapacity: string
  ): Promise<void> => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      // Convert amounts to wei (18 decimals)
      const amountWei = parseUnits(amount, 18)
      const capacityWei = parseUnits(userBorrowingCapacity, 18)

      console.log('Creating purchase:', {
        merchant,
        amount: amountWei.toString(),
        installments,
        capacity: capacityWei.toString(),
      })

      createWrite({
        address: INSTALLMENT_PROCESSOR_ADDRESS,
        abi: InstallmentProcessorABI,
        functionName: 'createPurchase',
        args: [merchant, amountWei, installments, capacityWei],
      })

      console.log('Purchase creation initiated')
    } catch (error) {
      console.error('Error creating purchase:', error)
      throw error
    }
  }

  /**
   * Make an installment payment
   * @param purchaseId ID of the purchase
   * @returns Transaction hash
   */
  const makePayment = async (purchaseId: number): Promise<void> => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log('Making payment for purchase:', purchaseId)

      payWrite({
        address: INSTALLMENT_PROCESSOR_ADDRESS,
        abi: InstallmentProcessorABI,
        functionName: 'makePayment',
        args: [BigInt(purchaseId)],
      })

      console.log('Payment initiated')
    } catch (error) {
      console.error('Error making payment:', error)
      throw error
    }
  }

  /**
   * Get purchase details
   * @param purchaseId ID of the purchase
   * @returns Purchase details
   */
  const getPurchase = async (purchaseId: number): Promise<Purchase | null> => {
    if (!address) {
      return null
    }

    try {
      const { data } = await useReadContract({
        address: INSTALLMENT_PROCESSOR_ADDRESS,
        abi: InstallmentProcessorABI,
        functionName: 'getPurchase',
        args: [address, BigInt(purchaseId)],
      })

      if (!data) return null

      const [
        merchant,
        totalAmount,
        totalWithInterest,
        amountPerPayment,
        paymentsTotal,
        paymentsRemaining,
        nextPaymentDue,
        lateFees,
        isActive,
      ] = data as any[]

      return {
        merchant,
        totalAmount: formatUnits(totalAmount, 18),
        totalWithInterest: formatUnits(totalWithInterest, 18),
        amountPerPayment: formatUnits(amountPerPayment, 18),
        paymentsTotal: Number(paymentsTotal),
        paymentsRemaining: Number(paymentsRemaining),
        nextPaymentDue: Number(nextPaymentDue),
        lateFees: formatUnits(lateFees, 18),
        isActive,
      }
    } catch (error) {
      console.error('Error getting purchase:', error)
      return null
    }
  }

  /**
   * Check if payment is late
   * @param purchaseId ID of the purchase
   * @returns True if payment is late
   */
  const isPaymentLate = async (purchaseId: number): Promise<boolean> => {
    if (!address) {
      return false
    }

    try {
      const { data } = await useReadContract({
        address: INSTALLMENT_PROCESSOR_ADDRESS,
        abi: InstallmentProcessorABI,
        functionName: 'isPaymentLate',
        args: [address, BigInt(purchaseId)],
      })

      return data as boolean
    } catch (error) {
      console.error('Error checking if payment is late:', error)
      return false
    }
  }

  return {
    // Data
    liquidityPool,
    userPurchaseCount,
    activePurchases,
    totalOwed,
    isLoading,
    error: null,

    // Actions
    createPurchase,
    makePayment,
    getPurchase,
    isPaymentLate,
    isCreating,
    isPaying,
    isConfirming: isCreateConfirming || isPayConfirming,
    isConfirmed: isCreateConfirmed || isPayConfirmed,
    createError: createError as Error | null,
    paymentError: paymentError as Error | null,
  }
}
