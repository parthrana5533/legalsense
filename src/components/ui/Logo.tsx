import { Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: 'text-xl' },
  md: { icon: 28, text: 'text-2xl' },
  lg: { icon: 36, text: 'text-3xl' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <Link to="/" className={cn('flex items-center gap-3 group', className)}>
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary text-accent transition-transform group-hover:scale-105 shadow-soft">
        <Scale size={s.icon} strokeWidth={2} />
      </div>
      {showText && (
        <span className={cn('font-heading font-bold text-primary tracking-tight', s.text)}>
          Legal<span className="text-accent">Sense</span>
        </span>
      )}
    </Link>
  );
}
