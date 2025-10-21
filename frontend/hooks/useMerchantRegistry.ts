import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import MerchantRegistryABI from '@/lib/abis/MerchantRegistry.json'

// Deployed contract address
const MERCHANT_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_MERCHANT_REGISTRY_ADDRESS as `0x${string}`) || '0x6b3eDF2bDEe7D5B5aCbf849896A1d90a8fB98927'

// Use full ABI from compiled contract
const MERCHANT_REGISTRY_ABI = MerchantRegistryABI as const

export interface MerchantData {
  businessName: string
  storeUrl: string
  category: string
  logoText: string
  logoColor: string
  isActive: boolean
  isVerified: boolean
  totalSales: number
  totalVolume: string // BigInt as string
  registeredAt: number
}

// Hook for fetching multiple merchants (admin use)
export function useAllMerchants() {
  const [merchants] = useState<Array<MerchantData & { address: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get total merchants count
  const { data: totalMerchants } = useReadContract({
    address: MERCHANT_REGISTRY_ADDRESS,
    abi: MERCHANT_REGISTRY_ABI,
    functionName: 'getTotalMerchants',
  })

  // Get merchant addresses
  const { data: merchantAddresses, refetch: refetchAddresses } = useReadContract({
    address: MERCHANT_REGISTRY_ADDRESS,
    abi: MERCHANT_REGISTRY_ABI,
    functionName: 'getMerchants',
    args: [0n, totalMerchants || 100n], // Fetch all merchants (max 100 for now)
    query: {
      enabled: !!totalMerchants && totalMerchants > 0n,
    },
  })

  // Fetch merchant data for all addresses
  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!merchantAddresses || !Array.isArray(merchantAddresses)) return

      setIsLoading(true)
      // Note: In production, you'd want to batch these calls or use multicall
      // For now, we'll just use mock data after addresses are fetched
      // TODO: Implement actual contract reads for each merchant
      setIsLoading(false)
    }

    fetchMerchantData()
  }, [merchantAddresses])

  return {
    merchants,
    totalMerchants: totalMerchants ? Number(totalMerchants) : 0,
    merchantAddresses: (merchantAddresses as `0x${string}`[]) || [],
    isLoading,
    refetch: refetchAddresses,
  }
}

