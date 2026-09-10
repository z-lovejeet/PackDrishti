import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rect',
  count = 1,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    rect: 'h-24 w-full rounded-card',
    circle: 'h-10 w-10 rounded-full shrink-0',
  };

  const shimmerStyles =
    'bg-gradient-to-r from-neutral-100 via-neutral-200/70 to-neutral-100 bg-[length:200%_100%] animate-shimmer border border-neutral-200/50';

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2 w-full" aria-busy="true" aria-live="polite">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              shimmerStyles,
              variantStyles[variant],
              className
            )}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        shimmerStyles,
        variantStyles[variant],
        className
      )}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  );
};
