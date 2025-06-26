'use client';

import { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, ResponsiveFlex } from '@/components/layout/responsive-container';
import { TouchButton } from '@/components/ui/touch-button';

// Responsive form container with adaptive layout
export interface ResponsiveFormProps {
  children: ReactNode;
  className?: string;
  layout?: 'single' | 'two-column' | 'adaptive';
  spacing?: 'compact' | 'comfortable' | 'spacious';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  onSubmit?: (e: React.FormEvent) => void;
}

export const ResponsiveForm = forwardRef<HTMLFormElement, ResponsiveFormProps>(
  (
    { children, className, layout = 'single', spacing = 'comfortable', maxWidth = 'lg', onSubmit },
    ref
  ) => {
    const spacingClasses = {
      compact: 'space-y-3',
      comfortable: 'space-y-4 md:space-y-6',
      spacious: 'space-y-6 md:space-y-8',
    };

    const maxWidthClasses = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full',
    };

    const layoutClasses = {
      single: 'grid grid-cols-1',
      'two-column': 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
      adaptive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
    };

    return (
      <ResponsiveContainer size="xl" centerContent>
        <form
          ref={ref}
          onSubmit={onSubmit}
          className={cn(
            'mx-auto w-full',
            maxWidthClasses[maxWidth],
            spacingClasses[spacing],
            layout !== 'single' && layoutClasses[layout],
            className
          )}
        >
          {children}
        </form>
      </ResponsiveContainer>
    );
  }
);

ResponsiveForm.displayName = 'ResponsiveForm';

