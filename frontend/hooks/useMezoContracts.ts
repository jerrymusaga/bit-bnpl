import { useReadContract, useWaitForTransactionReceipt, useAccount, useChainId } from 'wagmi'
import { parseUnits, formatUnits, type Abi } from 'viem'
import { useEffect } from 'react'
import { useUniversalTransaction } from './useUniversalTransaction'

// Import contract ABIs and addresses from @mezo-org/musd-contracts
import MUSDDeployment from '@mezo-org/musd-contracts/deployments/matsnet/MUSD.json'
import BorrowerOperationsDeployment from '@mezo-org/musd-contracts/deployments/matsnet/BorrowerOperations.json'
import TroveManagerDeployment from '@mezo-org/musd-contracts/deployments/matsnet/TroveManager.json'
import PriceFeedDeployment from '@mezo-org/musd-contracts/deployments/matsnet/PriceFeed.json'

const MUSD_ADDRESS = (process.env.NEXT_PUBLIC_MUSD_ADDRESS || MUSDDeployment.address) as `0x${string}`
const BORROWER_OPERATIONS_ADDRESS = BorrowerOperationsDeployment.address as `0x${string}`
const TROVE_MANAGER_ADDRESS = TroveManagerDeployment.address as `0x${string}`
const PRICE_FEED_ADDRESS = PriceFeedDeployment.address as `0x${string}`

export interface MezoContractData {
  musdBalance: string
  musdBalanceRaw: bigint
  borrowingCapacity: string
  currentDebt: string
  accruedInterest: string
  collateralAmount: string
  btcPrice: number
  btcPriceRaw: bigint
  minNetDebt: number
  minNetDebtRaw: bigint
  liquidationReserve: number
  liquidationReserveRaw: bigint
  isRecoveryMode: boolean
  isLoading: boolean
  error: Error | null
}

export interface MezoContractActions {
  borrowMUSD: (musdAmount: bigint, btcCollateral: bigint) => void
  adjustTrove: (collWithdrawal: bigint, debtChange: bigint, isDebtIncrease: boolean, collDeposit?: bigint) => void
  repayMUSD: (amount: bigint) => void
  closeTrove: () => void
  addCollateral: (amount: bigint) => void
  withdrawCollateral: (amount: bigint) => void
  isBorrowing: boolean
  isRepaying: boolean
  borrowTxHash?: `0x${string}`
  repayTxHash?: `0x${string}`
}

