import React from 'react';
import { motion } from 'framer-motion';

export default function GradCAMOverlay({ originalSrc, heatmapSrc }) {
    return (
        <div className="relative rounded-lg overflow-hidden border border-fm-border">
            <img src={originalSrc} alt="Original" className="w-full max-h-[400px] object-contain bg-fm-bg-base" />
            {heatmapSrc && (
                <motion.img
                    src={heatmapSrc}
                    alt="Grad-CAM Heatmap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-contain mix-blend-screen"
                />
            )}
            {heatmapSrc && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-farm-bg/80 backdrop-blur text-xs font-mono text-fm-stat-crops flex items-center gap-2"
                >
                    <div className="w-3 h-2 rounded-sm" style={{ background: 'linear-gradient(to right, #FCD34D, #EF4444)' }} />
                    Affected Regions
                </motion.div>
            )}
        </div>
    );
}
