import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white focus:ring-[var(--color-primary-500)] border border-[var(--color-primary-500)]',
      secondary: 'bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] focus:ring-[var(--color-primary-500)] border border-[var(--border-color)]',
      outline: 'bg-transparent hover:bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-[var(--color-primary-500)] border border-[var(--border-color)]',
      ghost: 'bg-transparent hover:bg-[var(--bg-card)] text-[var(--text-primary)] focus:ring-[var(--color-primary-500)]',
      accent: 'bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-500)] text-white focus:ring-[var(--color-accent-500)] border-0 shadow-lg',
      danger: 'bg-[var(--color-error-600)] hover:bg-[var(--color-error-500)] text-white focus:ring-[var(--color-error-500)] border-0',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
