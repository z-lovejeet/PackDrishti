import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderStyle?: 'normal' | 'thick-left-primary' | 'thick-left-violation' | 'thick-left-warning' | 'thick-left-success';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  borderStyle = 'normal',
  onClick,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-6',
  };

  const borderStyles = {
    'normal': 'border border-neutral-200',
    'thick-left-primary': 'border border-neutral-200 border-l-4 border-l-primary',
    'thick-left-violation': 'border border-neutral-200 border-l-4 border-l-violation',
    'thick-left-warning': 'border border-neutral-200 border-l-4 border-l-warning',
    'thick-left-success': 'border border-neutral-200 border-l-4 border-l-success',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-[8px] transition-all',
        borderStyles[borderStyle],
        paddingStyles[padding],
        onClick && 'cursor-pointer hover:border-neutral-300 hover:shadow-sm',
        className
      )}
    >
      {children}
    </div>
  );
};
