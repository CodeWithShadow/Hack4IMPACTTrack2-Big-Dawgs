import React from 'react';
import { motion } from 'framer-motion';
import { Pill, Leaf, ShieldAlert, Clock } from 'lucide-react';

export default function TreatmentCard({ treatment, diseaseName }) {
    if (!treatment) return null;

    const urgencyColors = {
        'Critical': { bg: 'bg-farm-danger/10', text: 'text-farm-danger', border: 'border-farm-danger' },
        'High': { bg: 'bg-farm-warning/10', text: 'text-farm-warning', border: 'border-farm-warning' },
        'Medium': { bg: 'bg-farm-accent/10', text: 'text-farm-accent', border: 'border-farm-accent' },
    };

    const urgency = urgencyColors[treatment.urgency] || urgencyColors['Medium'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            className={`bg-farm-card border-l-4 ${urgency.border} p-6 rounded-r-lg space-y-4`}
        >
            <div className="flex items-center justify-between">
                <h4 className="font-syne font-bold text-farm-text">{diseaseName}</h4>
                <span className={`text-xs font-mono px-2 py-1 rounded ${urgency.bg} ${urgency.text}`}>
                    {treatment.urgency}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-farm-accent">
                        <Leaf className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-mono">Organic</span>
                    </div>
                    <p className="text-sm text-farm-text-secondary">{treatment.organic}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-farm-warning">
                        <Pill className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-mono">Chemical</span>
                    </div>
                    <p className="text-sm text-farm-text-secondary">{treatment.chemical}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-farm-danger">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-mono">Prevention</span>
                    </div>
                    <p className="text-sm text-farm-text-secondary">{treatment.prevention}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-wider font-mono">Recovery</span>
                    </div>
                    <p className="text-sm text-farm-text-secondary">{treatment.recovery}</p>
                </div>
            </div>
        </motion.div>
    );
}
