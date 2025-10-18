'use client'

import { Calendar, CheckCircle2, Circle } from 'lucide-react'

interface PaymentTimelineProps {
  totalPayments: number
  perPayment: number
  firstPaymentDays: number
}

export function PaymentTimeline({ totalPayments, perPayment, firstPaymentDays }: PaymentTimelineProps) {
  if (totalPayments === 1) return null

  const generatePaymentDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < totalPayments; i++) {
      const daysFromNow = firstPaymentDays + (i * 14) // Bi-weekly
      const paymentDate = new Date(today)
      paymentDate.setDate(today.getDate() + daysFromNow)

      dates.push({
        number: i + 1,
        date: paymentDate,
        amount: perPayment,
      })
    }

    return dates
  }

  const payments = generatePaymentDates()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="h-5 w-5 text-[var(--color-accent-600)]" />
        <h4 className="font-semibold text-[var(--text-primary)]">Payment Schedule</h4>
      </div>

      <div className="space-y-3">
        {payments.map((payment, index) => (
          <div key={payment.number} className="flex items-start space-x-3">
            {/* Timeline Indicator */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${index === 0
                  ? 'bg-[var(--color-accent-600)] text-white'
                  : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border-2 border-[var(--border-color)]'
                }
              `}>
                {payment.number}
              </div>
              {index < payments.length - 1 && (
                <div className="w-0.5 h-8 bg-[var(--border-color)]" />
              )}
            </div>

            {/* Payment Details */}
            <div className="flex-1 pb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Payment {payment.number}
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  ${payment.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[var(--text-muted)]">
                  {formatDate(payment.date)}
                </span>
                {index === 0 && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--color-accent-600)]/10 text-[var(--color-accent-600)] rounded-full font-medium">
                    First Payment
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          💡 Payments are automatically due every 2 weeks. You&apos;ll receive reminders 3 days before each due date.
        </p>
      </div>
    </div>
  )
}
