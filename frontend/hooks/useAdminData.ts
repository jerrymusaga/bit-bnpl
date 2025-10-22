'use client'

import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import MerchantRegistryABI from '@/lib/abis/MerchantRegistry.json'
import InstallmentProcessorABI from '@/lib/abis/InstallmentProcessor.json'

const MERCHANT_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS as `0x${string}`) || '0x7f98F00d0e94642cEaE77bb686A9aD26E7c6A1FB'
const INSTALLMENT_PROCESSOR_ADDRESS = (process.env.NEXT_PUBLIC_INSTALLMENT_PROCESSOR_ADDRESS as `0x${string}`) || '0x4A8888E8a768F07AE7B24416463DDEe50d6bCe8a'

export interface MerchantData {
  address: string
  businessName: string
  storeUrl: string
  category: string
  logoText: string
  logoColor: string
  isActive: boolean
  isVerified: boolean
  totalSales: number
  totalVolume: string
  registeredAt: string
  lastTransactionAt: string
}

export interface TransactionData {
  id: number
  user: string
  purchaseId: number
  merchant: string
  amount: string
  amountWithInterest: string
  paymentsTotal: number
  paymentsRemaining: number
  status: 'active' | 'completed'
}

export interface PlatformStats {
  totalMerchants: number
  verifiedMerchants: number
  pendingVerification: number
  totalPurchases: number
  totalVolumeProcessed: string
  totalFeesCollected: string
  liquidityPool: string
  activePurchasesCount: number
}

/**
 * Hook to fetch platform-wide statistics
 */
export function usePlatformStats() {
  // Get total merchants count
  const { data: totalMerchantsData } = useReadContract({
    address: MERCHANT_REGISTRY_ADDRESS,
    abi: MerchantRegistryABI,
    functionName: 'getTotalMerchants',
  })

  // Get platform stats from InstallmentProcessor
  const { data: platformStatsData, isLoading } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'getPlatformStats',
  })

  const totalMerchants = totalMerchantsData ? Number(totalMerchantsData) : 0

  if (!platformStatsData) {
    return {
      stats: {
        totalMerchants,
        verifiedMerchants: 0,
        pendingVerification: 0,
        totalPurchases: 0,
        totalVolumeProcessed: '0',
        totalFeesCollected: '0',
        liquidityPool: '0',
        activePurchasesCount: 0,
      } as PlatformStats,
      isLoading,
    }
  }

  const [
    totalPurchases,
    totalVolumeProcessed,
    totalFeesCollected,
    liquidityPool,
    activePurchasesCount,
  ] = platformStatsData as [bigint, bigint, bigint, bigint, bigint]

  const stats: PlatformStats = {
    totalMerchants,
    verifiedMerchants: 0, // Will be calculated in component from merchant data
    pendingVerification: 0, // Will be calculated in component from merchant data
    totalPurchases: Number(totalPurchases),
    totalVolumeProcessed: formatUnits(totalVolumeProcessed, 18),
    totalFeesCollected: formatUnits(totalFeesCollected, 18),
    liquidityPool: formatUnits(liquidityPool, 18),
    activePurchasesCount: Number(activePurchasesCount),
  }

  return { stats, isLoading }
}

/**
 * Hook to fetch all merchants with pagination
 */
export function useAllMerchants(offset: number = 0, limit: number = 100) {
  // Get merchant addresses
  const { data: merchantAddresses, isLoading: addressesLoading } = useReadContract({
    address: MERCHANT_REGISTRY_ADDRESS,
    abi: MerchantRegistryABI,
    functionName: 'getMerchants',
    args: [BigInt(offset), BigInt(limit)],
  })

  const addresses = (merchantAddresses as `0x${string}`[]) || []

  return {
    merchantAddresses: addresses,
    isLoading: addressesLoading,
  }
}

/**
 * Hook to fetch all merchants with full details
 * This is optimized for marketplace display
 */
export function useAllMerchantsWithDetails(offset: number = 0, limit: number = 100) {
  const { merchantAddresses, isLoading: addressesLoading } = useAllMerchants(offset, limit)

  return {
    merchantAddresses,
    isLoading: addressesLoading,
  }
}

/**
 * Hook to fetch detailed data for a specific merchant
 */
export function useMerchantDetails(merchantAddress: `0x${string}` | undefined) {
  const { data: merchantData, isLoading } = useReadContract({
    address: MERCHANT_REGISTRY_ADDRESS,
    abi: MerchantRegistryABI,
    functionName: 'getMerchant',
    args: merchantAddress ? [merchantAddress] : undefined,
    query: {
      enabled: !!merchantAddress,
    },
  })

  if (!merchantData || !merchantAddress) {
    return { merchant: null, isLoading }
  }

  const [
    businessName,
    storeUrl,
    category,
    logoText,
    logoColor,
    isActive,
    isVerified,
    totalSales,
    totalVolume,
    registeredAt,
    lastTransactionAt,
  ] = merchantData as [
    string,
    string,
    string,
    string,
    string,
    boolean,
    boolean,
    bigint,
    bigint,
    bigint,
    bigint
  ]

  const merchant: MerchantData = {
    address: merchantAddress,
    businessName,
    storeUrl,
    category,
    logoText,
    logoColor,
    isActive,
    isVerified,
    totalSales: Number(totalSales),
    totalVolume: formatUnits(totalVolume, 18),
    registeredAt: new Date(Number(registeredAt) * 1000).toLocaleDateString(),
    lastTransactionAt: lastTransactionAt > 0
      ? new Date(Number(lastTransactionAt) * 1000).toLocaleDateString()
      : 'Never',
  }

  return { merchant, isLoading }
}

/**
 * Hook to fetch all purchases/transactions with pagination
 */
export function useAllPurchases(offset: number = 0, limit: number = 50) {
  const { data: purchasesData, isLoading } = useReadContract({
    address: INSTALLMENT_PROCESSOR_ADDRESS,
    abi: InstallmentProcessorABI,
    functionName: 'getAllPurchases',
    args: [BigInt(offset), BigInt(limit)],
  })

  if (!purchasesData) {
    return { transactions: [], isLoading }
  }

  const [
    users,
    purchaseIds,
    merchants,
    amounts,
    amountsWithInterest,
    paymentsTotal,
    paymentsRemaining,
    isActive,
  ] = purchasesData as [
    `0x${string}`[],
    bigint[],
    `0x${string}`[],
    bigint[],
    bigint[],
    number[],
    number[],
    boolean[]
  ]

  const transactions: TransactionData[] = users.map((user, index) => ({
    id: Number(purchaseIds[index]),
    user,
    purchaseId: Number(purchaseIds[index]),
    merchant: merchants[index],
    amount: formatUnits(amounts[index], 18),
    amountWithInterest: formatUnits(amountsWithInterest[index], 18),
    paymentsTotal: paymentsTotal[index],
    paymentsRemaining: paymentsRemaining[index],
    status: isActive[index] ? 'active' : 'completed',
  }))

  return { transactions, isLoading }
}
