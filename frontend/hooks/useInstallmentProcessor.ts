'use client'

import { useEffect, useCallback } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import InstallmentProcessorABI from '@/lib/abis/InstallmentProcessor.json'
import MUSDDeployment from '@mezo-org/musd-contracts/deployments/matsnet/MUSD.json'

// Deployed contract addresses
const INSTALLMENT_PROCESSOR_ADDRESS = (process.env.NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS as `0x${string}`) || '0x059C79412565a945159c6c9E037e8D54E1093Ef8'
const MUSD_ADDRESS = (process.env.NEXT_PUBLIC_MUSD_ADDRESS || MUSDDeployment.address) as `0x${string}`

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
  approveMUSD: (amount: string) => Promise<void>
  checkMUSDAllowance: (amount: string) => Promise<boolean>
  getPurchase: (purchaseId: number) => Promise<Purchase | null>
  isPaymentLate: (purchaseId: number) => Promise<boolean>
  depositLiquidity: (amount: string) => Promise<void>
  withdrawLiquidity: (amount: string) => Promise<void>
  isCreating: boolean
  isPaying: boolean
  isApproving: boolean
  isDepositing: boolean
  isWithdrawing: boolean
  isDepositConfirming: boolean
  isDepositConfirmed: boolean
  isWithdrawConfirming: boolean
  isWithdrawConfirmed: boolean
  isApprovingConfirming: boolean
  isApprovingConfirmed: boolean
  isConfirming: boolean
  isConfirmed: boolean
  createError: Error | null
  paymentError: Error | null
  approvalError: Error | null
  depositError: Error | null
  withdrawError: Error | null
  createHash: `0x${string}` | undefined
  payHash: `0x${string}` | undefined
  approvalHash: `0x${string}` | undefined
}

