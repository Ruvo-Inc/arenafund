import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              id={radioId}
              ref={ref}
              type="radio"
              className={cn(
                'h-4 w-4 border border-border bg-input text-primary transition-colors',
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
                  htmlFor={radioId}
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

Radio.displayName = 'Radio';

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ name, options, value, onChange, label, error, className }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-3', className)}>
        {label && (
          <div className="text-sm font-medium text-foreground">{label}</div>
        )}
        <div className="space-y-2">
          {options.map((option) => (
            <Radio
              key={option.value}
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              disabled={option.disabled}
              label={option.label}
              description={option.description}
              error={error}
            />
          ))}
        </div>
        {error && <p className="text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup };