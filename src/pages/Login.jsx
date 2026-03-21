import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { signInWithGoogle } from '../services/supabase';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Leaf, Droplets, Bug, Sprout, BarChart3, ShoppingCart, ShieldAlert, Cpu, Zap, ArrowRight } from 'lucide-react';

/* Distinct Light Theme Colors for Landing Page */
const THEME = {
    bg: "from-[#EFF5F0] via-[#E2EEE4] to-[#CDE3CF]", // bg-base to bg-elevated gradient
    accent: "text-[#22623A]",
    accentBg: "bg-[#22623A]",
    card: "bg-white/70",
    border: "border-[#A8C8AB]/40"
};

const stats = [
    { value: "30%", label: "Global crop loss to unchecked diseases & pests.", icon: Bug, color: "text-[#B85C44]" },
    { value: "70%", label: "Of world's freshwater used in agriculture.", icon: Droplets, color: "text-[#3A7DA8]" },
    { value: "40%", label: "Of farmers lack access to fair market pricing.", icon: BarChart3, color: "text-[#C49A2A]" },
];

const features = [
    {
        title: "AI Disease Detection",
        description: "Snap a photo of distressed leaves. Our edge AI models instantly identify diseases entirely offline.",
        icon: ShieldAlert,
        color: "text-[#B85C44]"
    },
    {
        title: "Hyperlocal Irrigation",
        description: "Save water autonomously. Precision engineering calculates exact watering needs based on deep climate data.",
        icon: Droplets,
        color: "text-[#3A7DA8]"
    },
    {
        title: "Deep Soil Analysis",
        description: "Bypass the lab. Upload visual terrain data for instant pH and nutrient optimization mapping.",
        icon: Sprout,
        color: "text-[#22623A]"
    },
    {
        title: "AI-Powered Marketplace",
        description: "Sell surplus directly. Algorithms suggest perfect market rates dynamically based on macro trends.",
        icon: ShoppingCart,
        color: "text-[#8A52C3]"
    }
];

