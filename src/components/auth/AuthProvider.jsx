import React, { useEffect, useState } from 'react';
import { supabase, ensureUserInDB } from '../../services/supabase';
import useStore from '../../store/useStore';
import LoadingSpinner from '../ui/LoadingSpinner';

export function AuthProvider({ children }) {
    const { setUser, setSession } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Failsafe timeout in case Supabase hangs while trying to refresh a token
        const failsafeId = setTimeout(() => {
            if (mounted && loading) {
                console.warn('FarmFlux: Auth initialization timed out. Forcing UI to load.');
                setLoading(false);
            }
        }, 3000);

        // Initialize session
        const initializeAuth = async () => {
            try {
                // Use Promise.race to ensure it doesn't hang the async function
                const getSessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
                
                const { data: { session } } = await Promise.race([getSessionPromise, timeoutPromise]);
                
                if (mounted) {
                    setSession(session);
                    if (session?.user) {
                        setUser(session.user);
                        ensureUserInDB(session.user).catch(console.error);
                    } else {
                        setUser(null);
                    }
                }
            } catch (err) {
                console.warn('Auth initialization skipped/failed:', err.message);
                // If token refresh hangs/fails due to corrupted storage, clear it to unstick the app completely
                if (err.message === 'timeout' || err.message.includes('refresh_token_not_found')) {
                    supabase.auth.signOut().catch(() => {});
                    if (mounted) setUser(null);
                }
            } finally {
                clearTimeout(failsafeId);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (mounted) {
                    setSession(session);
                    if (session?.user) {
                        setUser(session.user);
                        ensureUserInDB(session.user).catch(console.error);
                    } else {
                        setUser(null);
                    }
                    setLoading(false);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Block app rendering until we establish initial auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-fm-bg-base">
                <LoadingSpinner text="Authenticating..." size="lg" />
            </div>
        );
    }

    return children;
}
