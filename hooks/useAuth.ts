import { getSupabaseClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';


export function useAuth() {
  const supabase = getSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<ReturnType<typeof supabase.auth.getSession> extends Promise<infer _T> ? any : any>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  return { isLoading, session, user: session?.user ?? null } as const;
}


