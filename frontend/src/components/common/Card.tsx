import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated' | 'accent-left';
  borderStyle?:
    | 'normal'
    | 'thick-left-primary'
    | 'thick-left-violation'
    | 'thick-left-warning'
    | 'thick-left-success'
    | 'thick-left-saffron';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  variant = 'default',
  borderStyle = 'normal',
  onClick,
  ...props
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  const variantStyles = {
    default: 'bg-white border border-neutral-200 shadow-card',
    outlined: 'bg-white border border-neutral-200 shadow-none',
    elevated: 'bg-white border border-neutral-200/80 shadow-dropdown',
    'accent-left': 'bg-white border border-neutral-200 border-l-4 border-l-navy-800 shadow-card',
  };

  const borderStyles = {
    normal: '',
    'thick-left-primary': 'border-l-4 border-l-navy-800',
    'thick-left-violation': 'border-l-4 border-l-violation',
    'thick-left-warning': 'border-l-4 border-l-warning',
    'thick-left-success': 'border-l-4 border-l-success',
    'thick-left-saffron': 'border-l-4 border-l-saffron-500',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-card transition-all duration-200',
        variantStyles[variant],
        borderStyle !== 'normal' && borderStyles[borderStyle],
        paddingStyles[padding],
        onClick &&
          'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover hover:border-neutral-300 active:translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
