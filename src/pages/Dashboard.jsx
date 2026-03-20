import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import WeatherWidget from '../components/dashboard/WeatherWidget';
import StatsRow from '../components/dashboard/StatsRow';
import RecentAnalyses from '../components/dashboard/RecentAnalyses';
import useStore from '../store/useStore';
import { getUserStats, getRecentAnalyses, getDiseaseAlerts } from '../services/supabase';
import { Bug, FlaskConical, ShoppingCart, AlertTriangle } from 'lucide-react';

const quickActions = [
    { label: 'Scan Crop', icon: Bug, path: '/disease', color: '#EF4444' },
    { label: 'Analyze Soil', icon: FlaskConical, path: '/soil', color: '#FCD34D' },
    { label: 'Check Market', icon: ShoppingCart, path: '/marketplace', color: '#4ADE80' },
    { label: 'Report Disease', icon: AlertTriangle, path: '/alerts', color: '#F59E0B' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, stats, setStats, recentAnalyses, setRecentAnalyses, diseaseAlerts, setDiseaseAlerts } = useStore();
    const [loading, setLoading] = useState(true);

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Farmer';

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const [s, r, a] = await Promise.all([
                    getUserStats(user.id),
                    getRecentAnalyses(user.id),
                    getDiseaseAlerts(),
                ]);
                setStats(s);
                setRecentAnalyses(r);
                setDiseaseAlerts(a);
            } catch (err) { console.error(err); }
            setLoading(false);
        })();
    }, [user]);

    const performanceScore = Math.min(
        Math.round(((stats.totalAnalyses * 5) + (stats.cropsMonitored * 10) + (stats.waterSaved / 100)) / 3),
        100
    ) || 42;

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (performanceScore / 100) * circumference;

    return (
        <PageWrapper>
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-8 max-w-6xl mx-auto"
            >
                {/* Hero Greeting */}
                <motion.div variants={staggerItem} className="space-y-1">
                    <p className="text-sm text-farm-text-muted font-mono uppercase tracking-widest">Dashboard</p>
                    <h1 className="font-syne font-extrabold text-4xl md:text-6xl text-farm-text leading-tight">
                        {greeting()},<br />
                        <span className="text-farm-accent">{firstName}</span>
                    </h1>
                </motion.div>

                {/* Weather */}
                <motion.div variants={staggerItem}>
                    <WeatherWidget />
                </motion.div>

                {/* Stats */}
                <motion.div variants={staggerItem}>
                    <StatsRow stats={stats} />
                </motion.div>

                {/* Quick Actions + Performance Ring */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <motion.div variants={staggerItem} className="lg:col-span-2">
                        <h2 className="font-syne font-bold text-xl text-farm-text mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {quickActions.map((action, i) => {
                                const Icon = action.icon;
                                return (
                                    <motion.button
                                        key={action.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.08 }}
                                        whileHover={{ y: -4, boxShadow: `0 0 30px ${action.color}22` }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate(action.path)}
                                        className="p-4 bg-farm-card border border-farm-border/50 rounded-lg flex flex-col items-center gap-3 group"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                                            style={{ backgroundColor: `${action.color}15` }}
                                        >
                                            <Icon className="w-6 h-6" style={{ color: action.color }} />
                                        </div>
                                        <span className="text-sm font-medium text-farm-text-secondary group-hover:text-farm-text transition-colors">
                                            {action.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Performance Ring */}
                    <motion.div
                        variants={staggerItem}
                        className="bg-farm-card border-l-4 border-farm-accent p-6 rounded-r-lg flex flex-col items-center justify-center"
                    >
                        <p className="text-xs text-farm-text-muted uppercase tracking-wider font-mono mb-4">Performance Score</p>
                        <div className="relative w-28 h-28">
                            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#1A3A25" strokeWidth="6" />
                                <motion.circle
                                    cx="50" cy="50" r="45"
                                    fill="none"
                                    stroke="#4ADE80"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: offset }}
                                    transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-mono text-3xl font-bold text-farm-text">{performanceScore}</span>
                                <span className="text-[10px] text-farm-text-muted">/ 100</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Disease Alert Banner */}
                {diseaseAlerts.length > 0 && (
                    <motion.div
                        variants={staggerItem}
                        whileHover={{ x: 4 }}
                        onClick={() => navigate('/alerts')}
                        className="bg-farm-warning/5 border-l-4 border-farm-warning p-4 rounded-r-lg flex items-center gap-4 cursor-pointer"
                    >
                        <AlertTriangle className="w-6 h-6 text-farm-warning flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-farm-text">
                                {diseaseAlerts.length} disease alert{diseaseAlerts.length > 1 ? 's' : ''} reported nearby
                            </p>
                            <p className="text-xs text-farm-text-muted">Click to view the disease alerts map</p>
                        </div>
                    </motion.div>
                )}

                {/* Recent Analyses */}
                <motion.div variants={staggerItem}>
                    <h2 className="font-syne font-bold text-xl text-farm-text mb-4">Recent Analyses</h2>
                    <RecentAnalyses analyses={recentAnalyses} />
                </motion.div>
            </motion.div>
        </PageWrapper>
    );
}
