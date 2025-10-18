'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | ReactNode
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  color?: 'primary' | 'success' | 'warning' | 'error' | 'accent'
  className?: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'primary',
  className = '',
}: StatsCardProps) {
  const colorClasses = {
    primary: {
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      gradient: 'from-blue-500/10 to-blue-500/5',
    },
    success: {
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      gradient: 'from-green-500/10 to-green-500/5',
    },
    warning: {
      iconBg: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      gradient: 'from-yellow-500/10 to-yellow-500/5',
    },
    error: {
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      gradient: 'from-red-500/10 to-red-500/5',
    },
    accent: {
      iconBg: 'bg-[var(--color-accent-600)]/10',
      iconColor: 'text-[var(--color-accent-600)]',
      gradient: 'from-[var(--color-accent-600)]/10 to-[var(--color-accent-600)]/5',
    },
  }

  const colors = colorClasses[color]

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border border-[var(--border-color)]
        bg-gradient-to-br ${colors.gradient}
        p-6 transition-all hover:shadow-lg hover:border-[var(--color-accent-600)]/30
        ${className}
      `}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors.iconBg}`}>
          <Icon className={`h-6 w-6 ${colors.iconColor}`} />
        </div>
        {trend && (
          <span
            className={`text-sm font-semibold ${
              trend.isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm text-[var(--text-secondary)] mb-2">{title}</p>

      {/* Value */}
      <div className="text-3xl font-bold text-[var(--text-primary)] mb-1">
        {value}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
      )}

      {/* Decorative Element */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${colors.iconBg} rounded-full opacity-20 blur-2xl`} />
    </div>
  )
}
