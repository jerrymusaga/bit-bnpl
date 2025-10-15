'use client'

import { useState } from 'react'
import { usePayment, PaymentType } from '@/hooks/usePayment'
import { useMezo } from '@/hooks/useMezo'

interface PaymentWidgetProps {
  amount: string
  merchantAddress: `0x${string}`
  orderId: string
  productName: string
  paymentType?: PaymentType
  onSuccess?: (txHash: string) => void
  onError?: (error: Error) => void
}

export function PaymentWidget({
  amount,
  merchantAddress,
  orderId,
  productName,
  paymentType = PaymentType.OneTime,
  onSuccess,
  onError,
}: PaymentWidgetProps) {
  const { isConnected, borrowingCapacity } = useMezo()
  const { processPayment, isPending, isConfirming, isConfirmed, error, txHash } = usePayment()
  
  const [showModal, setShowModal] = useState(false)

  const handlePayment = async () => {
    try {
      await processPayment(merchantAddress, amount, orderId, paymentType)
      if (txHash && onSuccess) {
        onSuccess(txHash)
      }
    } catch (err) {
      if (onError) {
        onError(err as Error)
      }
    }
  }

  if (!isConnected) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg cursor-not-allowed"
      >
        Connect Wallet to Pay
      </button>
    )
  }

  const canAfford = parseFloat(borrowingCapacity) >= parseFloat(amount)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!canAfford || isPending}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          canAfford
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isPending ? 'Processing...' : `Pay with BitBNPL - $${amount}`}
      </button>

      {!canAfford && (
        <p className="text-sm text-red-600 mt-2">
          Insufficient collateral. Add more Bitcoin to continue.
        </p>
      )}

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Confirm Payment</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-semibold">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-semibold text-green-600">1% annually</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Capacity:</span>
                <span className="font-semibold">${borrowingCapacity}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                {error.message}
              </div>
            )}

            {isConfirmed && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4">
                Payment successful! ✅
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isPending || isConfirming}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isPending || isConfirming || isConfirmed}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending || isConfirming ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}