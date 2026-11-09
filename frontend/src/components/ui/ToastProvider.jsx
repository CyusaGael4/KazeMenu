import { createContext, useCallback, useContext, useState } from 'react';
import { Check, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const addToast = useCallback((title, description = '', variant = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, title, description, variant }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item ${toast.variant === 'error' ? 'toast-error' : ''}`}>
            {toast.variant === 'error' ? <X size={18} /> : <Check size={18} />}
            <div className="min-w-0">
              <p className="font-semibold">{toast.title}</p>
              {toast.description && <p className="mt-1 text-sm opacity-80">{toast.description}</p>}
            </div>
            <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="ml-auto p-1">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
