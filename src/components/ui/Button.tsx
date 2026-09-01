import { cn } from '@/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-light shadow-card hover:shadow-elevated transition-shadow duration-200',
  secondary: 'bg-accent text-primary hover:bg-accent-light shadow-card hover:shadow-elevated transition-shadow duration-200',
  outline: 'border-2 border-primary text-primary hover:bg-primary/5 hover:shadow-soft transition-shadow duration-200',
  ghost: 'text-text hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-soft transition-shadow duration-200',
  danger: 'bg-danger text-white hover:bg-red-700 dark:hover:bg-red-600 shadow-card hover:shadow-elevated transition-shadow duration-200',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
