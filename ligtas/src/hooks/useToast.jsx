import { useState, useCallback } from 'react';
import Toast from '../components/Toast';

/**
 * Replacement for window.alert() — shows the same styled Toast used on the
 * public Assessment page instead of a browser popup. Usage:
 *
 *   const { showToast, toastElement } = useToast();
 *   ...
 *   showToast('Failed to delete: ' + err.message, 'error');
 *   ...
 *   return <AdminLayout>...{toastElement}</AdminLayout>;
 */
export function useToast() {
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const toastElement = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  ) : null;

  return { showToast, toastElement };
}