export function useInstallmentProcessor(): InstallmentProcessorData & InstallmentProcessorActions {
  const { address } = useAccount()
  const publicClient = usePublicClient()

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

  const {
    writeContract: depositWrite,
    data: depositHash,
    isPending: isDepositing,
    error: depositError,
  } = useWriteContract()

  const {
    writeContract: withdrawWrite,
    data: withdrawHash,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useWriteContract()

  const {
    writeContract: approveWrite,
    data: approvalHash,
    isPending: isApproving,
    error: approvalError,
  } = useWriteContract()

  // Transaction confirmation hooks
  const { isLoading: isCreateConfirming, isSuccess: isCreateConfirmed } = useWaitForTransactionReceipt({
    hash: createHash,
  })

  const { isLoading: isPayConfirming, isSuccess: isPayConfirmed } = useWaitForTransactionReceipt({
    hash: payHash,
  })

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({
    hash: depositHash,
  })

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawConfirmed } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  })

  const { isLoading: isApprovingConfirming, isSuccess: isApprovingConfirmed } = useWaitForTransactionReceipt({
    hash: approvalHash,
  })

  // Read MUSD allowance
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    address: MUSD_ADDRESS,
    abi: MUSDDeployment.abi,
    functionName: 'allowance',
    args: address ? [address, INSTALLMENT_PROCESSOR_ADDRESS] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read MUSD balance
  const { data: musdBalanceData } = useReadContract({
    address: MUSD_ADDRESS,
    abi: MUSDDeployment.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Read contract hooks
  const { data: liquidityPoolData, isLoading: liquidityLoading } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'liquidityPool',
  })

  const { data: userPurchaseCountData, isLoading: countLoading, refetch: refetchCount } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'userPurchaseCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: activePurchasesData, isLoading: activePurchasesLoading, refetch: refetchActivePurchases } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'getUserActivePurchases',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  const { data: totalOwedData, isLoading: totalOwedLoading, refetch: refetchTotalOwed } = useReadContract({
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
   * Check if user has sufficient MUSD allowance
   * @param amount Amount in MUSD (as string)
   * @returns True if allowance is sufficient
   */
  const checkMUSDAllowance = useCallback(async (amount: string): Promise<boolean> => {
    if (!address) {
      return false
    }

    try {
      const amountWei = parseUnits(amount, 18)
      const currentAllowance = (allowanceData as bigint) || 0n

      console.log('Checking MUSD allowance:', {
        required: amountWei.toString(),
        current: currentAllowance.toString(),
        sufficient: currentAllowance >= amountWei,
      })

      return currentAllowance >= amountWei
    } catch (error) {
      console.error('Error checking allowance:', error)
      return false
    }
  }, [address, allowanceData])

  /**
   * Approve MUSD spending for InstallmentProcessor
   * @param amount Amount to approve (as string, e.g., "100.00")
   */
  const approveMUSD = async (amount: string): Promise<void> => {
    if (!address) {
      throw new Error('Wallet not connected')
    }

    try {
      const amountWei = parseUnits(amount, 18)

      console.log('Approving MUSD:', {
        amount: amount,
        amountWei: amountWei.toString(),
        spender: INSTALLMENT_PROCESSOR_ADDRESS,
      })

      approveWrite({
        address: MUSD_ADDRESS,
        abi: MUSDDeployment.abi,
        functionName: 'approve',
        args: [INSTALLMENT_PROCESSOR_ADDRESS, amountWei],
      })

      console.log('MUSD approval initiated')
    } catch (error) {
      console.error('Error approving MUSD:', error)
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

      // Get purchase details to check payment amount
      const purchase = await getPurchase(purchaseId)
      if (!purchase) {
        throw new Error('Purchase not found')
      }

      // Check MUSD balance
      const musdBalance = musdBalanceData ? formatUnits(musdBalanceData as bigint, 18) : '0'
      const paymentAmount = parseFloat(purchase.amountPerPayment)

      if (parseFloat(musdBalance) < paymentAmount) {
        throw new Error(`Insufficient MUSD balance. You have ${parseFloat(musdBalance).toFixed(2)} MUSD but need ${paymentAmount.toFixed(2)} MUSD`)
      }

      // Check allowance
      const hasAllowance = await checkMUSDAllowance(purchase.amountPerPayment)
      if (!hasAllowance) {
        throw new Error('Insufficient MUSD allowance. Please approve MUSD spending first.')
      }

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
  const getPurchase = useCallback(async (purchaseId: number): Promise<Purchase | null> => {
    if (!address || !publicClient) {
      return null
    }

    try {
      const data = await publicClient.readContract({
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
  }, [address, publicClient])

  /**
   * Check if payment is late
   * @param purchaseId ID of the purchase
   * @returns True if payment is late
   */
  const isPaymentLate = useCallback(async (purchaseId: number): Promise<boolean> => {
    if (!address || !publicClient) {
      return false
    }

    try {
      const data = await publicClient.readContract({
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
  }, [address, publicClient])

  /**
   * Deposit MUSD into liquidity pool (admin only)
   * @param amount Amount of MUSD to deposit (as string, e.g., "50000")
   */
  const depositLiquidity = async (amount: string): Promise<void> => {
    try {
      const amountInWei = parseUnits(amount, 18)

      depositWrite({
        address: INSTALLMENT_PROCESSOR_ADDRESS,
        abi: InstallmentProcessorABI,
        functionName: 'depositLiquidity',
        args: [amountInWei],
      })
    } catch (error) {
      console.error('Error depositing liquidity:', error)
      throw error
    }
  }

  /**
   * Withdraw MUSD from liquidity pool (admin only)
   * @param amount Amount of MUSD to withdraw (as string, e.g., "10000")
   */
  const withdrawLiquidity = async (amount: string): Promise<void> => {
    try {
      const amountInWei = parseUnits(amount, 18)

      withdrawWrite({
        address: INSTALLMENT_PROCESSOR_ADDRESS,
        abi: InstallmentProcessorABI,
        functionName: 'withdrawLiquidity',
        args: [amountInWei],
      })
    } catch (error) {
      console.error('Error withdrawing liquidity:', error)
      throw error
    }
  }

  // Refetch data when transactions are confirmed
  useEffect(() => {
    if (isCreateConfirmed || isPayConfirmed) {
      console.log('🔄 Transaction confirmed! Refetching purchase data...')
      // Refetch all purchase-related data
      refetchCount()
      refetchActivePurchases()
      refetchTotalOwed()
      console.log('✅ Data refetch triggered')
    }
  }, [isCreateConfirmed, isPayConfirmed, refetchCount, refetchActivePurchases, refetchTotalOwed])

  // Refetch allowance when approval is confirmed
  useEffect(() => {
    if (isApprovingConfirmed) {
      console.log('🔄 Approval confirmed! Refetching allowance...')
      refetchAllowance()
      console.log('✅ Allowance refetch triggered')
    }
  }, [isApprovingConfirmed, refetchAllowance])

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
    approveMUSD,
    checkMUSDAllowance,
    getPurchase,
    isPaymentLate,
    depositLiquidity,
    withdrawLiquidity,
    isCreating,
    isPaying,
    isApproving,
    isDepositing,
    isWithdrawing,
    isDepositConfirming,
    isDepositConfirmed,
    isWithdrawConfirming,
    isWithdrawConfirmed,
    isApprovingConfirming,
    isApprovingConfirmed,
    isConfirming: isCreateConfirming || isPayConfirming || isDepositConfirming || isWithdrawConfirming || isApprovingConfirming,
    isConfirmed: isCreateConfirmed || isPayConfirmed || isDepositConfirmed || isWithdrawConfirmed || isApprovingConfirmed,
    createError: createError as Error | null,
    paymentError: paymentError as Error | null,
    approvalError: approvalError as Error | null,
    depositError: depositError as Error | null,
    withdrawError: withdrawError as Error | null,
    createHash,
    payHash,
    approvalHash,
  }
}
