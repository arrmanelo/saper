import { useState, useEffect, useCallback } from 'react';
import { supabase, getProfile, signUp as supabaseSignUp, signIn as supabaseSignIn, signOut as supabaseSignOut } from '@/lib/supabase';
import type { UserProfile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    const profile = await getProfile(userId);
    setUser(profile);
    setLoading(false);
  };

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const data = await supabaseSignUp(email, password, username);
    if (data.user) {
      await loadProfile(data.user.id);
    }
    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await supabaseSignIn(email, password);
    if (data.user) {
      await loadProfile(data.user.id);
    }
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabaseSignOut();
    setUser(null);
    setSession(null);
  }, []);

  return { user, session, loading, signUp, signIn, signOut };
}
