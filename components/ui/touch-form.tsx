'use client';

import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TouchButton } from './touch-button';

// Touch-optimized form container
export interface TouchFormProps {
  children: ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  onSubmit?: (e: React.FormEvent) => void;
}

export const TouchForm = forwardRef<HTMLFormElement, TouchFormProps>(
  ({ children, className, spacing = 'md', onSubmit }, ref) => {
    const spacingClasses = {
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8'
    };

    return (
      <form
        ref={ref}
        onSubmit={onSubmit}
        className={cn('w-full', spacingClasses[spacing], className)}
      >
        {children}
      </form>
    );
  }
);

TouchForm.displayName = 'TouchForm';

// Touch-optimized input field
export interface TouchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  touchSize?: 'md' | 'lg' | 'xl';
}

export const TouchInput = forwardRef<HTMLInputElement, TouchInputProps>(
  ({ 
    label, 
    error, 
    hint, 
    icon, 
    touchSize = 'lg',
    className, 
    ...props 
  }, ref) => {
    const sizeClasses = {
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-5 text-lg',
      xl: 'h-16 px-6 text-xl'
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'w-full rounded-lg border border-input bg-background',
              'focus:border-primary focus:ring-2 focus:ring-primary/20',
              'transition-all duration-200 touch-manipulation',
              'placeholder:text-muted-foreground',
              sizeClasses[touchSize],
              icon && 'pl-12',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            {...props}
          />
        </div>
        
        {hint && !error && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

TouchInput.displayName = 'TouchInput';

// Touch-optimized textarea
export interface TouchTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  touchSize?: 'md' | 'lg' | 'xl';
  autoResize?: boolean;
}

export const TouchTextarea = forwardRef<HTMLTextAreaElement, TouchTextareaProps>(
  ({ 
    label, 
    error, 
    hint, 
    touchSize = 'lg',
    autoResize = false,
    className, 
    ...props 
  }, ref) => {
    const sizeClasses = {
      md: 'min-h-[96px] p-4 text-base',
      lg: 'min-h-[112px] p-5 text-lg',
      xl: 'min-h-[128px] p-6 text-xl'
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-input bg-background',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            'transition-all duration-200 touch-manipulation',
            'placeholder:text-muted-foreground resize-none',
            sizeClasses[touchSize],
            autoResize && 'resize-y',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          {...props}
        />
        
        {hint && !error && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

TouchTextarea.displayName = 'TouchTextarea';

// Touch-optimized select
export interface TouchSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  touchSize?: 'md' | 'lg' | 'xl';
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const TouchSelect = forwardRef<HTMLSelectElement, TouchSelectProps>(
  ({ 
    label, 
    error, 
    hint, 
    touchSize = 'lg',
    options,
    className, 
    ...props 
  }, ref) => {
    const sizeClasses = {
      md: 'h-12 px-4 text-base',
      lg: 'h-14 px-5 text-lg',
      xl: 'h-16 px-6 text-xl'
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-input bg-background',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            'transition-all duration-200 touch-manipulation',
            'appearance-none cursor-pointer',
            sizeClasses[touchSize],
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {hint && !error && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

TouchSelect.displayName = 'TouchSelect';

// Touch-optimized checkbox
export interface TouchCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  hint?: string;
  size?: 'md' | 'lg';
  className?: string;
}

export function TouchCheckbox({
  label,
  checked = false,
  onChange,
  error,
  hint,
  size = 'lg',
  className
}: TouchCheckboxProps) {
  const sizeClasses = {
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className="flex items-start space-x-3 cursor-pointer touch-manipulation">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange?.(e.target.checked)}
          className={cn(
            'rounded border-2 border-input bg-background',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'checked:bg-primary checked:border-primary',
            'transition-all duration-200',
            sizeClasses[size]
          )}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {hint && (
            <p className="text-xs text-muted-foreground mt-1">{hint}</p>
          )}
        </div>
      </label>
      
      {error && (
        <p className="text-sm text-destructive ml-9">{error}</p>
      )}
    </div>
  );
}

// Touch-optimized form actions
export interface TouchFormActionsProps {
  children: ReactNode;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export function TouchFormActions({
  children,
  className,
  layout = 'horizontal',
  spacing = 'md'
}: TouchFormActionsProps) {
  const layoutClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col'
  };

  const spacingClasses = {
    sm: layout === 'horizontal' ? 'space-x-2' : 'space-y-2',
    md: layout === 'horizontal' ? 'space-x-4' : 'space-y-4',
    lg: layout === 'horizontal' ? 'space-x-6' : 'space-y-6'
  };

  return (
    <div className={cn(
      layoutClasses[layout],
      spacingClasses[spacing],
      'w-full',
      className
    )}>
      {children}
    </div>
  );
}
