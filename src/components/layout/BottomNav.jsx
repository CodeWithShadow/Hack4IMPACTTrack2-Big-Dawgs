import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Bug, ShoppingCart, AlertTriangle,
    Menu, X, FlaskConical, TrendingUp, Droplets, Sprout, User, LogOut
} from 'lucide-react';
import { signOut } from '../../services/supabase';

const primaryNavItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/disease', label: 'Scan', icon: Bug },
    { path: '/marketplace', label: 'Market', icon: ShoppingCart },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
];

const moreMenuGroups = [
    {
        title: 'ANALYSIS',
        items: [
            { path: '/soil', label: 'Soil Analysis', icon: FlaskConical },
            { path: '/yield', label: 'Yield Prediction', icon: TrendingUp },
        ],
    },
    {
        title: 'MANAGEMENT',
        items: [
            { path: '/irrigation', label: 'Irrigation', icon: Droplets },
            { path: '/urban', label: 'Urban Farming', icon: Sprout },
        ],
    },
    {
        title: 'ACCOUNT',
        items: [
            { path: '/profile', label: 'Profile', icon: User },
        ],
    },
];

// All paths that live inside the "More" drawer
const moreMenuPaths = moreMenuGroups.flatMap(g => g.items.map(i => i.path));

export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isMoreActive = moreMenuPaths.includes(location.pathname);

    const handleLogout = async () => {
        setDrawerOpen(false);
        await signOut();
        window.location.href = '/login';
    };

    const handleDrawerNav = (path) => {
        setDrawerOpen(false);
        navigate(path);
    };

    return (
        <>
            {/* Slide-up Drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                            onClick={() => setDrawerOpen(false)}
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            key="drawer"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                            className="fixed bottom-[56px] left-0 right-0 z-50 md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 rounded-t-2xl overflow-hidden"
                        >
                            {/* Drawer Handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-white/20" />
                            </div>

                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-5 pb-3">
                                <h3 className="text-sm font-semibold text-fm-text-primary tracking-wide">More Options</h3>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-4 h-4 text-white/70" />
                                </button>
                            </div>

                            {/* Grouped Menu Items */}
                            <nav className="px-4 pb-4 max-h-[50vh] overflow-y-auto">
                                {moreMenuGroups.map((group, idx) => (
                                    <div key={group.title} className={idx > 0 ? 'mt-4' : ''}>
                                        <h4 className="text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1.5 px-3">
                                            {group.title}
                                        </h4>
                                        <div className="space-y-0.5">
                                            {group.items.map((item) => {
                                                const isActive = location.pathname === item.path;
                                                const Icon = item.icon;
                                                return (
                                                    <button
                                                        key={item.path}
                                                        onClick={() => handleDrawerNav(item.path)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                                            isActive
                                                                ? 'bg-white/20 text-white font-bold'
                                                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                    >
                                                        <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                                                        <span className="text-sm font-medium">{item.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {/* Sign Out */}
                                <div className="mt-4 pt-3 border-t border-white/10">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-white/80 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-fm-bg-surface/95 backdrop-blur-lg border-t border-fm-border"
            >
                <div className="flex items-center justify-around px-2 py-1">
                    {primaryNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setDrawerOpen(false)}
                                className="relative flex flex-col items-center py-2 px-3"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.85 }}
                                    className="relative"
                                >
                                    <Icon
                                        className={`w-5 h-5 transition-colors ${isActive ? (drawerOpen ? 'text-white' : 'text-fm-accent') : (drawerOpen ? 'text-white/70' : 'text-fm-text-secondary')
                                            }`}
                                    />
                                    {isActive && (
                                        <motion.div
                                            layoutId="bottomnav-active"
                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-fm-accent"
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </motion.div>
                                <span
                                    className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? (drawerOpen ? 'text-white' : 'text-fm-accent') : (drawerOpen ? 'text-white/70' : 'text-fm-text-secondary')
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}

                    {/* More Button */}
                    <button
                        onClick={() => setDrawerOpen(prev => !prev)}
                        className="relative flex flex-col items-center py-2 px-3"
                    >
                        <motion.div
                            whileTap={{ scale: 0.85 }}
                            className="relative"
                        >
                            <Menu
                                className={`w-5 h-5 transition-colors ${
                                    drawerOpen ? 'text-white' : (isMoreActive ? 'text-fm-accent' : 'text-fm-text-secondary')
                                }`}
                            />
                            {isMoreActive && !drawerOpen && (
                                <motion.div
                                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-fm-accent"
                                />
                            )}
                        </motion.div>
                        <span
                            className={`text-[10px] mt-1 font-medium transition-colors ${
                                drawerOpen ? 'text-white' : (isMoreActive ? 'text-fm-accent' : 'text-fm-text-secondary')
                            }`}
                        >
                            More
                        </span>
                    </button>
                </div>
            </motion.nav>
        </>
    );
}
