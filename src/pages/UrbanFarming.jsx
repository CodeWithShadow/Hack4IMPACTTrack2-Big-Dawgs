import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TypewriterText from '../components/ui/TypewriterText';
import useStore from '../store/useStore';
import { getUrbanFarmingRecommendations } from '../services/gemini';
import { saveUrbanFarmingSession } from '../services/supabase';
import { Sprout, Sun, Droplets, ChevronDown, ChevronUp } from 'lucide-react';

export default function UrbanFarming() {
    const { user } = useStore();
    const [form, setForm] = useState({ city: '', space: '', sunlight: '', setting: 'outdoor' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [expandedCrop, setExpandedCrop] = useState(null);

    const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult('');

        try {
            await getUrbanFarmingRecommendations(form, (text, done) => {
                setResult(text);
                if (done && user) {
                    saveUrbanFarmingSession({
                        user_id: user.id, city: form.city, space: parseInt(form.space),
                        sunlight: parseInt(form.sunlight), setting: form.setting,
                        recommendations: text, created_at: new Date().toISOString(),
                    }).catch(console.error);
                }
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-fm-bg-elevated border border-fm-border rounded-lg text-fm-text-primary font-dm text-sm input-animated";
    const labelClass = "text-xs text-fm-text-muted uppercase tracking-wider font-mono mb-1.5 block";

    // Parse crop cards from AI text (simplified extraction)
    const sampleCrops = [
        { name: 'Tomatoes', icon: '🍅', difficulty: 'Easy', days: 60, water: 'Medium' },
        { name: 'Herbs (Basil)', icon: '🌿', difficulty: 'Easy', days: 30, water: 'Low' },
        { name: 'Lettuce', icon: '🥬', difficulty: 'Easy', days: 45, water: 'Medium' },
        { name: 'Chili Peppers', icon: '🌶️', difficulty: 'Medium', days: 75, water: 'Medium' },
        { name: 'Spinach', icon: '🥬', difficulty: 'Easy', days: 40, water: 'Medium' },
    ];

    return (
        <PageWrapper>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8">
                <motion.div variants={staggerItem}>
                    <p className="text-sm text-fm-text-muted font-mono uppercase tracking-widest">Growing Guide</p>
                    <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-fm-text-primary">
                        Urban<br /><span className="text-fm-accent">Farming</span>
                    </h1>
                    <p className="text-fm-text-muted font-dm mt-2">Get personalized crop recommendations for your urban space.</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={staggerItem}>
                            <label className={labelClass}>City</label>
                            <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)} required className={inputClass} placeholder="e.g., Mumbai" />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <label className={labelClass}>Available Space (sq ft)</label>
                            <input type="number" min="1" value={form.space} onChange={(e) => handleChange('space', e.target.value)} required className={inputClass} placeholder="e.g., 100" />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <label className={labelClass}>Sunlight Hours / Day</label>
                            <input type="number" min="0" max="14" value={form.sunlight} onChange={(e) => handleChange('sunlight', e.target.value)} required className={inputClass} placeholder="e.g., 6" />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <label className={labelClass}>Setting</label>
                            <select value={form.setting} onChange={(e) => handleChange('setting', e.target.value)} className={inputClass}>
                                <option value="outdoor">Outdoor / Terrace</option>
                                <option value="indoor">Indoor</option>
                                <option value="balcony">Balcony</option>
                            </select>
                        </motion.div>
                    </div>

                    <motion.div variants={staggerItem}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                            className="w-full py-4 bg-fm-accent text-fm-bg-base font-syne font-bold text-lg rounded-lg disabled:opacity-50">
                            {loading ? 'Analyzing...' : 'Get Recommendations'}
                        </motion.button>
                    </motion.div>
                </form>

                {loading && <LoadingSpinner text="Finding best crops for your space..." />}

                {result && (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {/* Quick Crop Cards */}
                        <div>
                            <h3 className="font-syne font-bold text-lg text-fm-text-primary mb-4">Recommended Crops</h3>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x pb-2">
                                {sampleCrops.map((crop, i) => (
                                    <motion.div
                                        key={crop.name}
                                        initial={{ opacity: 0, x: 30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -4 }}
                                        className="flex-shrink-0 w-40 bg-fm-bg-elevated border border-farm-border/50 p-4 rounded-lg"
                                    >
                                        <span className="text-3xl">{crop.icon}</span>
                                        <h4 className="font-syne font-bold text-fm-text-primary mt-2">{crop.name}</h4>
                                        <div className="mt-2 space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-fm-text-muted">
                                                <Sprout className="w-3 h-3" />
                                                <span>{crop.difficulty}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-fm-text-muted">
                                                <Sun className="w-3 h-3" />
                                                <span>{crop.days} days</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-fm-text-muted">
                                                <Droplets className="w-3 h-3" />
                                                <span>{crop.water}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* AI Full Recommendation */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="bg-fm-bg-elevated border-l-4 border-fm-accent p-6 rounded-r-lg">
                            <h3 className="font-syne font-bold text-lg text-fm-text-primary mb-4">🌱 Complete Growing Guide</h3>
                            <TypewriterText text={result} speed={8} className="text-sm text-fm-text-secondary leading-relaxed font-dm" />
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </PageWrapper>
    );
}
