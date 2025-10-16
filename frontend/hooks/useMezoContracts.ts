import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'

// Import contract ABIs and addresses from @mezo-org/musd-contracts
import MUSDDeployment from '@mezo-org/musd-contracts/deployments/matsnet/MUSD.json'
import BorrowerOperationsDeployment from '@mezo-org/musd-contracts/deployments/matsnet/BorrowerOperations.json'
import TroveManagerDeployment from '@mezo-org/musd-contracts/deployments/matsnet/TroveManager.json'

const MUSD_ADDRESS = (process.env.NEXT_PUBLIC_MUSD_ADDRESS || MUSDDeployment.address) as `0x${string}`
const BORROWER_OPERATIONS_ADDRESS = BorrowerOperationsDeployment.address as `0x${string}`
const TROVE_MANAGER_ADDRESS = TroveManagerDeployment.address as `0x${string}`

export interface MezoContractData {
  musdBalance: string
  musdBalanceRaw: bigint
  borrowingCapacity: string
  currentDebt: string
  collateralAmount: string
  isLoading: boolean
  error: Error | null
}

export interface MezoContractActions {
  borrowMUSD: (amount: bigint) => void
  repayMUSD: (amount: bigint) => void
  addCollateral: (amount: bigint) => void
  withdrawCollateral: (amount: bigint) => void
  isBorrowing: boolean
  isRepaying: boolean
  borrowTxHash?: `0x${string}`
  repayTxHash?: `0x${string}`
}

export function useMezoContracts(): MezoContractData & MezoContractActions {
  const { address } = useAccount()

  // Get user's MUSD balance
  const { data: musdBalance, isLoading: balanceLoading, error: balanceError } = useReadContract({
    address: MUSD_ADDRESS,
    abi: MUSDDeployment.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  })

  // Get user's trove (position) data - includes debt and collateral
  const { data: troveData, isLoading: troveLoading } = useReadContract({
    address: TROVE_MANAGER_ADDRESS,
    abi: TroveManagerDeployment.abi,
    functionName: 'Troves',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  })

  // Get entire trove details including collateral and debt
  const { data: entireTroveData } = useReadContract({
    address: TROVE_MANAGER_ADDRESS,
    abi: TroveManagerDeployment.abi,
    functionName: 'getEntireDebtAndColl',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  })

  // Borrow MUSD (open or adjust trove)
  const { writeContract: borrowWrite, data: borrowHash, isPending: isBorrowing } = useWriteContract()

  const { isLoading: isBorrowTxLoading } = useWaitForTransactionReceipt({
    hash: borrowHash,
  })

  const borrowMUSD = async (musdAmount: bigint) => {
    if (!address) return

    // Use openTrove or adjustTrove depending on if user has existing position
    // For now, we'll use openTrove - in production, check if trove exists first
    return borrowWrite({
      address: BORROWER_OPERATIONS_ADDRESS,
      abi: BorrowerOperationsDeployment.abi,
      functionName: 'openTrove',
      args: [
        parseUnits('2', 18), // _maxFeePercentage (2%)
        musdAmount, // _MUSDAmount to borrow
        address, // _upperHint
        address, // _lowerHint
      ],
      value: parseUnits('0.1', 18), // Send BTC as collateral (example: 0.1 BTC)
    })
  }

  // Repay MUSD
  const { writeContract: repayWrite, data: repayHash, isPending: isRepaying } = useWriteContract()

  const { isLoading: isRepayTxLoading } = useWaitForTransactionReceipt({
    hash: repayHash,
  })

  const repayMUSD = async (musdAmount: bigint) => {
    if (!address) return

    return repayWrite({
      address: BORROWER_OPERATIONS_ADDRESS,
      abi: BorrowerOperationsDeployment.abi,
      functionName: 'repayMUSD',
      args: [
        musdAmount, // Amount to repay
        address, // _upperHint
        address, // _lowerHint
      ],
    })
  }

  // Add collateral to existing trove
  const addCollateral = async (btcAmount: bigint) => {
    if (!address) return

    return borrowWrite({
      address: BORROWER_OPERATIONS_ADDRESS,
      abi: BorrowerOperationsDeployment.abi,
      functionName: 'addColl',
      args: [
        address, // _upperHint
        address, // _lowerHint
      ],
      value: btcAmount, // BTC amount to add
    })
  }

  // Withdraw collateral from trove
  const withdrawCollateral = async (btcAmount: bigint) => {
    if (!address) return

    return borrowWrite({
      address: BORROWER_OPERATIONS_ADDRESS,
      abi: BorrowerOperationsDeployment.abi,
      functionName: 'withdrawColl',
      args: [
        btcAmount, // Amount to withdraw
        address, // _upperHint
        address, // _lowerHint
      ],
    })
  }

  // Parse trove data
  const collateralAmount = entireTroveData ? formatUnits((entireTroveData as any)[1] || 0n, 18) : '0'
  const currentDebt = entireTroveData ? formatUnits((entireTroveData as any)[0] || 0n, 18) : '0'

  // Calculate borrowing capacity (simplified - 90% of collateral value)
  // In production, use proper oracle price and LTV calculations
  const borrowingCapacity = entireTroveData
    ? formatUnits(((entireTroveData as any)[1] || 0n) * 9n / 10n, 18)
    : '0'

  return {
    // Data
    musdBalance: musdBalance ? formatUnits(musdBalance as bigint, 18) : '0',
    musdBalanceRaw: (musdBalance as bigint) || 0n,
    borrowingCapacity,
    currentDebt,
    collateralAmount,
    isLoading: balanceLoading || troveLoading,
    error: balanceError as Error | null,

    // Actions
    borrowMUSD,
    repayMUSD,
    addCollateral,
    withdrawCollateral,
    isBorrowing: isBorrowing || isBorrowTxLoading,
    isRepaying: isRepaying || isRepayTxLoading,
    borrowTxHash: borrowHash,
    repayTxHash: repayHash,
  }
}

// Utility function to format MUSD amounts
export const formatMUSD = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `${numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} MUSD`
}

// Utility function to parse MUSD input to wei
export const parseMUSD = (amount: string): bigint => {
  return parseUnits(amount, 18)
}
