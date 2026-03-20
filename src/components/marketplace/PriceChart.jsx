import React from 'react';
import { motion } from 'framer-motion';

export default function PriceChart({ data, label = 'Price Trend' }) {
    if (!data || data.length === 0) return null;

    const values = data.map(d => d.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const range = maxVal - minVal || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - minVal) / range) * 80 - 10;
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `0,100 ${points} 100,100`;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-farm-card border-l-4 border-farm-accent p-4 rounded-r-lg"
        >
            <p className="text-xs text-farm-text-muted uppercase tracking-wider font-mono mb-3">{label}</p>

            <svg viewBox="0 0 100 100" className="w-full h-32" preserveAspectRatio="none">
                {/* Area fill */}
                <motion.polygon
                    points={areaPoints}
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.3 }}
                    transition={{ duration: 1 }}
                />
                {/* Line */}
                <motion.polyline
                    points={points}
                    fill="none"
                    stroke="#4ADE80"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
                {/* Dots */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((d.value - minVal) / range) * 80 - 10;
                    return (
                        <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill="#4ADE80"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        />
                    );
                })}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="flex justify-between mt-2 text-[10px] text-farm-text-muted font-mono">
                {data.filter((_, i) => i === 0 || i === data.length - 1).map((d, i) => (
                    <span key={i}>{d.label}</span>
                ))}
            </div>
        </motion.div>
    );
}
