import { Check } from 'lucide-react';

export default function Button({
  children,
  loading = false,
  loadingLabel = 'Working...',
  success = false,
  successLabel = 'Done',
  variant = 'primary',
  className = '',
  as: Component = 'button',
  ...props
}) {
  const styles = variant === 'secondary' ? 'button-secondary' : 'button-primary';
  const nativeButtonProps = Component === 'button'
    ? { disabled: props.disabled || loading }
    : {};

  return (
    <Component
      {...props}
      {...nativeButtonProps}
      className={`button-control inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition-colors duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${styles} ${className}`}
      aria-busy={loading || undefined}
      aria-live={loading || success ? 'polite' : undefined}
    >
      <span className="button-icon-slot" aria-hidden="true">
        {loading ? <span className="button-spinner" /> : success ? <Check size={16} /> : null}
      </span>
      <span className="button-text-slot">
        <span className={`button-text-current ${loading || success ? 'button-text-reserved' : ''}`}>{children}</span>
        <span className={loading ? 'button-text-current' : 'button-text-reserved'}>{loadingLabel}</span>
        <span className={success ? 'button-text-current' : 'button-text-reserved'}>{successLabel}</span>
      </span>
      <span className="button-icon-slot" aria-hidden="true" />
    </Component>
  );
}
