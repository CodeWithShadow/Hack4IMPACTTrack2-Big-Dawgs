import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Bug, FlaskConical, TrendingUp, ShoppingCart,
    AlertTriangle, Droplets, Sprout, User, LogOut, Leaf
} from 'lucide-react';
import { signOut } from '../../services/supabase';
import useStore from '../../store/useStore';

const navGroups = [
    {
        title: "MAIN",
        items: [
            { path: '/', label: 'Dashboard', icon: LayoutDashboard }
        ]
    },
    {
        title: "ANALYSIS",
        items: [
            { path: '/disease', label: 'Disease Detection', icon: Bug },
            { path: '/soil', label: 'Soil Analysis', icon: FlaskConical },
            { path: '/yield', label: 'Yield Prediction', icon: TrendingUp }
        ]
    },
    {
        title: "MANAGEMENT",
        items: [
            { path: '/irrigation', label: 'Irrigation', icon: Droplets },
            { path: '/alerts', label: 'Disease Alerts', icon: AlertTriangle },
            { path: '/urban', label: 'Urban Farming', icon: Sprout }
        ]
    },
    {
        title: "COMMERCE",
        items: [
            { path: '/marketplace', label: 'Marketplace', icon: ShoppingCart }
        ]
    }
];

export default function Sidebar() {
    const location = useLocation();
    const { sidebarOpen, user } = useStore();

    const handleLogout = async () => {
        await signOut();
        window.location.href = '/login';
    };

    return (
        <>
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: sidebarOpen ? 0 : -280 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 h-full w-[260px] bg-fm-bg-base border-r border-fm-border z-40 flex flex-col font-sans"
            >
                {/* Logo */}
                <div className="px-6 pt-8 pb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-farm-accent/10 flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-fm-accent" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h1 className="font-semibold text-lg text-fm-text-primary tracking-tight">FarmFlux</h1>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 overflow-y-auto no-scrollbar pb-6">
                    {navGroups.map((group, groupIdx) => (
                        <div key={group.title} className={groupIdx > 0 ? "mt-6" : ""}>
                            <h3 className="text-[11px] font-semibold text-fm-text-muted uppercase tracking-wider mb-2 px-3">
                                {group.title}
                            </h3>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    const Icon = item.icon;
                                    
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className="block"
                                        >
                                            <div
                                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all relative ${
                                                    isActive
                                                        ? 'bg-farm-accent/10 text-fm-accent'
                                                        : 'text-fm-text-secondary hover:bg-black/5 hover:text-fm-text-primary'
                                                }`}
                                            >
                                                {/* Active Left Border Accent */}
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-fm-accent rounded-r-full" />
                                                )}
                                                
                                                <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </div>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User / Settings Footer Layout */}
                <div className="p-4 border-t border-fm-border bg-fm-bg-base">
                    {/* User Profile Block */}
                    <div className="flex items-center gap-3 px-2 mb-4">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="" className="w-9 h-9 rounded-full border border-white/10" />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-fm-bg-elevated border border-fm-border flex items-center justify-center">
                                <User className="w-4 h-4 text-fm-text-secondary" strokeWidth={1.5} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-fm-text-primary truncate">
                                {user?.user_metadata?.full_name || 'Farmer'}
                            </p>
                            <p className="text-[12px] text-fm-text-secondary truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                    </div>

                    {/* Secondary Actions tightly grouped below user */}
                    <div className="space-y-0.5">
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => `block w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                isActive ? 'bg-farm-accent/10 text-fm-accent' : 'text-fm-text-secondary hover:text-fm-text-primary hover:bg-black/5'
                            }`}
                        >
                            <User className="w-[16px] h-[16px]" strokeWidth={1.5} />
                            <span>Profile</span>
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-fm-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                            <LogOut className="w-[16px] h-[16px]" strokeWidth={1.5} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
