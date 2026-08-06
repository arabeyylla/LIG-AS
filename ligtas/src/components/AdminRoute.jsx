import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * Protects admin routes. Redirects to /admin/login if not authenticated.
 */
export default function AdminRoute({ children }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!supabase) {
      setStatus('unauthenticated');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'authenticated' : 'unauthenticated');
    });

    return () => subscription.unsubscribe();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Verifying access...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