export function useMerchantRegistry() {
  const { address } = useAccount()
  const [merchantData, setMerchantData] = useState<MerchantData | null>(null)

  // Read merchant data
  const { data: merchantRawData, refetch: refetchMerchant } = useReadContract({
    address: MERCHANT_REGISTRY_ADDRESS,
    abi: MERCHANT_REGISTRY_ABI,
    functionName: 'getMerchant',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Check if merchant is active
  const { data: isActiveMerchant } = useReadContract({
    address: MERCHANT_REGISTRY_ADDRESS,
    abi: MERCHANT_REGISTRY_ABI,
    functionName: 'isActiveMerchant',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Get total merchants count
  const { data: totalMerchants } = useReadContract({
    address: MERCHANT_REGISTRY_ADDRESS,
    abi: MERCHANT_REGISTRY_ABI,
    functionName: 'getTotalMerchants',
  })

  // Register merchant mutation
  const { data: registerHash, writeContract: registerMerchant } = useWriteContract()

  const { isLoading: isRegistering, isSuccess: isRegistered } =
    useWaitForTransactionReceipt({
      hash: registerHash,
    })

  // Update merchant mutation
  const { data: updateHash, writeContract: updateMerchant } = useWriteContract()

  const { isLoading: isUpdating, isSuccess: isUpdated } = useWaitForTransactionReceipt({
    hash: updateHash,
  })

  // Admin: Verify merchant mutation
  const { data: verifyHash, writeContract: verifyMerchantWrite } = useWriteContract()

  const { isLoading: isVerifying, isSuccess: isVerifySuccess } = useWaitForTransactionReceipt({
    hash: verifyHash,
  })

  // Admin: Deactivate merchant mutation
  const { data: deactivateHash, writeContract: deactivateMerchantWrite } = useWriteContract()

  const { isLoading: isDeactivating, isSuccess: isDeactivateSuccess } =
    useWaitForTransactionReceipt({
      hash: deactivateHash,
    })

  // Parse merchant data
  useEffect(() => {
    if (merchantRawData && Array.isArray(merchantRawData)) {
      setMerchantData({
        businessName: merchantRawData[0] as string,
        storeUrl: merchantRawData[1] as string,
        category: merchantRawData[2] as string,
        logoText: merchantRawData[3] as string,
        logoColor: merchantRawData[4] as string,
        isActive: merchantRawData[5] as boolean,
        isVerified: merchantRawData[6] as boolean,
        totalSales: Number(merchantRawData[7]),
        totalVolume: (merchantRawData[8] as bigint).toString(),
        registeredAt: Number(merchantRawData[9]),
      })
    }
  }, [merchantRawData])

  // Refetch merchant data after registration/update
  useEffect(() => {
    if (isRegistered || isUpdated) {
      refetchMerchant()
    }
  }, [isRegistered, isUpdated, refetchMerchant])

  // Calculate platform fee for an amount
  const calculatePlatformFee = (amount: string) => {
    // 1% = amount / 100
    const amountNum = parseFloat(amount)
    return (amountNum * 0.01).toFixed(2)
  }

  // Calculate merchant's net amount after fee
  const calculateMerchantAmount = (amount: string) => {
    const amountNum = parseFloat(amount)
    const fee = amountNum * 0.01
    return (amountNum - fee).toFixed(2)
  }

  // Register new merchant
  const register = async (params: {
    walletAddress: `0x${string}`
    businessName: string
    storeUrl: string
    category: string
    logoText: string
    logoColor: string
  }) => {
    return registerMerchant({
      address: MERCHANT_REGISTRY_ADDRESS,
      abi: MERCHANT_REGISTRY_ABI,
      functionName: 'registerMerchant',
      args: [
        params.walletAddress,
        params.businessName,
        params.storeUrl,
        params.category,
        params.logoText,
        params.logoColor,
      ],
    })
  }

  // Update merchant info
  const update = async (params: {
    businessName: string
    storeUrl: string
    category: string
    logoText: string
    logoColor: string
  }) => {
    return updateMerchant({
      address: MERCHANT_REGISTRY_ADDRESS,
      abi: MERCHANT_REGISTRY_ABI,
      functionName: 'updateMerchant',
      args: [
        params.businessName,
        params.storeUrl,
        params.category,
        params.logoText,
        params.logoColor,
      ],
    })
  }

  // Admin: Verify merchant
  const verifyMerchant = async (walletAddress: `0x${string}`) => {
    return verifyMerchantWrite({
      address: MERCHANT_REGISTRY_ADDRESS,
      abi: MERCHANT_REGISTRY_ABI,
      functionName: 'verifyMerchant',
      args: [walletAddress],
    })
  }

  // Admin: Deactivate merchant
  const deactivateMerchant = async (walletAddress: `0x${string}`) => {
    return deactivateMerchantWrite({
      address: MERCHANT_REGISTRY_ADDRESS,
      abi: MERCHANT_REGISTRY_ABI,
      functionName: 'deactivateMerchant',
      args: [walletAddress],
    })
  }

  return {
    // Data
    merchantData,
    isActive: isActiveMerchant as boolean,
    totalMerchants: totalMerchants ? Number(totalMerchants) : 0,

    // Actions
    register,
    update,

    // Admin Actions
    verifyMerchant,
    deactivateMerchant,

    // Loading states
    isRegistering,
    isRegistered,
    isUpdating,
    isUpdated,
    isVerifying,
    isVerifySuccess,
    isDeactivating,
    isDeactivateSuccess,

    // Helpers
    calculatePlatformFee,
    calculateMerchantAmount,
    refetchMerchant,
  }
}
