import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import ImageUploader from '../components/ui/ImageUploader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfidenceBar from '../components/ui/ConfidenceBar';
import TypewriterText from '../components/ui/TypewriterText';
import useStore from '../store/useStore';
import { analyzeSoilImage } from '../services/soilAnalysisService';
import { saveSoilAnalysis, uploadCropImage } from '../services/supabase';
import { SOIL_CROP_MAP } from '../utils/cropRecommendations';

export default function SoilAnalysis() {
    const { user } = useStore();
    const [imageSrc, setImageSrc] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progressText, setProgressText] = useState('');
    const [aiText, setAiText] = useState('');

    const handleImageSelect = (file, dataUrl) => {
        setImageFile(file);
        setImageSrc(dataUrl);
        setResult(null);
        setAiText('');
        setProgressText('');
    };

    const handleAnalyze = async () => {
        if (!imageSrc) return;
        setLoading(true);
        setAiText('');
        setProgressText('');

        try {
            setProgressText('Initializing offline model...');
            const res = await analyzeSoilImage(imageSrc, (text) => setProgressText(text));
            setResult(res);
            setAiText(res.aiText);
            setLoading(false);

            // Save to Supabase
            if (user) {
                const data = {
                    user_id: user.id,
                    soil_type: res.soilType.name,
                    confidence: res.confidence,
                    composition: res.composition,
                    ph_estimate: res.phEstimate,
                    nutrients: res.nutrients,
                    created_at: new Date().toISOString(),
                };
                try {
                    if (imageFile) {
                        const imageUrl = await uploadCropImage(user.id, imageFile);
                        data.image_url = imageUrl;
                    }
                    await saveSoilAnalysis(data);
                } catch (err) { console.error(err); }
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const recommendedCrops = result ? (SOIL_CROP_MAP[result.soilType.name] || []) : [];

    return (
        <PageWrapper>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8">
                <motion.div variants={staggerItem} className="space-y-1">
                    <p className="text-sm text-farm-text-muted font-mono uppercase tracking-widest">AI Analysis</p>
                    <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-farm-text">
                        Soil<br /><span className="text-farm-warm">Analysis</span>
                    </h1>
                    <p className="text-farm-text-muted font-dm mt-2">Upload a soil sample photo for AI-powered classification and crop recommendations.</p>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <ImageUploader onImageSelect={handleImageSelect} />
                </motion.div>

                {imageSrc && !result && (
                    <motion.div variants={staggerItem}>
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(252,211,77,0.2)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="w-full py-4 bg-farm-warm text-farm-bg font-syne font-bold text-lg rounded-lg disabled:opacity-50"
                        >
                            {loading ? <LoadingSpinner text={progressText || "Classifying soil..."} size="sm" /> : 'Analyze Soil'}
                        </motion.button>
                    </motion.div>
                )}

                {loading && !result && <LoadingSpinner text={progressText || "Running soil classification model..."} />}

                {result && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Soil Type */}
                        <div className="border-l-4 border-farm-warm pl-6 py-2">
                            <p className="text-xs uppercase tracking-widest text-farm-text-muted font-mono mb-1">Detected Soil Type</p>
                            <TypewriterText text={result.soilType.name} speed={50} className="font-syne font-bold text-3xl md:text-5xl text-farm-warm" />
                            <p className="text-farm-text-secondary text-sm mt-2 font-dm">{result.soilType.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="font-mono text-sm text-farm-accent">pH: {result.phEstimate}</span>
                                <span className="font-mono text-sm text-farm-text-muted">{Math.round(result.confidence * 100)}% confidence</span>
                            </div>
                        </div>

                        {/* Composition */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-farm-card border-l-4 border-farm-warm p-6 rounded-r-lg">
                            <h3 className="font-syne font-bold text-lg text-farm-text mb-4">Soil Composition</h3>
                            <div className="space-y-3">
                                {Object.entries(result.composition).map(([key, value], i) => (
                                    <ConfidenceBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={value / 100} color={key === 'organic' ? '#4ADE80' : key === 'clay' ? '#92400E' : key === 'silt' ? '#FCD34D' : '#86EFAC'} delay={i * 0.15} />
                                ))}
                            </div>
                        </motion.div>

                        {/* Nutrient Profile */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-farm-card border-l-4 border-farm-accent p-6 rounded-r-lg">
                            <h3 className="font-syne font-bold text-lg text-farm-text mb-4">Nutrient Profile</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(result.nutrients).map(([key, val]) => {
                                    const levelColors = { 'Very High': 'text-farm-accent', 'High': 'text-farm-accent', 'Medium': 'text-farm-warm', 'Low': 'text-farm-warning', 'Very Low': 'text-farm-danger' };
                                    return (
                                        <div key={key} className="text-center">
                                            <p className="text-xs text-farm-text-muted uppercase tracking-wider font-mono">{key}</p>
                                            <p className={`font-mono font-bold text-lg mt-1 ${levelColors[val] || 'text-farm-text'}`}>{val}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Recommended Crops */}
                        {recommendedCrops.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                                <h3 className="font-syne font-bold text-lg text-farm-text mb-4">Recommended Crops</h3>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x pb-2">
                                    {recommendedCrops.map((crop, i) => (
                                        <motion.div
                                            key={crop}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.8 + i * 0.1 }}
                                            whileHover={{ y: -4 }}
                                            className="flex-shrink-0 w-32 bg-farm-card border border-farm-border/50 p-4 rounded-lg text-center scroll-snap-align-start"
                                        >
                                            <span className="text-2xl">🌱</span>
                                            <p className="text-sm font-medium text-farm-text mt-2 font-dm">{crop}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* AI Recommendations */}
                        {aiText && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="bg-farm-card border-l-4 border-farm-accent-secondary p-6 rounded-r-lg">
                                <h3 className="font-syne font-bold text-lg text-farm-text mb-4">🤖 AI Recommendations</h3>
                                <TypewriterText text={aiText} speed={10} className="text-sm text-farm-text-secondary leading-relaxed font-dm" />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </PageWrapper>
    );
}
