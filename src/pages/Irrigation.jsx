import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import TypewriterText from '../components/ui/TypewriterText';
import useStore from '../store/useStore';
import { getIrrigationSchedule } from '../services/gemini';
import { getWeather } from '../services/weather';
import { saveIrrigationLog } from '../services/supabase';
import { CROPS, IRRIGATION_FREQUENCIES } from '../utils/cropRecommendations';
import { SOIL_CLASSES } from '../utils/soilClasses';
import { Droplets, Calendar, TrendingDown } from 'lucide-react';

export default function Irrigation() {
    const { user } = useStore();
    const [form, setForm] = useState({ crop: '', fieldSize: '', soilType: '', location: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [irrigateToday, setIrrigateToday] = useState(null);
    const [waterEfficiency, setWaterEfficiency] = useState(null);

    const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult('');
        setIrrigateToday(null);
        setWaterEfficiency(null);

        try {
            const weather = await getWeather(form.location || 'auto');

            await getIrrigationSchedule(
                { ...form, weather: weather.current, forecast: weather.forecast },
                (text, done) => {
                    setResult(text);
                    if (done) {
                        // Parse yes/no for today
                        const lower = text.toLowerCase();
                        setIrrigateToday(lower.includes('yes') && lower.indexOf('yes') < 500);
                        // Extract efficiency
                        const match = text.match(/(\d{1,3})%?\s*(efficiency|saving)/i);
                        setWaterEfficiency(match ? parseInt(match[1]) : 72);
                    }
                }
            );

            setLoading(false);

            if (user) {
                try {
                    await saveIrrigationLog({
                        user_id: user.id,
                        crop: form.crop,
                        field_size: parseFloat(form.fieldSize),
                        soil_type: form.soilType,
                        location: form.location,
                        irrigate_today: irrigateToday,
                        result_text: result,
                        created_at: new Date().toISOString(),
                    });
                } catch (err) { console.error(err); }
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 bg-farm-card border border-farm-border rounded-lg text-farm-text font-dm text-sm input-animated focus:border-farm-accent";
    const labelClass = "text-xs text-farm-text-muted uppercase tracking-wider font-mono mb-1.5 block";

    const circumference = 2 * Math.PI * 45;
    const efficiencyOffset = circumference - ((waterEfficiency || 0) / 100) * circumference;

    return (
        <PageWrapper>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-8">
                <motion.div variants={staggerItem} className="space-y-1">
                    <p className="text-sm text-farm-text-muted font-mono uppercase tracking-widest">Smart Planning</p>
                    <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-farm-text">
                        Smart<br /><span className="text-blue-400">Irrigation</span>
                    </h1>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={staggerItem}>
                            <label className={labelClass}>Crop Type</label>
                            <select value={form.crop} onChange={(e) => handleChange('crop', e.target.value)} required className={inputClass}>
                                <option value="">Select crop...</option>
                                {CROPS.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
                            </select>
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <label className={labelClass}>Field Size (hectares)</label>
                            <input type="number" step="0.1" min="0.1" value={form.fieldSize} onChange={(e) => handleChange('fieldSize', e.target.value)} required className={inputClass} placeholder="e.g., 2.5" />
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <label className={labelClass}>Soil Type</label>
                            <select value={form.soilType} onChange={(e) => handleChange('soilType', e.target.value)} required className={inputClass}>
                                <option value="">Select soil...</option>
                                {SOIL_CLASSES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
                            </select>
                        </motion.div>
                        <motion.div variants={staggerItem}>
                            <label className={labelClass}>Location</label>
                            <input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)} className={inputClass} placeholder="e.g., Jaipur, Rajasthan" />
                        </motion.div>
                    </div>

                    <motion.div variants={staggerItem}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                            className="w-full py-4 bg-blue-500 text-white font-syne font-bold text-lg rounded-lg disabled:opacity-50">
                            {loading ? 'Calculating...' : 'Get Irrigation Plan'}
                        </motion.button>
                    </motion.div>
                </form>

                {loading && <LoadingSpinner text="Calculating optimal irrigation schedule..." />}

                {irrigateToday !== null && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className={`p-6 rounded-lg border-l-4 ${irrigateToday ? 'border-blue-400 bg-blue-500/5' : 'border-farm-accent bg-farm-accent/5'}`}>
                            <Droplets className={`w-8 h-8 mb-3 ${irrigateToday ? 'text-blue-400' : 'text-farm-accent'}`} />
                            <p className="font-syne font-bold text-2xl text-farm-text">{irrigateToday ? 'Yes' : 'No'}</p>
                            <p className="text-xs text-farm-text-muted font-mono uppercase tracking-wider mt-1">Irrigate Today</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="bg-farm-card border-l-4 border-farm-accent p-6 rounded-r-lg flex flex-col items-center">
                            <div className="relative w-24 h-24">
                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" fill="none" stroke="#1A3A25" strokeWidth="6" />
                                    <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#60A5FA" strokeWidth="6" strokeLinecap="round"
                                        strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: efficiencyOffset }}
                                        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }} />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="font-mono text-2xl font-bold text-farm-text">{waterEfficiency}%</span>
                                </div>
                            </div>
                            <p className="text-xs text-farm-text-muted font-mono uppercase tracking-wider mt-2">Water Efficiency</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-farm-card border-l-4 border-farm-warm p-6 rounded-r-lg">
                            <TrendingDown className="w-8 h-8 text-farm-warm mb-3" />
                            <AnimatedNumber value={Math.round((waterEfficiency || 70) * 15)} className="text-3xl text-farm-text" suffix=" L" />
                            <p className="text-xs text-farm-text-muted font-mono uppercase tracking-wider mt-1">Est. Water Savings</p>
                        </motion.div>
                    </div>
                )}

                {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-farm-card border-l-4 border-blue-400 p-6 rounded-r-lg">
                        <h3 className="font-syne font-bold text-lg text-farm-text mb-4">💧 AI Irrigation Schedule</h3>
                        <TypewriterText text={result} speed={10} className="text-sm text-farm-text-secondary leading-relaxed font-dm" />
                    </motion.div>
                )}
            </motion.div>
        </PageWrapper>
    );
}
