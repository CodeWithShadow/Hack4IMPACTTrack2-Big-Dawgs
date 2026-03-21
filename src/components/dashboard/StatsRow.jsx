import React from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from '../ui/AnimatedNumber';
import { Activity, Bug, Leaf, Droplets } from 'lucide-react';

const icons = [Activity, Bug, Leaf, Droplets];
const labels = ['Total Analyses', 'Diseases Detected', 'Crops Monitored', 'Water Saved (L)'];
const colors = ['#4ADE80', '#EF4444', '#FCD34D', '#60A5FA'];

export default function StatsRow({ stats }) {
    const values = [
        stats.totalAnalyses || 0,
        stats.diseasesDetected || 0,
        stats.cropsMonitored || 0,
        stats.waterSaved || 0,
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {values.map((value, i) => {
                const Icon = icons[i];
                return (
                    <motion.div
                        key={labels[i]}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 24 }}
                        whileHover={{ y: -4, boxShadow: `0 0 30px ${colors[i]}22` }}
                        className="bg-fm-bg-elevated border-l-4 p-5 rounded-r-lg relative overflow-hidden group cursor-default"
                        style={{ borderLeftColor: colors[i] }}
                    >
                        <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icon className="w-12 h-12" style={{ color: colors[i] }} />
                        </div>
                        <AnimatedNumber
                            value={value}
                            className="text-3xl md:text-4xl text-fm-text-primary"
                            label={labels[i]}
                            suffix={i === 3 ? '' : ''}
                        />
                    </motion.div>
                );
            })}
        </div>
    );
}
