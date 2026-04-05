import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

/**
 * Protects role-specific routes. Redirects to /login if not authenticated,
 * or to the user's correct dashboard if they try to access another role's area.
 *
 * @param {string} [allowedRole] - Single role that may access (e.g. "Educator")
 * @param {string[]} [allowedRoles] - Multiple roles that may access (e.g. ["Learner", "Educator"])
 * @param {React.ReactNode} children - Content to render when allowed
 */
export default function ProtectedRoute({ allowedRole, allowedRoles = [], children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // 'loading' | 'allowed' | 'redirect'

  const rolesAllowed = allowedRoles.length ? allowedRoles : (allowedRole ? [allowedRole] : []);
  const rolesKey = JSON.stringify(rolesAllowed);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!user) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!mounted) return;

      const userRole = profile?.role || user.user_metadata?.role || 'Learner';
      const allowed = rolesAllowed.length === 0 || rolesAllowed.includes(userRole);

      if (!allowed) {
        const home = userRole === 'Admin' ? '/admin' : userRole === 'Educator' ? '/educator' : '/learner';
        navigate(home, { replace: true });
        return;
      }

      setStatus('allowed');
    }

    check();
    return () => { mounted = false; };
  }, [navigate, location.pathname, allowedRole, allowedRoles, rolesAllowed, rolesKey]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <p className="font-bold text-slate-500 uppercase tracking-widest text-sm">Checking access...</p>
      </div>
    );
  }

  return status === 'allowed' ? children : null;
}
