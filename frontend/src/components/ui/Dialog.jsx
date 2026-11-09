import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function Dialog({ open, onClose, title, children, actions, labelledBy, className = '' }) {
  const dialogRef = useRef(null);
  const dragStartY = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    dialog?.querySelector('button, input, textarea, select, [tabindex="0"]')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      }
      if (event.key === 'Tab' && dialog) {
        const focusable = [...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('dialog-open');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('dialog-open');
      previousFocus?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || 'dialog-title'}
        className={`responsive-dialog ${className}`}
      >
        <div
          className="dialog-grabber"
          aria-hidden="true"
          onTouchStart={(event) => { dragStartY.current = event.touches[0].clientY; }}
          onTouchEnd={(event) => {
            if (dragStartY.current !== null && event.changedTouches[0].clientY - dragStartY.current > 100) onCloseRef.current();
            dragStartY.current = null;
          }}
        />
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-7">
          <h2 id={labelledBy || 'dialog-title'} className="text-xl font-bold text-black">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-md p-2 text-muted transition-colors hover:bg-soft hover:text-black">
            <X size={20} />
          </button>
        </header>
        <div className="dialog-content px-5 py-5 sm:px-7">{children}</div>
        {actions && <footer className="dialog-actions border-t border-border px-5 py-4 sm:px-7">{actions}</footer>}
      </section>
    </div>,
    document.body,
  );
}
