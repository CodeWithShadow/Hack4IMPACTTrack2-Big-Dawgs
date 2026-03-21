import React from 'react';
import { motion } from 'framer-motion';
import ConfidenceBar from '../ui/ConfidenceBar';
import GradCAMOverlay from '../ui/GradCAMOverlay';
import TypewriterText from '../ui/TypewriterText';
import { AlertTriangle, Shield, ChevronDown } from 'lucide-react';
import { isContagious, getCropFromDisease, isHealthy } from '../../utils/diseaseClasses';
import { getTreatment } from '../../utils/treatmentMap';

export default function DiseaseResult({ result, imageSrc, heatmapSrc, treatmentText }) {
    if (!result) return null;

    const { topPrediction, allPredictions } = result;
    const contagious = isContagious(topPrediction.className);
    const healthy = isHealthy(topPrediction.className);
    const treatment = getTreatment(topPrediction.className);
    const crop = getCropFromDisease(topPrediction.className);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="space-y-6 mt-8"
        >
            {/* Disease Name */}
            <div className="border-l-4 border-fm-accent pl-6 py-2">
                <p className="text-xs uppercase tracking-widest text-fm-text-muted font-mono mb-1">Detected Condition</p>
                <TypewriterText
                    text={topPrediction.className}
                    speed={50}
                    className={`font-syne font-bold text-3xl md:text-5xl ${healthy ? 'text-fm-accent' : 'text-fm-stat-disease'}`}
                />
                <div className="flex items-center gap-3 mt-3">
                    <span className="font-mono text-lg font-bold text-fm-text-primary">
                        {Math.round(topPrediction.confidence * 100)}% confidence
                    </span>
                    {contagious && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-farm-danger/10 text-fm-stat-disease text-xs font-medium"
                        >
                            <AlertTriangle className="w-3 h-3" />
                            Contagious
                        </motion.span>
                    )}
                    {healthy && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 px-3 py-1 rounded-full bg-farm-accent/10 text-fm-accent text-xs font-medium"
                        >
                            <Shield className="w-3 h-3" />
                            Healthy
                        </motion.span>
                    )}
                </div>
            </div>

            {/* Heatmap */}
            {imageSrc && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <GradCAMOverlay originalSrc={imageSrc} heatmapSrc={heatmapSrc} />
                </motion.div>
            )}

            {/* Top Predictions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-fm-bg-elevated border-l-4 border-fm-accent p-6 rounded-r-lg"
            >
                <h3 className="font-syne font-bold text-lg text-fm-text-primary mb-4">Top Predictions</h3>
                <div className="space-y-3">
                    {allPredictions.slice(0, 5).map((pred, i) => (
                        <ConfidenceBar
                            key={pred.className}
                            label={pred.className}
                            value={pred.confidence}
                            color={i === 0 ? '#4ADE80' : '#86EFAC'}
                            delay={i * 0.15}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Quick Treatment Info */}
            {treatment && !healthy && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-fm-bg-elevated border-l-4 border-fm-stat-crops p-6 rounded-r-lg"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-syne font-bold text-lg text-fm-text-primary">Quick Treatment</h3>
                        <span className={`text-xs font-mono px-2 py-1 rounded ${treatment.urgency === 'Critical' ? 'bg-farm-danger/10 text-fm-stat-disease' :
                                treatment.urgency === 'High' ? 'bg-farm-warning/10 text-fm-stat-crops' :
                                    'bg-farm-accent/10 text-fm-accent'
                            }`}>
                            {treatment.urgency} Urgency
                        </span>
                    </div>
                    <div className="space-y-3 text-sm text-fm-text-secondary">
                        <div>
                            <p className="text-xs text-fm-text-muted uppercase tracking-wider mb-1">Organic</p>
                            <p>{treatment.organic}</p>
                        </div>
                        <div>
                            <p className="text-xs text-fm-text-muted uppercase tracking-wider mb-1">Chemical</p>
                            <p>{treatment.chemical}</p>
                        </div>
                        <div>
                            <p className="text-xs text-fm-text-muted uppercase tracking-wider mb-1">Recovery</p>
                            <p>{treatment.recovery}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* AI Treatment Plan */}
            {treatmentText && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-fm-bg-elevated border-l-4 border-fm-accent-hover p-6 rounded-r-lg"
                >
                    <h3 className="font-syne font-bold text-lg text-fm-text-primary mb-4">🤖 AI Treatment Plan</h3>
                    <TypewriterText
                        text={treatmentText}
                        speed={15}
                        className="text-sm text-fm-text-secondary leading-relaxed whitespace-pre-wrap font-dm"
                    />
                </motion.div>
            )}
        </motion.div>
    );
}
