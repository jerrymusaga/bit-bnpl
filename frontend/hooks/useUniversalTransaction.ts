'use client'

import { useState, useCallback } from 'react'
import { useAccount, useWriteContract } from 'wagmi'
import { useSendTransaction } from '@mezo-org/passport'
import { encodeFunctionData, type Address, type Abi, type Hash } from 'viem'

/**
 * Universal transaction hook that works with both Bitcoin wallets and EVM wallets
 *
 * - Bitcoin wallets (Unisat, Xverse, OKX): Uses Mezo Passport's useSendTransaction with smart account
 * - EVM wallets (MetaMask, Coinbase): Uses Wagmi's useWriteContract directly
 *
 * This hook automatically detects the wallet type and uses the appropriate method.
 */

interface WriteContractParams {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}

export function useUniversalTransaction() {
  const { connector } = useAccount()
  const [txHash, setTxHash] = useState<Hash | undefined>()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Mezo Passport hook for Bitcoin wallets
  const { sendTransaction: sendMezoTransaction } = useSendTransaction()

  // Wagmi hook for EVM wallets
  const {
    writeContract: writeEVMContract,
    data: evmTxHash,
    isPending: isEVMPending,
    error: evmError
  } = useWriteContract()

  // Detect if current wallet is a Bitcoin wallet
  const isBitcoinWallet = useCallback(() => {
    if (!connector) return false
    const walletName = connector.name.toLowerCase()
    return walletName.includes('unisat') ||
           walletName.includes('xverse') ||
           walletName.includes('okx')
  }, [connector])

  /**
   * Universal write contract function
   * Works with both Bitcoin and EVM wallets
   */
  const writeContract = useCallback(async (params: WriteContractParams) => {
    setError(null)
    setIsPending(true)

    try {
      const isBTC = isBitcoinWallet()

      if (isBTC) {
        // Bitcoin wallet: Use Mezo Passport's sendTransaction
        console.log('🪙 Bitcoin wallet detected, using Mezo Passport transaction')

        // Encode the contract call as data
        const data = encodeFunctionData({
          abi: params.abi,
          functionName: params.functionName,
          args: params.args,
        })

        // Send transaction through Mezo Passport (smart account)
        const result = await sendMezoTransaction(
          params.address,
          params.value || 0n,
          data
        )

        if (result?.hash) {
          setTxHash(result.hash)
          setIsPending(false)
          return result.hash
        } else {
          throw new Error('Transaction failed: No hash returned')
        }
      } else {
        // EVM wallet: Use standard Wagmi writeContract
        console.log('🦊 EVM wallet detected, using standard Wagmi transaction')

        writeEVMContract({
          address: params.address,
          abi: params.abi,
          functionName: params.functionName,
          args: params.args,
          value: params.value,
        })

        // Note: For EVM wallets, we rely on the useWriteContract hook's state
        setIsPending(false)
        return evmTxHash
      }
    } catch (err) {
      const error = err as Error
      console.error('❌ Transaction error:', error)
      setError(error)
      setIsPending(false)
      throw error
    }
  }, [isBitcoinWallet, sendMezoTransaction, writeEVMContract, evmTxHash])

  return {
    writeContract,
    data: txHash || evmTxHash,
    isPending: isPending || isEVMPending,
    error: error || evmError,
    isBitcoinWallet: isBitcoinWallet(),
  }
}
