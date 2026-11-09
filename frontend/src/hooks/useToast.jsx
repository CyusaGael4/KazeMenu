import { useCallback } from 'react';
import { useToast as useToastContext } from '../components/ui/ToastProvider';

export const useToast = () => {
  const { addToast: notify } = useToastContext();
  const addToast = useCallback((message, description, variant) => {
    if (typeof message === 'object') {
      notify(message.title, message.description, message.variant === 'destructive' ? 'error' : 'success');
      return;
    }
    notify(message, description, variant === 'destructive' || variant === 'error' ? 'error' : 'success');
  }, [notify]);

  return {
    addToast,
    toastSuccess: useCallback((title, description) => addToast(title, description), [addToast]),
    toastError: useCallback((title, description) => addToast(title, description, 'error'), [addToast]),
  };
};