export default function Login() {
    const { user } = useStore();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ container: containerRef });
    
    // Parallax hero text
    const textY = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

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
        <div ref={containerRef} className={`h-screen overflow-y-auto overflow-x-hidden bg-gradient-to-b ${THEME.bg} text-[#1A3020] font-dm selection:bg-[#22623A]/20 selection:text-[#0F3D1E]`}>

            {/* Top Navigation */}
            <motion.nav 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 px-6 py-5 flex items-center justify-between bg-white/40 backdrop-blur-2xl border-b border-[#A8C8AB]/30"
            >
                <div className="flex items-center gap-2 group cursor-pointer">
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.6 }}>
                        <Leaf className={`w-6 h-6 ${THEME.accent}`} />
                    </motion.div>
                    <span className="font-syne font-bold text-xl tracking-wide text-[#1A3020]">FarmFlux</span>
                </div>
                <button 
                    onClick={handleLogin}
                    className={`px-6 py-2.5 rounded-full ${THEME.accentBg} text-[#EFF5F0] text-sm font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(34,98,58,0.25)] hover:shadow-[0_6px_30px_rgba(34,98,58,0.4)]`}
                >
                    Sign In
                </button>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 px-6 overflow-hidden z-10">
                <motion.div 
                    style={{ y: textY, opacity: textOpacity }}
                    className="flex flex-col items-center text-center max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${THEME.card} border ${THEME.border} mb-8 backdrop-blur-md shadow-sm`}
                    >
                        <Zap className={`w-4 h-4 ${THEME.accent}`} />
                        <span className="text-sm font-mono text-[#5A7A62]">The future of intelligent agriculture is here.</span>
                    </motion.div>

                    {/* Massive Staggered Title */}
                    <div className="flex items-center justify-center gap-[2px] mb-6 flex-wrap">
                        {titleLetters.map((letter, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 50, rotateX: 90 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ delay: 0.2 + (i * 0.05), type: "spring", stiffness: 120, damping: 15 }}
                                className="font-syne font-black text-5xl md:text-7xl leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#0F3D1E] via-[#22623A] to-[#5A7A62] tracking-tighter"
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="text-lg md:text-xl font-light text-[#5A7A62] max-w-2xl mb-12 leading-relaxed"
                    >
                        Intelligence rooted in the soil. Next-generation edge AI tools to maximize crop yield, eliminate resource waste, and securely connect you to global markets.
                    </motion.p>

                    {/* Glassmorphic Beautiful Login Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.3, type: "spring", stiffness: 200, damping: 20 }}
                        className={`p-1.5 rounded-3xl bg-gradient-to-b from-white/60 to-transparent shadow-[0_20px_60px_-15px_rgba(34,98,58,0.15)]`}
                    >
                        <div className={`backdrop-blur-2xl rounded-[20px] p-8 md:p-10 ${THEME.card} border border-white/40 flex flex-col items-center relative overflow-hidden group`}>
                            <h3 className="text-xl font-syne font-bold text-[#1A3020] mb-6">Start your digital farm.</h3>
                            <button
                                onClick={handleLogin}
                                className="w-full sm:w-80 flex items-center justify-center gap-4 px-8 py-5 bg-white text-black border border-[#C8DEC9] font-syne font-bold text-lg rounded-xl hover:bg-[#F9FAFB] hover:border-[#A8C8AB] transition-all shadow-md active:scale-[0.98]"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
                
                {/* Scroll Indicator */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[#5A7A62]"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] font-mono">Scroll</span>
                    <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} className="w-[1px] h-12 bg-gradient-to-b from-[#5A7A62] to-transparent" />
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="py-24 px-6 relative z-10 border-t border-[#A8C8AB]/20 bg-white/30 backdrop-blur-2xl">
                <div className="max-w-6xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                        className="text-center mb-16"
                    >
                        <h2 className="font-syne font-bold text-3xl md:text-5xl mb-4 text-[#1A3020] tracking-tight">The world has changed. <br/><span className="text-[#5A7A62]">Farming must evolve.</span></h2>
                        <p className="text-lg text-[#5A7A62] max-w-2xl mx-auto font-light leading-relaxed">
                            Climate volatility and archaic supply chains are crushing yields. Intuition is no longer sufficient; survival demands extreme data precision.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {stats.map((stat, i) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 20 }}
                                    className={`p-8 rounded-2xl ${THEME.card} border ${THEME.border} text-center flex flex-col items-center relative overflow-hidden group shadow-lg`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <motion.div 
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className={`w-16 h-16 rounded-xl bg-white border border-[#C8DEC9] flex items-center justify-center mb-6 shadow-sm`}
                                    >
                                        <Icon className={`w-8 h-8 ${stat.color} drop-shadow-sm`} />
                                    </motion.div>
                                    <h3 className="text-4xl md:text-5xl font-syne font-bold mb-4 text-[#1A3020] tracking-tighter">{stat.value}</h3>
                                    <p className="text-[#5A7A62] font-dm text-sm leading-relaxed tracking-wide">{stat.label}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Feature Grid Section */}
            <section className="py-24 px-6 relative z-10 bg-gradient-to-b from-transparent to-[#E2EEE4]/80">
                <div className="max-w-6xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, type: "spring" }}
                        className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <span className={`${THEME.accent} font-mono uppercase tracking-[0.2em] text-sm mb-4 block flex items-center gap-2`}><Cpu className="w-4 h-4"/> Deep Technology Edge</span>
                            <h2 className="font-syne font-bold text-4xl md:text-5xl text-[#1A3020] tracking-tighter">
                                Farm intelligently.
                            </h2>
                        </div>
                        <p className="text-[#5A7A62] max-w-md font-light text-base">
                            We bring silicon-valley grade artificial intelligence directly to the field. Completely offline. Brutally fast.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            // Alternating heights
                            const heightClass = i % 3 === 0 ? "md:h-[450px]" : "md:h-[380px]";
                            return (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 100 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ delay: (i % 2) * 0.2, duration: 0.8, ease: "easeOut" }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className={`group p-10 sm:p-12 rounded-[2rem] ${THEME.card} border ${THEME.border} hover:border-[#A8C8AB] transition-all duration-500 overflow-hidden relative flex flex-col justify-end ${heightClass} shadow-lg`}
                                >
                                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-duration-700 pointer-events-none" />
                                    
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-auto bg-white border border-[#C8DEC9] relative z-10 shadow-md group-hover:scale-110 transition-transform duration-500`}>
                                        <Icon className={`w-8 h-8 ${feature.color}`} />
                                    </div>
                                    
                                    <div className="relative z-10 mt-12">
                                        <h3 className="text-3xl font-syne font-black text-[#1A3020] mb-4 tracking-tight">{feature.title}</h3>
                                        <p className="text-[#5A7A62] leading-relaxed font-light text-lg">
                                            {feature.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 px-6 relative z-10 overflow-hidden bg-[#0F3D1E] flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNGRkZGRkYiLz48L3N2Zz4=')]" />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                    className="max-w-3xl mx-auto text-center relative z-10 p-8 md:p-16 rounded-[2rem] border border-white/20 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-3xl"
                >
                    <h2 className="font-syne font-bold text-4xl md:text-6xl text-white mb-8 tracking-tighter">Enter the flux.</h2>
                    <button
                        onClick={handleLogin}
                        className={`inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0F3D1E] font-syne font-bold text-lg rounded-xl hover:bg-[#EFF5F0] transition-all hover:scale-105 active:scale-95 shadow-xl`}
                    >
                        Sign In with Google <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs font-mono tracking-widest text-[#B8D9BC] mt-8 uppercase">Security backed by Supabase.</p>
                </motion.div>
            </section>
            
        </div>
    );
}

