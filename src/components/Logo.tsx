import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
};

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-xl bg-primary',
          sizeClasses[size]
        )}
      >
        <Leaf className="h-1/2 w-1/2 text-primary-foreground" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-semibold tracking-tight text-foreground', textSizeClasses[size])}>
            Mazzari
          </span>
          <span className="text-xs text-muted-foreground -mt-0.5">
            Landscape Management
          </span>
        </div>
      )}
    </div>
  );
}
