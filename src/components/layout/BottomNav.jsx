import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Bug, ShoppingCart, AlertTriangle, User } from 'lucide-react';

const navItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    { path: '/disease', label: 'Scan', icon: Bug },
    { path: '/marketplace', label: 'Market', icon: ShoppingCart },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { path: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
    const location = useLocation();

    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-farm-bg-secondary/95 backdrop-blur-lg border-t border-farm-border"
        >
            <div className="flex items-center justify-around px-2 py-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className="relative flex flex-col items-center py-2 px-3"
                        >
                            <motion.div
                                whileTap={{ scale: 0.85 }}
                                className="relative"
                            >
                                <Icon
                                    className={`w-5 h-5 transition-colors ${isActive ? 'text-farm-accent' : 'text-farm-text-muted'
                                        }`}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomnav-active"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-farm-accent"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </motion.div>
                            <span
                                className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? 'text-farm-accent' : 'text-farm-text-muted'
                                    }`}
                            >
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
        </motion.nav>
    );
}
