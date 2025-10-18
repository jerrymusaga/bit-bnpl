'use client'

import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'

interface CollateralHealthMeterProps {
  collateralRatio: number
  healthFactor: number
}

export function CollateralHealthMeter({ collateralRatio, healthFactor }: CollateralHealthMeterProps) {
  // Determine health status
  const getHealthStatus = () => {
    if (healthFactor >= 2.0) return { label: 'Excellent', color: 'green', icon: CheckCircle }
    if (healthFactor >= 1.5) return { label: 'Good', color: 'blue', icon: CheckCircle }
    if (healthFactor >= 1.3) return { label: 'Fair', color: 'yellow', icon: AlertTriangle }
    return { label: 'At Risk', color: 'red', icon: ShieldAlert }
  }

  const health = getHealthStatus()
  const Icon = health.icon

  // Calculate meter percentage (cap at 100%)
  const meterPercentage = Math.min((collateralRatio / 300) * 100, 100)

  // Color classes based on health
  const colorClasses = {
    green: {
      bg: 'bg-green-500',
      text: 'text-green-500',
      border: 'border-green-500',
      glow: 'bg-green-500/10',
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      border: 'border-blue-500',
      glow: 'bg-blue-500/10',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-500',
      border: 'border-yellow-500',
      glow: 'bg-yellow-500/10',
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-500',
      border: 'border-red-500',
      glow: 'bg-red-500/10',
    },
  }

  const colors = colorClasses[health.color as keyof typeof colorClasses]

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className={`h-5 w-5 ${colors.text}`} />
          <span className="font-semibold text-[var(--text-primary)]">Position Health</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${colors.glow} ${colors.text}`}>
          {health.label}
        </span>
      </div>

      {/* Health Factor Display */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-[var(--text-secondary)]">Health Factor</span>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {healthFactor.toFixed(2)}
        </span>
      </div>

      {/* Visual Meter */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden border border-[var(--border-color)]">
          {/* Progress Bar */}
          <div
            className={`h-full ${colors.bg} transition-all duration-500 ease-out relative`}
            style={{ width: `${meterPercentage}%` }}
          >
            {/* Glow Effect */}
            <div className={`absolute inset-0 ${colors.bg} opacity-50 blur-sm`}></div>
          </div>
        </div>

        {/* Threshold Markers */}
        <div className="absolute top-0 left-0 w-full h-3 pointer-events-none">
          {/* Liquidation Threshold (110%) */}
          <div className="absolute left-[36.67%] top-0 h-full w-0.5 bg-red-500/50" />
          {/* Critical Threshold (150%) */}
          <div className="absolute left-[50%] top-0 h-full w-0.5 bg-yellow-500/50" />
          {/* Safe Threshold (200%) */}
          <div className="absolute left-[66.67%] top-0 h-full w-0.5 bg-green-500/50" />
        </div>
      </div>

      {/* Threshold Labels */}
      <div className="flex justify-between text-xs text-[var(--text-muted)]">
        <span>110% (Min)</span>
        <span>150%</span>
        <span>200%</span>
        <span>300%</span>
      </div>

      {/* Collateral Ratio */}
      <div className="pt-3 border-t border-[var(--border-color)]">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-[var(--text-secondary)]">Collateral Ratio</span>
          <span className={`text-xl font-bold ${colors.text}`}>
            {collateralRatio.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Warning Messages */}
      {healthFactor < 1.5 && (
        <div className={`p-3 rounded-lg border ${colors.glow} ${colors.border}/20`}>
          <div className="flex items-start space-x-2">
            <AlertTriangle className={`h-4 w-4 ${colors.text} mt-0.5 flex-shrink-0`} />
            <div className="text-xs">
              {healthFactor < 1.3 ? (
                <p className={colors.text}>
                  <strong>Warning:</strong> Your position is at risk. Consider adding more BTC collateral or repaying MUSD to avoid liquidation.
                </p>
              ) : (
                <p className={colors.text}>
                  <strong>Notice:</strong> Your health factor is below recommended levels. Monitor your position closely.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
