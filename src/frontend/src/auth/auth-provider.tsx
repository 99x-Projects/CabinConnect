import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabaseClient } from '../lib/supabase-client';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { readonly children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    supabaseClient.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        // Keep a newer session from onAuthStateChange if one already exists.
        setSession((current) => current ?? data.session);
        setLoading(false);
      }
    });

    const { data: subscription } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async () => {
        await supabaseClient.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
