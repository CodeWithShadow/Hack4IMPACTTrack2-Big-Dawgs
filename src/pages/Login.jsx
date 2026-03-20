import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

/* Floating particles */
function Particles() {
    const particles = useMemo(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 2,
            duration: Math.random() * 10 + 10,
            delay: Math.random() * 5,
        })), []
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [0, -30, 10, -20, 0],
                        x: [0, 15, -10, 5, 0],
                        opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: 'easeInOut',
                    }}
                />
            ))}
        </div>
    );
}

export default function Login() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) navigate('/', { replace: true });
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    const titleLetters = 'FarmFlux'.split('');

    return (
        <div className="min-h-screen gradient-mesh flex items-center justify-center relative overflow-hidden">
            <Particles />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10 flex flex-col items-center px-6 max-w-md w-full"
            >
                {/* Logo Icon */}
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                    className="w-20 h-20 rounded-2xl bg-farm-accent/10 border border-farm-accent/20 flex items-center justify-center mb-8"
                >
                    <Leaf className="w-10 h-10 text-farm-accent" />
                </motion.div>

                {/* Title — staggered letter animation */}
                <div className="flex items-center gap-0.5 mb-3">
                    {titleLetters.map((letter, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300 }}
                            className="font-syne font-extrabold text-5xl md:text-7xl text-farm-text"
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="text-farm-text-muted text-lg font-dm mb-12 tracking-wide"
                >
                    Intelligence rooted in the soil
                </motion.p>

                {/* Google Sign In Button */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(74, 222, 128, 0.2)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    className="w-full max-w-sm flex items-center justify-center gap-3 px-8 py-4 bg-farm-accent text-farm-bg font-syne font-bold text-lg rounded-lg relative overflow-hidden group"
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-farm-accent-secondary to-farm-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="relative z-10">Continue with Google</span>
                </motion.button>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="text-xs text-farm-text-muted/50 mt-8 font-dm text-center"
                >
                    AI-powered crop disease detection • Soil analysis • Smart irrigation
                </motion.p>
            </motion.div>
        </div>
    );
}
