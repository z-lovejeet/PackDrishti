import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    rect: 'h-24 w-full rounded-[6px]',
    circle: 'h-10 w-10 rounded-full',
  };

  return (
    <div
      className={clsx(
        'animate-pulse bg-neutral-200/80',
        variantStyles[variant],
        className
      )}
    />
  );
};
