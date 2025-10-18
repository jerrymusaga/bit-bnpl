'use client'

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface TransactionProgressProps {
  isProcessing: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hasError: boolean
  error?: string | null
}

export function TransactionProgress({
  isProcessing,
  isConfirming,
  isConfirmed,
  hasError,
  error,
}: TransactionProgressProps) {
  if (!isProcessing && !isConfirming && !isConfirmed && !hasError) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {hasError ? (
          // Error State
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Transaction Failed
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {error || 'An error occurred while processing your transaction'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[var(--color-accent-600)] text-white rounded-lg hover:bg-[var(--color-accent-700)] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isConfirmed ? (
          // Success State
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              Transaction Confirmed!
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Your purchase has been processed successfully
            </p>
          </div>
        ) : (
          // Loading State
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--color-accent-600)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-[var(--color-accent-600)] animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
              {isProcessing ? 'Processing Transaction' : 'Confirming Transaction'}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {isProcessing
                ? 'Please confirm the transaction in your wallet...'
                : 'Waiting for blockchain confirmation...'}
            </p>

            {/* Progress Steps */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isProcessing || isConfirming
                    ? 'bg-[var(--color-accent-600)] text-white'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                }`}>
                  {isProcessing || isConfirming ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-xs">1</span>
                  )}
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  Wallet confirmation
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isConfirming
                    ? 'bg-[var(--color-accent-600)]'
                    : 'bg-[var(--bg-secondary)]'
                }`}>
                  {isConfirming ? (
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">2</span>
                  )}
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  Blockchain confirmation
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                  <span className="text-xs text-[var(--text-muted)]">3</span>
                </div>
                <span className="text-sm text-[var(--text-secondary)]">
                  Purchase complete
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] mt-6">
              This may take a few moments. Please don&apos;t close this window.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
