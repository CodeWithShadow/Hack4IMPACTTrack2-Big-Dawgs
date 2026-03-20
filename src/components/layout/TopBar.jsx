import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, Wifi, WifiOff } from 'lucide-react';
import useStore from '../../store/useStore';
import { useOffline } from '../../hooks/useOffline';

export default function TopBar() {
    const { toggleSidebar, user } = useStore();
    const { isOnline } = useOffline();

    return (
        <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 md:px-8 bg-farm-bg/80 backdrop-blur-xl border-b border-farm-border"
        >
            <div className="flex items-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleSidebar}
                    className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg hover:bg-farm-card transition-colors"
                >
                    <Menu className="w-5 h-5 text-farm-text-secondary" />
                </motion.button>
            </div>

            <div className="flex items-center gap-3">
                {/* Online/Offline Indicator */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono ${isOnline
                            ? 'bg-farm-accent/10 text-farm-accent'
                            : 'bg-farm-warning/10 text-farm-warning'
                        }`}
                >
                    {isOnline ? (
                        <Wifi className="w-3 h-3" />
                    ) : (
                        <WifiOff className="w-3 h-3" />
                    )}
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                </motion.div>

                {/* Notifications */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-farm-card transition-colors"
                >
                    <Bell className="w-5 h-5 text-farm-text-secondary" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-farm-accent animate-pulse" />
                </motion.button>

                {/* Avatar */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-farm-accent/30"
                >
                    {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-farm-accent/20 flex items-center justify-center text-farm-accent text-sm font-bold">
                            {user?.user_metadata?.full_name?.[0] || 'F'}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.header>
    );
}
