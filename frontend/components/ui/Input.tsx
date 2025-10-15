import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      className,
      fullWidth = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'px-4 py-2.5 rounded-lg',
            'bg-[var(--bg-card)] border border-[var(--border-color)]',
            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--color-error-500)] focus:ring-[var(--color-error-500)]',
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {helper && !error && (
          <p className="text-xs text-[var(--text-muted)]">{helper}</p>
        )}
        {error && (
          <p className="text-xs text-[var(--color-error-500)]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
