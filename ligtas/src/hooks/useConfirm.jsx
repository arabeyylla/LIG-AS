import { useState, useCallback, useRef } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

/**
 * Promise-based replacement for window.confirm(), styled to match the admin
 * panel instead of the browser's native dialog. Usage:
 *
 *   const { confirm, confirmDialog } = useConfirm();
 *   ...
 *   async function handleDelete(id) {
 *     const ok = await confirm({
 *       title: 'Delete this record?',
 *       message: 'This cannot be undone.',
 *       confirmLabel: 'Delete',
 *     });
 *     if (!ok) return;
 *     // ...proceed
 *   }
 *   ...
 *   return <AdminLayout>...{confirmDialog}</AdminLayout>;
 *
 * `confirm` also accepts a plain string, e.g. confirm('Delete this?').
 */
export function useConfirm() {
  const [options, setOptions] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((opts) => {
    setOptions(typeof opts === 'string' ? { message: opts } : opts || {});
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const confirmDialog = (
    <ConfirmDialog
      open={options !== null}
      title={options?.title}
      message={options?.message}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      danger={options?.danger ?? true}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, confirmDialog };
}
