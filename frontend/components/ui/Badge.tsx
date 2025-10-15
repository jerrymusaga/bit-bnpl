import { HTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'accent' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      children,
      className,
      variant = 'default',
      size = 'md',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-colors'

    const variants = {
      default: 'bg-[var(--color-primary-600)] text-white',
      success: 'bg-[var(--color-success-500)]/10 text-[var(--color-success-500)] border border-[var(--color-success-500)]/20',
      error: 'bg-[var(--color-error-500)]/10 text-[var(--color-error-500)] border border-[var(--color-error-500)]/20',
      warning: 'bg-[var(--color-warning-500)]/10 text-[var(--color-warning-500)] border border-[var(--color-warning-500)]/20',
      accent: 'bg-[var(--color-accent-600)]/10 text-[var(--color-accent-600)] border border-[var(--color-accent-600)]/20',
      neutral: 'bg-[var(--color-neutral-700)] text-[var(--text-secondary)]',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'
