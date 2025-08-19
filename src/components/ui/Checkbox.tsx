import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id={checkboxId}
              ref={ref}
              type="checkbox"
              className={cn(
                'h-4 w-4 rounded border border-border bg-input text-primary transition-colors',
                'focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error && 'border-error-500 focus:ring-error-500',
                className
              )}
              {...props}
            />
          </div>
          {(label || description) && (
            <div className="flex-1">
              {label && (
                <label
                  htmlFor={checkboxId}
                  className="block text-sm font-medium text-foreground cursor-pointer"
                >
                  {label}
                </label>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;