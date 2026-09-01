import { cn } from '@/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-base font-medium text-text">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-xl border border-border bg-surface px-5 py-4 text-base text-text',
          'placeholder:text-text-muted transition-all duration-200 resize-y min-h-[140px]',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-soft',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
