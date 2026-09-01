import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddings = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, className, hover, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border shadow-card',
        paddings[padding],
        hover && 'transition-all duration-200 hover:shadow-elevated hover:border-primary/20 hover:-translate-y-0.5',
        className
      )}
    >
      {children}
    </div>
  );
}
