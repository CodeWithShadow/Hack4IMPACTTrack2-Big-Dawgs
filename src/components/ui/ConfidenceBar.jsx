import React from 'react';
import { motion } from 'framer-motion';

export default function ConfidenceBar({ label, value, color = '#4ADE80', delay = 0 }) {
    const percentage = Math.round(value * 100);

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-sm text-fm-text-secondary font-dm truncate pr-4">{label}</span>
                <span className="text-sm font-mono font-semibold text-fm-text-primary tabular-nums">{percentage}%</span>
            </div>
            <div className="h-2 bg-fm-bg-base rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.2, delay, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
}
