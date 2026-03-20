import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import RecentAnalyses from '../components/dashboard/RecentAnalyses';
import useStore from '../store/useStore';
import { getUserStats, getRecentAnalyses } from '../services/supabase';
import { signOut } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Activity, Bug, Droplets, Coins, LogOut, Globe } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const { user, stats, setStats, recentAnalyses, setRecentAnalyses } = useStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const [s, r] = await Promise.all([getUserStats(user.id), getRecentAnalyses(user.id, 10)]);
                setStats(s);
                setRecentAnalyses(r);
            } catch (err) { console.error(err); }
            setLoading(false);
        })();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login', { replace: true });
    };

    const performanceScore = Math.min(
        Math.round(((stats.totalAnalyses * 5) + (stats.cropsMonitored * 10) + (stats.waterSaved / 100)) / 3),
        100
    ) || 42;

    const circumference = 2 * Math.PI * 45;

    const statCards = [
        { label: 'Total Analyses', value: stats.totalAnalyses, icon: Activity, color: '#4ADE80' },
        { label: 'Diseases Caught', value: stats.diseasesDetected, icon: Bug, color: '#EF4444' },
        { label: 'Water Saved (L)', value: stats.waterSaved, icon: Droplets, color: '#60A5FA' },
        { label: 'Money Saved (₹)', value: stats.totalAnalyses * 250, icon: Coins, color: '#FCD34D' },
    ];

    return (
        <PageWrapper>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <motion.div variants={staggerItem} className="flex flex-col md:flex-row items-center gap-6">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-farm-accent/30"
                    >
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-farm-accent/20 flex items-center justify-center text-farm-accent text-3xl font-bold">
                                {user?.user_metadata?.full_name?.[0] || 'F'}
                            </div>
                        )}
                    </motion.div>
                    <div className="text-center md:text-left">
                        <h1 className="font-syne font-extrabold text-3xl md:text-4xl text-farm-text">
                            {user?.user_metadata?.full_name || 'Farmer'}
                        </h1>
                        <p className="text-farm-text-muted font-dm">{user?.email}</p>
                    </div>
                </motion.div>

                {/* Stats Rings */}
                <motion.div variants={staggerItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, i) => {
                        const Icon = stat.icon;
                        const ringOffset = circumference - (Math.min(stat.value, 100) / 100) * circumference;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-farm-card border-l-4 p-5 rounded-r-lg flex flex-col items-center"
                                style={{ borderLeftColor: stat.color }}
                            >
                                <div className="relative w-20 h-20 mb-3">
                                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1A3A25" strokeWidth="5" />
                                        <motion.circle cx="50" cy="50" r="45" fill="none" stroke={stat.color} strokeWidth="5" strokeLinecap="round"
                                            strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: ringOffset }}
                                            transition={{ duration: 1.5, delay: 0.3 + i * 0.15 }} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Icon className="w-5 h-5" style={{ color: stat.color }} />
                                    </div>
                                </div>
                                <AnimatedNumber value={stat.value} className="text-2xl text-farm-text" duration={1500} />
                                <p className="text-[10px] text-farm-text-muted uppercase tracking-wider font-mono mt-1 text-center">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Performance Score */}
                <motion.div variants={staggerItem} className="bg-farm-card border-l-4 border-farm-accent p-6 rounded-r-lg">
                    <h3 className="font-syne font-bold text-lg text-farm-text mb-4">Farmer Performance Score</h3>
                    <div className="flex items-center gap-6">
                        <div className="relative w-28 h-28">
                            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#1A3A25" strokeWidth="6" />
                                <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#4ADE80" strokeWidth="6" strokeLinecap="round"
                                    strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: circumference - (performanceScore / 100) * circumference }}
                                    transition={{ duration: 2, delay: 0.5 }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-mono text-3xl font-bold text-farm-text">{performanceScore}</span>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-farm-text-secondary font-dm">
                            <p>Based on your analysis frequency, crop monitoring, and water conservation efforts.</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`w-3 h-3 rounded-full ${performanceScore > 70 ? 'bg-farm-accent' : performanceScore > 40 ? 'bg-farm-warning' : 'bg-farm-danger'}`} />
                                <span className="font-mono text-xs">
                                    {performanceScore > 70 ? 'Excellent' : performanceScore > 40 ? 'Good' : 'Needs Improvement'} — Microcredit {performanceScore > 60 ? 'Ready' : 'Not Ready'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Analysis History */}
                <motion.div variants={staggerItem}>
                    <h2 className="font-syne font-bold text-xl text-farm-text mb-4">Analysis History</h2>
                    <RecentAnalyses analyses={recentAnalyses} />
                </motion.div>

                {/* Language Preference */}
                <motion.div variants={staggerItem} className="bg-farm-card border-l-4 border-farm-border p-4 rounded-r-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-farm-text-muted" />
                        <span className="text-sm text-farm-text font-dm">Language Preference</span>
                    </div>
                    <select className="px-3 py-1.5 bg-farm-bg border border-farm-border rounded text-sm text-farm-text">
                        <option>English</option><option>हिंदी</option><option>मराठी</option><option>తెలుగు</option><option>தமிழ்</option>
                    </select>
                </motion.div>

                {/* Logout */}
                <motion.div variants={staggerItem}>
                    <motion.button whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} onClick={handleLogout}
                        className="flex items-center gap-3 px-6 py-3 text-farm-danger hover:bg-farm-danger/10 rounded-lg transition-colors w-full">
                        <LogOut className="w-5 h-5" />
                        <span className="font-dm font-medium">Sign Out</span>
                    </motion.button>
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}
