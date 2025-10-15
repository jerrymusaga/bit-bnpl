// contract ABIs
export const PAYMENT_PROCESSOR_ABI = [
  {
    inputs: [
      { name: 'merchant', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'orderId', type: 'string' },
      { name: 'paymentType', type: 'uint8' }
    ],
    name: 'processPayment',
    outputs: [{ name: 'paymentId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // ... add other functions
] as const

export const PAYMENT_PROCESSOR_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_PROCESSOR_ADDRESS as `0x${string}`

// You can also export Mezo Vault and MUSD ABIs here