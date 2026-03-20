import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import AlertMap from '../components/alerts/AlertMap';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useStore from '../store/useStore';
import { getDiseaseAlerts, createDiseaseAlert } from '../services/supabase';
import { DISEASE_CLASSES } from '../utils/diseaseClasses';
import { CROPS } from '../utils/cropRecommendations';
import { Plus, X, Filter } from 'lucide-react';

export default function DiseaseAlerts() {
    const { user, diseaseAlerts, setDiseaseAlerts } = useStore();
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [filters, setFilters] = useState({ severity: '', disease_type: '' });
    const [form, setForm] = useState({
        disease_name: '', crop_name: '', severity: 'medium', latitude: '', longitude: '', description: '',
    });

    useEffect(() => { loadAlerts(); }, []);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const data = await getDiseaseAlerts(filters);
            setDiseaseAlerts(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            // Use user's location or defaults
            let lat = parseFloat(form.latitude) || 20.5937;
            let lng = parseFloat(form.longitude) || 78.9629;

            if (!form.latitude && navigator.geolocation) {
                try {
                    const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch { /* use defaults */ }
            }

            await createDiseaseAlert({
                user_id: user.id,
                disease_name: form.disease_name,
                crop_name: form.crop_name,
                severity: form.severity,
                latitude: lat,
                longitude: lng,
                description: form.description,
                reporter_name: user.user_metadata?.full_name || 'Farmer',
                created_at: new Date().toISOString(),
            });
            setShowForm(false);
            setForm({ disease_name: '', crop_name: '', severity: 'medium', latitude: '', longitude: '', description: '' });
            loadAlerts();
        } catch (err) { console.error(err); }
        setSubmitting(false);
    };

    const inputClass = "w-full px-4 py-3 bg-farm-bg border border-farm-border rounded-lg text-farm-text font-dm text-sm input-animated";
    const labelClass = "text-xs text-farm-text-muted uppercase tracking-wider font-mono mb-1.5 block";

    return (
        <PageWrapper>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-6">
                <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <p className="text-sm text-farm-text-muted font-mono uppercase tracking-widest">Community</p>
                        <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-farm-text">
                            Disease<br /><span className="text-farm-warning">Alerts</span>
                        </h1>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-farm-warning text-farm-bg font-syne font-bold rounded-lg">
                        <Plus className="w-5 h-5" />Report Disease
                    </motion.button>
                </motion.div>

                {/* Filters */}
                <motion.div variants={staggerItem} className="flex flex-wrap gap-3 items-center">
                    <Filter className="w-4 h-4 text-farm-text-muted" />
                    <select value={filters.severity} onChange={(e) => setFilters((p) => ({ ...p, severity: e.target.value }))}
                        className="px-3 py-2 bg-farm-card border border-farm-border rounded-lg text-sm text-farm-text font-dm">
                        <option value="">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={loadAlerts}
                        className="px-4 py-2 bg-farm-card border border-farm-border rounded-lg text-sm text-farm-text hover:border-farm-accent transition-colors">
                        Apply
                    </motion.button>
                </motion.div>

                {/* Map */}
                {loading ? <LoadingSpinner text="Loading disease alerts..." /> : (
                    <motion.div variants={staggerItem}>
                        <AlertMap alerts={diseaseAlerts} onMarkerClick={setSelectedAlert} />
                    </motion.div>
                )}

                {/* Alert Count */}
                <motion.div variants={staggerItem} className="text-sm text-farm-text-muted font-mono">
                    {diseaseAlerts.length} alert{diseaseAlerts.length !== 1 ? 's' : ''} reported
                </motion.div>

                {/* Selected Alert Detail */}
                <AnimatePresence>
                    {selectedAlert && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className="bg-farm-card border-l-4 border-farm-warning p-6 rounded-r-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-syne font-bold text-xl text-farm-text">{selectedAlert.disease_name}</h3>
                                    <p className="text-sm text-farm-text-secondary mt-1">Crop: {selectedAlert.crop_name}</p>
                                    <p className="text-xs text-farm-text-muted mt-1">Reported by {selectedAlert.reporter_name}</p>
                                </div>
                                <button onClick={() => setSelectedAlert(null)}>
                                    <X className="w-5 h-5 text-farm-text-muted" />
                                </button>
                            </div>
                            {selectedAlert.description && <p className="text-sm text-farm-text-secondary mt-3">{selectedAlert.description}</p>}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Report Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowForm(false)}>
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                                className="bg-farm-bg-secondary border border-farm-border rounded-xl p-6 w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-syne font-bold text-xl text-farm-text">Report Disease Alert</h2>
                                    <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-farm-text-muted" /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div><label className={labelClass}>Disease</label>
                                        <select value={form.disease_name} onChange={(e) => handleChange('disease_name', e.target.value)} required className={inputClass}>
                                            <option value="">Select disease...</option>
                                            {DISEASE_CLASSES.filter(d => !d.includes('Healthy')).map((d) => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div><label className={labelClass}>Affected Crop</label>
                                        <select value={form.crop_name} onChange={(e) => handleChange('crop_name', e.target.value)} required className={inputClass}>
                                            <option value="">Select crop...</option>
                                            {CROPS.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div><label className={labelClass}>Severity</label>
                                        <select value={form.severity} onChange={(e) => handleChange('severity', e.target.value)} className={inputClass}>
                                            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className={labelClass}>Latitude</label>
                                            <input type="number" step="any" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} className={inputClass} placeholder="Auto-detect" />
                                        </div>
                                        <div><label className={labelClass}>Longitude</label>
                                            <input type="number" step="any" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} className={inputClass} placeholder="Auto-detect" />
                                        </div>
                                    </div>
                                    <div><label className={labelClass}>Notes</label>
                                        <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className={inputClass} />
                                    </div>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={submitting}
                                        className="w-full py-3 bg-farm-warning text-farm-bg font-syne font-bold rounded-lg disabled:opacity-50">
                                        {submitting ? 'Reporting...' : 'Submit Report'}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </PageWrapper>
    );
}
