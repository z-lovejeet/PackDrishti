import React from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'saffron';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  className,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium font-sans transition-all duration-150 rounded-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const sizeStyles = {
    sm: 'text-2xs h-8 px-3 gap-1.5',
    md: 'text-sm h-10 px-4 gap-2',
    lg: 'text-base h-11 px-5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-navy-800 text-white hover:bg-navy-900 active:bg-navy-950 shadow-xs border border-transparent focus-visible:ring-navy-800',
    secondary:
      'bg-navy-50 text-navy-800 border border-navy-200 hover:bg-navy-100 hover:border-navy-300 active:bg-navy-200 focus-visible:ring-navy-800',
    saffron:
      'bg-saffron-500 text-white hover:bg-saffron-600 active:bg-saffron-700 shadow-xs border border-transparent focus-visible:ring-saffron-500',
    outline:
      'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-400 active:bg-neutral-100 shadow-xs focus-visible:ring-neutral-400',
    danger:
      'bg-violation text-white hover:bg-violation-hover active:bg-red-800 shadow-xs border border-transparent focus-visible:ring-violation',
    ghost:
      'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 focus-visible:ring-neutral-300',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-4 w-4 text-current shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="opacity-80"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="shrink-0 flex items-center">{icon}</span>}
          {children && <span>{children}</span>}
          {icon && iconPosition === 'right' && <span className="shrink-0 flex items-center">{icon}</span>}
        </>
      )}
    </button>
  );
};
