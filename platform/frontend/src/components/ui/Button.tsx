import { forwardRef, type ButtonHTMLAttributes } from 'react';

// Button — shadcn-style primitive sample. Delivered by U-D02.
// Real shadcn components are added via `pnpm dlx shadcn add <name>`; this
// hand-written version proves the design tokens flow through Tailwind.

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  primary: 'bg-primary text-primary-fg hover:opacity-90',
  secondary: 'bg-surface-raised text-text border border-border hover:bg-border',
  ghost: 'bg-transparent text-text hover:bg-border',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium ' +
      'text-sm transition-opacity focus-visible:outline-none ' +
      'disabled:opacity-50 disabled:cursor-not-allowed';
    return (
      <button ref={ref} className={`${base} ${variantClass[variant]} ${className}`} {...props} />
    );
  },
);

Button.displayName = 'Button';