export function useMezoContracts(): MezoContractData & MezoContractActions {
  const { address } = useAccount()
  const chainId = useChainId()

  // Mezo testnet chain ID
  const MEZO_TESTNET_CHAIN_ID = 31611

  // Log chain info
  useEffect(() => {
    console.log('Chain info:', { chainId, expectedChainId: MEZO_TESTNET_CHAIN_ID, isCorrectChain: chainId === MEZO_TESTNET_CHAIN_ID })
  }, [chainId])

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

  // Get BTC price from Mezo's PriceFeed contract
  const { data: btcPriceData } = useReadContract({
    address: PRICE_FEED_ADDRESS,
    abi: PriceFeedDeployment.abi,
    functionName: 'fetchPrice',
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  // Get minimum net debt from BorrowerOperations contract
  const { data: minNetDebtData } = useReadContract({
    address: BORROWER_OPERATIONS_ADDRESS,
    abi: BorrowerOperationsDeployment.abi as Abi,
    functionName: 'minNetDebt',
  })

  // Get liquidation reserve (MUSD_GAS_COMPENSATION) - amount held in reserve for liquidations
  const { data: gasCompensationData } = useReadContract({
    address: BORROWER_OPERATIONS_ADDRESS,
    abi: BorrowerOperationsDeployment.abi as Abi,
    functionName: 'MUSD_GAS_COMPENSATION',
  })

  // Check if system is in Recovery Mode
  const { data: recoveryModeData } = useReadContract({
    address: TROVE_MANAGER_ADDRESS,
    abi: TroveManagerDeployment.abi,
    functionName: 'checkRecoveryMode',
    query: {
      refetchInterval: 30000, // Check every 30 seconds
    },
  })

  // Universal transaction hook (works with both Bitcoin and EVM wallets)
  const { writeContract: borrowWrite, data: borrowHash, isPending: isBorrowing, error: borrowError, isBitcoinWallet } = useUniversalTransaction()

  // Debug logging for borrow state
  useEffect(() => {
    console.log('Borrow state changed:', { borrowHash, isBorrowing, error: borrowError, isBitcoinWallet })
    if (borrowError) {
      console.error('Write contract error:', borrowError)
    }
  }, [borrowHash, isBorrowing, borrowError, isBitcoinWallet])

  const { isLoading: isBorrowTxLoading } = useWaitForTransactionReceipt({
    hash: borrowHash,
  })

  const borrowMUSD = async (musdAmount: bigint, btcCollateral: bigint) => {
    if (!address) {
      console.error('borrowMUSD: No address connected')
      throw new Error('Wallet not connected')
    }

    if (chainId !== MEZO_TESTNET_CHAIN_ID) {
      console.error('borrowMUSD: Wrong network', { chainId, expected: MEZO_TESTNET_CHAIN_ID })
      throw new Error(`Please switch to Mezo Testnet (Chain ID: ${MEZO_TESTNET_CHAIN_ID})`)
    }

    console.log('borrowMUSD: Calling writeContract with:', {
      address: BORROWER_OPERATIONS_ADDRESS,
      functionName: 'openTrove',
      musdAmount: musdAmount.toString(),
      btcCollateral: btcCollateral.toString(),
    })

    try {
      borrowWrite({
        address: BORROWER_OPERATIONS_ADDRESS,
        abi: BorrowerOperationsDeployment.abi as Abi,
        functionName: 'openTrove',
        args: [
          musdAmount, // _debtAmount - MUSD to borrow
          address, // _upperHint
          address, // _lowerHint
        ],
        value: btcCollateral, // Send BTC as collateral (user input)
      })
      console.log('borrowMUSD: writeContract called successfully')
    } catch (err) {
      console.error('borrowMUSD: Error calling writeContract:', err)
      throw err
    }
  }

  // Repay MUSD (using separate universal transaction hook instance)
  const { writeContract: repayWrite, data: repayHash, isPending: isRepaying } = useUniversalTransaction()

  const { isLoading: isRepayTxLoading } = useWaitForTransactionReceipt({
    hash: repayHash,
  })

  const repayMUSD = async (musdAmount: bigint) => {
    if (!address) return

    return repayWrite({
      address: BORROWER_OPERATIONS_ADDRESS,
      abi: BorrowerOperationsDeployment.abi as Abi,
      functionName: 'repayMUSD',
      args: [
        musdAmount, // Amount to repay
        address, // _upperHint
        address, // _lowerHint
      ],
    })
  }

  // Close trove (repay full debt and get liquidation reserve back)
  const closeTrove = async () => {
    if (!address) return

    return repayWrite({
      address: BORROWER_OPERATIONS_ADDRESS,
      abi: BorrowerOperationsDeployment.abi as Abi,
      functionName: 'closeTrove',
      args: [],
    })
  }

  // Add collateral to existing trove
  const addCollateral = async (btcAmount: bigint) => {
    if (!address) return

    return borrowWrite({
      address: BORROWER_OPERATIONS_ADDRESS,
      abi: BorrowerOperationsDeployment.abi as Abi,
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
      abi: BorrowerOperationsDeployment.abi as Abi,
      functionName: 'withdrawColl',
      args: [
        btcAmount, // Amount to withdraw
        address, // _upperHint
        address, // _lowerHint
      ],
    })
  }

  // Adjust trove (borrow more MUSD, repay MUSD, add/remove collateral)
  const adjustTrove = async (
    collWithdrawal: bigint,
    debtChange: bigint,
    isDebtIncrease: boolean,
    collDeposit: bigint = 0n
  ) => {
    if (!address) return

    return borrowWrite({
      address: BORROWER_OPERATIONS_ADDRESS,
      abi: BorrowerOperationsDeployment.abi as Abi,
      functionName: 'adjustTrove',
      args: [
        collWithdrawal, // _collWithdrawal (amount to withdraw, 0 if none)
        debtChange, // _debtChange (amount to borrow/repay)
        isDebtIncrease, // _isDebtIncrease (true = borrow, false = repay)
        address, // _upperHint
        address, // _lowerHint
      ],
      value: collDeposit, // BTC to deposit (if adding collateral)
    })
  }

  // Parse trove data
  // getEntireDebtAndColl returns: [coll, principal, interest, pendingCollateral, pendingPrincipal, pendingInterest]
  const collateralAmount = entireTroveData ? formatUnits((entireTroveData as any)[0] || 0n, 18) : '0' // [0] = coll (BTC)
  const currentDebt = entireTroveData ? formatUnits((entireTroveData as any)[1] || 0n, 18) : '0' // [1] = principal (MUSD)
  const accruedInterest = entireTroveData ? formatUnits((entireTroveData as any)[2] || 0n, 18) : '0' // [2] = interest (MUSD)

  // Parse BTC price from PriceFeed (returns price with 18 decimals)
  const btcPriceRaw = (btcPriceData as bigint) || 0n
  const btcPrice = btcPriceRaw ? parseFloat(formatUnits(btcPriceRaw, 18)) : 83333 // Fallback to mock price

  // Parse minimum net debt (returns value with 18 decimals)
  const minNetDebtRaw = (minNetDebtData as bigint) || 0n
  const minNetDebt = minNetDebtRaw ? parseFloat(formatUnits(minNetDebtRaw, 18)) : 2000 // Fallback minimum

  // Parse liquidation reserve (MUSD_GAS_COMPENSATION) - amount held in reserve
  const liquidationReserveRaw = (gasCompensationData as bigint) || 0n
  const liquidationReserve = liquidationReserveRaw ? parseFloat(formatUnits(liquidationReserveRaw, 18)) : 200 // Fallback to 200

  // Parse Recovery Mode status
  const isRecoveryMode = (recoveryModeData as boolean) || false

  // Calculate borrowing capacity using real BTC price (90% LTV)
  const collateralAmountNum = parseFloat(collateralAmount)
  const collateralValueUSD = collateralAmountNum * btcPrice
  const borrowingCapacity = (collateralValueUSD * 0.9).toString()

  return {
    // Data
    musdBalance: musdBalance ? formatUnits(musdBalance as bigint, 18) : '0',
    musdBalanceRaw: (musdBalance as bigint) || 0n,
    borrowingCapacity,
    currentDebt,
    accruedInterest,
    collateralAmount,
    btcPrice,
    btcPriceRaw,
    minNetDebt,
    minNetDebtRaw,
    liquidationReserve,
    liquidationReserveRaw,
    isRecoveryMode,
    isLoading: balanceLoading || troveLoading,
    error: balanceError as Error | null,

    // Actions
    borrowMUSD,
    adjustTrove,
    repayMUSD,
    closeTrove,
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
