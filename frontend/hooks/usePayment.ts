'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { useState } from 'react'

const PAYMENT_PROCESSOR_ABI: never[] = [] // TODO: Add your contract ABI
const PAYMENT_PROCESSOR_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS as `0x${string}`

export enum PaymentType {
  OneTime = 0,
  Subscription = 1,
  InGame = 2,
  CreatorSupport = 3,
}

export function usePayment() {
  const [paymentId, setPaymentId] = useState<string | null>(null)
  
  const { 
    writeContract, 
    data: hash,
    isPending,
    error 
  } = useWriteContract()

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  })

  const processPayment = async (
    merchant: `0x${string}`,
    amount: string,
    orderId: string,
    paymentType: PaymentType
  ) => {
    try {
      writeContract({
        address: PAYMENT_PROCESSOR_ADDRESS,
        abi: PAYMENT_PROCESSOR_ABI,
        functionName: 'processPayment',
        args: [
          merchant,
          parseEther(amount),
          orderId,
          paymentType
        ],
      })
    } catch (err) {
      console.error('Payment error:', err)
      throw err
    }
  }

  return {
    processPayment,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    txHash: hash,
    paymentId,
  }
}