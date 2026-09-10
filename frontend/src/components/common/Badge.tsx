import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'compliant' | 'violation' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    compliant: 'bg-success-light text-success border-success-border',
    violation: 'bg-violation-light text-violation border-violation-border',
    warning: 'bg-warning-light text-[#B7791F] border-warning-border',
    info: 'bg-primary-light text-primary border-primary-border',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-[12px] px-2.5 py-0.5 font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full border leading-tight transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
