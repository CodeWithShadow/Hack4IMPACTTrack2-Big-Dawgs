import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Bug, FlaskConical, TrendingUp, ShoppingCart,
    AlertTriangle, Droplets, Sprout, User, LogOut, Leaf
} from 'lucide-react';
import { signOut } from '../../services/supabase';
import useStore from '../../store/useStore';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/disease', label: 'Disease Detection', icon: Bug },
    { path: '/soil', label: 'Soil Analysis', icon: FlaskConical },
    { path: '/yield', label: 'Yield Prediction', icon: TrendingUp },
    { path: '/irrigation', label: 'Irrigation', icon: Droplets },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { path: '/alerts', label: 'Disease Alerts', icon: AlertTriangle },
    { path: '/urban', label: 'Urban Farming', icon: Sprout },
    { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
    const location = useLocation();
    const { sidebarOpen, user } = useStore();

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/login';
    };

    return (
        <motion.aside
            initial={{ x: -280 }}
            animate={{ x: sidebarOpen ? 0 : -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-[260px] bg-farm-bg-secondary border-r border-farm-border z-50 flex flex-col overflow-hidden"
        >
            {/* Logo */}
            <div className="px-6 py-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-farm-accent/10 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-farm-accent" />
                </div>
                <div>
                    <h1 className="font-syne font-bold text-xl text-farm-text tracking-tight">FarmFlux</h1>
                    <p className="text-[10px] text-farm-text-muted tracking-widest uppercase">Smart Agriculture</p>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className="relative block"
                        >
                            <motion.div
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${isActive
                                        ? 'text-farm-bg bg-farm-accent'
                                        : 'text-farm-text-secondary hover:bg-farm-card hover:text-farm-text'
                                    }`}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                                <span className="text-sm font-medium font-dm">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-0 bottom-0 w-[3px] bg-farm-bg rounded-r"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User / Logout */}
            <div className="px-4 py-4 border-t border-farm-border">
                <div className="flex items-center gap-3 mb-3">
                    {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-farm-accent/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-farm-accent" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-farm-text truncate">
                            {user?.user_metadata?.full_name || 'Farmer'}
                        </p>
                        <p className="text-[11px] text-farm-text-muted truncate">{user?.email || ''}</p>
                    </div>
                </div>
                <motion.button
                    onClick={handleLogout}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-farm-danger/80 hover:text-farm-danger w-full rounded-lg hover:bg-farm-danger/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </motion.button>
            </div>
        </motion.aside>
    );
}
