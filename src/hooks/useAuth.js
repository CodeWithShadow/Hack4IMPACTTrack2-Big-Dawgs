import { useEffect, useState } from 'react';
import { supabase, ensureUserInDB } from '../services/supabase';
import useStore from '../store/useStore';

export function useAuth() {
    const { user, session, setUser, setSession } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Failsafe: Force resolve UI if Supabase hangs invisibly
        const failsafeId = setTimeout(() => {
            setLoading(false);
        }, 3000);

        // Get initial session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            clearTimeout(failsafeId);
            setSession(s);
            if (s?.user) {
                setUser(s.user);
                ensureUserInDB(s.user).catch(console.error);
            }
            setLoading(false);
        }).catch((err) => {
            console.error('Session error:', err);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, s) => {
                setSession(s);
                if (s?.user) {
                    setUser(s.user);
                    await ensureUserInDB(s.user).catch(console.error);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            clearTimeout(failsafeId);
            subscription.unsubscribe();
        };
    }, []);

    return { user, session, loading };
}