// Responsive form field with adaptive sizing
export interface ResponsiveFieldProps {
  children: ReactNode;
  className?: string;
  span?: 'full' | 'half' | 'third' | 'auto';
  order?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

export function ResponsiveField({
  children,
  className,
  span = 'auto',
  order,
}: ResponsiveFieldProps) {
  const spanClasses = {
    full: 'col-span-full',
    half: 'col-span-1 md:col-span-1',
    third: 'col-span-1 md:col-span-1 lg:col-span-1',
    auto: '',
  };

  const orderClasses = order
    ? [
        order.mobile && `order-${order.mobile}`,
        order.tablet && `md:order-${order.tablet}`,
        order.desktop && `lg:order-${order.desktop}`,
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  return <div className={cn(spanClasses[span], orderClasses, className)}>{children}</div>;
}

// Responsive input with mobile optimizations
export interface ResponsiveInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  variant?: 'default' | 'filled' | 'underlined';
  mobileKeyboard?: 'default' | 'numeric' | 'email' | 'tel' | 'url' | 'search';
}

export const ResponsiveInput = forwardRef<HTMLInputElement, ResponsiveInputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      size = 'responsive',
      variant = 'default',
      mobileKeyboard = 'default',
      className,
      type = 'text',
      ...props
    },
    ref
  ) => {
    // Mobile keyboard optimization
    const getInputMode = () => {
      switch (mobileKeyboard) {
        case 'numeric':
          return 'numeric';
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'url':
          return 'url';
        case 'search':
          return 'search';
        default:
          return 'text';
      }
    };

    const getInputType = () => {
      switch (mobileKeyboard) {
        case 'email':
          return 'email';
        case 'tel':
          return 'tel';
        case 'url':
          return 'url';
        default:
          return type;
      }
    };

    const sizeClasses = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-5 text-lg',
      responsive: 'h-10 px-4 text-base sm:h-11 sm:px-5 sm:text-lg md:h-12',
    };

    const variantClasses = {
      default: 'border border-input bg-background rounded-md',
      filled: 'border-0 bg-muted rounded-md',
      underlined: 'border-0 border-b-2 border-input bg-transparent rounded-none',
    };

    return (
      <div className="w-full space-y-2">
        {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transform text-muted-foreground">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={getInputType()}
            inputMode={getInputMode()}
            className={cn(
              'w-full transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
              'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
              'touch-manipulation', // Improves touch responsiveness
              sizeClasses[size],
              variantClasses[variant],
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground">
              {icon}
            </div>
          )}
        </div>

        {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

ResponsiveInput.displayName = 'ResponsiveInput';

// Responsive textarea with auto-resize
export interface ResponsiveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  variant?: 'default' | 'filled' | 'underlined';
  autoResize?: boolean;
  maxRows?: number;
}

export const ResponsiveTextarea = forwardRef<HTMLTextAreaElement, ResponsiveTextareaProps>(
  (
    {
      label,
      error,
      hint,
      size = 'responsive',
      variant = 'default',
      autoResize = false,
      maxRows = 10,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'min-h-[80px] p-3 text-sm',
      md: 'min-h-[96px] p-4 text-base',
      lg: 'min-h-[112px] p-5 text-lg',
      responsive: 'min-h-[96px] p-4 text-base sm:min-h-[112px] sm:p-5 sm:text-lg',
    };

    const variantClasses = {
      default: 'border border-input bg-background rounded-md',
      filled: 'border-0 bg-muted rounded-md',
      underlined: 'border-0 border-b-2 border-input bg-transparent rounded-none',
    };

    return (
      <div className="w-full space-y-2">
        {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

        <textarea
          ref={ref}
          className={cn(
            'w-full transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
            'touch-manipulation resize-none',
            sizeClasses[size],
            variantClasses[variant],
            autoResize && 'resize-y',
            error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
            className
          )}
          style={autoResize ? { maxHeight: `${maxRows * 1.5}rem` } : undefined}
          {...props}
        />

        {hint && !error && <p className="text-sm text-muted-foreground">{hint}</p>}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

ResponsiveTextarea.displayName = 'ResponsiveTextarea';

// Responsive form actions with adaptive layout
export interface ResponsiveFormActionsProps {
  children: ReactNode;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'adaptive';
  alignment?: 'left' | 'center' | 'right' | 'between';
  spacing?: 'sm' | 'md' | 'lg';
  sticky?: boolean;
}

export function ResponsiveFormActions({
  children,
  className,
  layout = 'adaptive',
  alignment = 'right',
  spacing = 'md',
  sticky = false,
}: ResponsiveFormActionsProps) {
  const layoutClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col',
    adaptive: 'flex flex-col sm:flex-row',
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  const spacingClasses = {
    sm: layout === 'horizontal' ? 'gap-2' : 'gap-2',
    md: layout === 'horizontal' ? 'gap-4' : 'gap-4',
    lg: layout === 'horizontal' ? 'gap-6' : 'gap-6',
  };

  return (
    <div
      className={cn(
        'w-full',
        layoutClasses[layout],
        alignmentClasses[alignment],
        spacingClasses[spacing],
        sticky && 'sticky bottom-0 -mx-4 -mb-4 border-t bg-background/95 p-4 backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}

// Example: Responsive contact form
export interface ResponsiveContactFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function ResponsiveContactForm({ onSubmit, isLoading = false }: ResponsiveContactFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <ResponsiveForm layout="single" spacing="comfortable" maxWidth="md" onSubmit={handleSubmit}>
      <ResponsiveField>
        <ResponsiveInput label="Name" placeholder="Your full name" required />
      </ResponsiveField>

      <ResponsiveField>
        <ResponsiveInput
          label="Email"
          type="email"
          mobileKeyboard="email"
          placeholder="your@email.com"
          required
        />
      </ResponsiveField>

      <ResponsiveField>
        <ResponsiveInput label="Subject" placeholder="How can we help?" required />
      </ResponsiveField>

      <ResponsiveField>
        <ResponsiveTextarea
          label="Message"
          placeholder="Tell us more about your inquiry..."
          autoResize
          maxRows={8}
          required
        />
      </ResponsiveField>

      <ResponsiveField>
        <ResponsiveFormActions layout="adaptive" alignment="right">
          <TouchButton
            size="lg"
            type="submit"
            disabled={isLoading}
            className="w-full min-w-[150px] sm:w-auto"
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </TouchButton>
        </ResponsiveFormActions>
      </ResponsiveField>
    </ResponsiveForm>
  );
}
