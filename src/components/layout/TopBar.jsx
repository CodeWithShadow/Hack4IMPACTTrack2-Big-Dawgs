import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Wifi, WifiOff, CheckCircle, AlertTriangle, CloudLightning, ShoppingBag, X, Shield, Sun, Moon } from 'lucide-react';
import useStore from '../../store/useStore';
import { useOffline } from '../../hooks/useOffline';
import AlertRadiusSettings from '../alerts/AlertRadiusSettings';

export default function TopBar() {
    const { toggleSidebar, user, notifications, markNotificationsRead, isDarkMode, toggleDarkMode } = useStore();
    const { isOnline } = useOffline();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showRadiusSettings, setShowRadiusSettings] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifs(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleBellClick = () => {
        setShowNotifs(!showNotifs);
        if (!showNotifs && unreadCount > 0) {
            markNotificationsRead();
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-[#4ADE80]" />;
            case 'warning': return <AlertTriangle className="w-5 h-5 text-[#EF4444]" />;
            case 'weather': return <CloudLightning className="w-5 h-5 text-[#60A5FA]" />;
            case 'buy': return <ShoppingBag className="w-5 h-5 text-[#FCD34D]" />;
            case 'sell': return <ShoppingBag className="w-5 h-5 text-[#4ADE80]" />;
            default: return <Bell className="w-5 h-5 text-fm-text-secondary" />;
        }
    };

    return (
        <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-8 ${isDarkMode ? 'bg-[#201E19]/80' : 'bg-white/80'} backdrop-blur-xl border-b border-fm-border`}
        >
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSidebar}
                    className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-fm-bg-elevated transition-colors"
                >
                    <Menu className="w-5 h-5 text-fm-text-secondary" />
                </motion.button>
            </div>

            <div className="flex items-center gap-3">
                {/* Online/Offline Indicator */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono ${isOnline
                            ? 'bg-fm-accent/10 text-fm-accent'
                            : 'bg-fm-stat-crops/10 text-fm-stat-crops'
                        }`}
                >
                    {isOnline ? (
                        <Wifi className="w-3 h-3" />
                    ) : (
                        <WifiOff className="w-3 h-3" />
                    )}
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                </motion.div>

                {/* Theme Toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleDarkMode}
                    className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-fm-bg-elevated transition-colors"
                >
                    {isDarkMode ? (
                        <Moon className="w-5 h-5 text-fm-text-secondary" />
                    ) : (
                        <Sun className="w-5 h-5 text-fm-text-secondary" />
                    )}
                </motion.button>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBellClick}
                        className={`relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-fm-bg-elevated transition-colors ${showNotifs ? 'bg-fm-bg-elevated' : ''}`}
                    >
                        <Bell className="w-5 h-5 text-fm-text-secondary" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-fm-accent border-2 border-fm-bg-base flex items-center justify-center">
                                {/* Optional: tiny dot */}
                            </span>
                        )}
                    </motion.button>

                    {/* Dropdown Panel */}
                    <AnimatePresence>
                        {showNotifs && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute right-0 mt-2 w-80 ${isDarkMode ? 'bg-[#1A1814]/40' : 'bg-white/40'} backdrop-blur-3xl border border-fm-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col`}
                            >
                                <div className={`px-4 py-3 border-b border-fm-border flex items-center justify-between ${isDarkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                                    <h3 className="font-syne font-bold text-fm-text-primary">Notifications</h3>
                                    {unreadCount > 0 && <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${isDarkMode ? 'bg-[#C27A3A]/20 text-fm-accent' : 'bg-[#22623A]/10 text-fm-accent'}`}>{unreadCount} new</span>}
                                </div>
                                <div className="max-h-[70vh] overflow-y-auto no-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-fm-text-muted text-sm font-dm">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className={`p-4 border-b border-fm-border/50 transition-colors flex gap-3 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'} ${!notif.read ? (isDarkMode ? 'bg-[#C27A3A]/10' : 'bg-[#22623A]/5') : ''}`}>
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getIcon(notif.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-fm-text-primary mb-0.5">{notif.title}</p>
                                                    <p className="text-xs text-fm-text-secondary font-dm line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-fm-text-muted font-mono mt-1.5">
                                                        {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Alert Radius Settings Link */}
                                <button
                                    onClick={() => { setShowNotifs(false); setShowRadiusSettings(true); }}
                                    className={`w-full flex items-center gap-2.5 px-4 py-3 border-t border-fm-border text-sm text-fm-text-secondary ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'} hover:text-fm-accent transition-colors font-dm`}
                                >
                                    <Shield className="w-4 h-4" />
                                    Alert Radius Settings
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Alert Radius Settings Modal */}
                <AlertRadiusSettings open={showRadiusSettings} onClose={() => setShowRadiusSettings(false)} />

                {/* Avatar */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-fm-accent/30"
                >
                    {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-fm-accent/20 flex items-center justify-center text-fm-accent text-sm font-bold">
                            {user?.user_metadata?.full_name?.[0] || 'F'}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.header>
    );
}
