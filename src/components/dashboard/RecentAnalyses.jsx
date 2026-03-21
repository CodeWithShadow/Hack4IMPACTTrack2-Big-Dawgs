import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Bug, FlaskConical, ChevronRight } from 'lucide-react';

export default function RecentAnalyses({ analyses }) {
    if (!analyses || analyses.length === 0) {
        return (
            <div className="bg-fm-bg-elevated border-l-4 border-fm-border p-6 rounded-r-lg">
                <p className="text-fm-text-muted text-sm font-dm">No analyses yet. Start by scanning a crop or soil sample!</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {analyses.map((item, i) => (
                <motion.div
                    key={item.id || i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(26, 58, 37, 0.5)' }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-farm-border/50 cursor-pointer transition-colors group"
                >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-fm-bg-base">
                        {item.image_url ? (
                            <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                {item.type === 'disease' ? (
                                    <Bug className="w-5 h-5 text-fm-stat-disease" />
                                ) : (
                                    <FlaskConical className="w-5 h-5 text-fm-stat-crops" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-fm-text-primary truncate font-dm">
                            {item.disease_name || item.soil_type || item.result || 'Analysis'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded ${item.type === 'disease' ? 'bg-farm-danger/10 text-fm-stat-disease' : 'bg-farm-warm/10 text-fm-stat-crops'
                                }`}>
                                {item.type === 'disease' ? 'Disease' : 'Soil'}
                            </span>
                            <span className="text-[11px] text-fm-text-muted">
                                {item.created_at ? format(new Date(item.created_at), 'MMM d, h:mm a') : ''}
                            </span>
                        </div>
                    </div>

                    {/* Confidence */}
                    {item.confidence && (
                        <span className="font-mono text-sm font-semibold text-fm-accent">
                            {Math.round(item.confidence * 100)}%
                        </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-fm-text-muted group-hover:text-fm-accent transition-colors" />
                </motion.div>
            ))}
        </div>
    );
}
