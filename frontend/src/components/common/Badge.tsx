import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?:
    | 'compliant'
    | 'violation'
    | 'warning'
    | 'info'
    | 'neutral'
    | 'success'
    | 'danger'
    | 'primary'
    | 'saffron';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  className,
  ...props
}) => {
  // Normalize variant aliases
  const normalizedVariant = (() => {
    switch (variant) {
      case 'success':
        return 'compliant';
      case 'danger':
        return 'violation';
      case 'primary':
        return 'info';
      default:
        return variant;
    }
  })();

  const variantStyles = {
    compliant: 'bg-success-light text-success border-success-border',
    violation: 'bg-violation-light text-violation border-violation-border',
    warning: 'bg-warning-light text-saffron-700 border-warning-border',
    saffron: 'bg-saffron-50 text-saffron-700 border-saffron-200',
    info: 'bg-navy-50 text-navy-800 border-navy-200',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  };

  const dotStyles = {
    compliant: 'bg-success',
    violation: 'bg-violation',
    warning: 'bg-saffron-500',
    saffron: 'bg-saffron-500',
    info: 'bg-navy-800',
    neutral: 'bg-neutral-400',
  };

  const sizeStyles = {
    sm: 'text-2xs px-2.5 py-0.5 gap-1.5 leading-normal',
    md: 'text-xs px-3 py-1 gap-1.5 leading-normal',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-badge border font-medium font-sans tracking-wide transition-colors select-none',
        variantStyles[normalizedVariant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx('h-1.5 w-1.5 rounded-full shrink-0', dotStyles[normalizedVariant])}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
