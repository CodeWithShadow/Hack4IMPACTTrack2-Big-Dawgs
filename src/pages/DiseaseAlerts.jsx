import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageWrapper, { staggerContainer, staggerItem } from '../components/layout/PageWrapper';
import AlertMap from '../components/alerts/AlertMap';
import TimelineSlider from '../components/alerts/TimelineSlider';
import AlertRadiusSettings from '../components/alerts/AlertRadiusSettings';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import useStore from '../store/useStore';
import { getDiseaseAlerts, createDiseaseAlert, deleteDiseaseAlert } from '../services/supabase';
import { DISEASE_CLASSES } from '../utils/diseaseClasses';
import { CROPS } from '../utils/cropRecommendations';
import { Plus, X, Filter, Settings } from 'lucide-react';

// Haversine distance in km
function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DiseaseAlerts() {
    const { user, diseaseAlerts, setDiseaseAlerts, alertRadius, farmLocation, addNotification } = useStore();
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showRadiusSettings, setShowRadiusSettings] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [filters, setFilters] = useState({ severity: '', disease_type: '' });
    const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
    const [form, setForm] = useState({
        disease_name: '', crop_name: '', severity: 'medium', latitude: '', longitude: '', description: '',
    });

    // Track previously seen alert IDs to avoid duplicate notifications
    const seenAlertIds = useRef(new Set());

    useEffect(() => { loadAlerts(); }, []);

    const loadAlerts = async () => {
        setLoading(true);
        try {
            const data = await getDiseaseAlerts(filters);
            // Check for proximity notifications on new alerts
            if (farmLocation && data.length > 0) {
                data.forEach((alert) => {
                    if (seenAlertIds.current.has(alert.id)) return;
                    seenAlertIds.current.add(alert.id);

                    const aLat = alert.latitude || alert.lat;
                    const aLng = alert.longitude || alert.lng;
                    if (!aLat || !aLng) return;

                    const dist = haversineKm(farmLocation.lat, farmLocation.lng, aLat, aLng);
                    if (dist <= alertRadius) {
                        addNotification({
                            id: `proximity-${alert.id}`,
                            type: 'warning',
                            title: '⚠ Nearby Disease Alert',
                            message: `${alert.disease_name || 'Disease'} reported ${Math.round(dist)} km from your farm${alert.crop_name ? ` in ${alert.crop_name} crops` : ''}.`,
                        });
                    }
                });
            }
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
            let lat = parseFloat(form.latitude) || 20.5937;
            let lng = parseFloat(form.longitude) || 78.9629;

            if (!form.latitude && navigator.geolocation) {
                try {
                    const getPos = new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
                    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000));
                    const pos = await Promise.race([getPos, timeout]);
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

    const [deleting, setDeleting] = useState(false);

    const handleDeleteAlert = async () => {
        if (!selectedAlert || !user) return;
        setDeleting(true);
        try {
            await deleteDiseaseAlert(selectedAlert.id);
            setSelectedAlert(null);
            loadAlerts();
        } catch (err) { 
            console.error('Delete error:', err); 
            alert(`Could not delete: ${err.message}. If this is an RLS policy issue, please run the SQL command to allow DELETES on disease_alerts.`);
        } finally {
            setDeleting(false);
        }
    };

    // Filter alerts by timeline date range
    const filteredAlerts = diseaseAlerts.filter((alert) => {
        if (!dateRange.startDate || !dateRange.endDate) return true;
        if (!alert.created_at) return true;
        const alertDate = new Date(alert.created_at);
        return alertDate >= dateRange.startDate && alertDate <= dateRange.endDate;
    });

    const inputClass = "w-full px-4 py-3 bg-fm-bg-base border border-fm-border-default rounded-lg text-fm-text-primary font-dm text-sm input-animated";
    const labelClass = "text-xs text-fm-text-muted uppercase tracking-wider font-mono mb-1.5 block";

    return (
        <PageWrapper>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-6xl mx-auto space-y-6">
                <motion.div variants={staggerItem} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <p className="text-sm text-fm-text-muted font-mono uppercase tracking-widest">Community</p>
                        <h1 className="font-syne font-extrabold text-4xl md:text-5xl text-fm-text-primary">
                            Disease<br /><span className="text-fm-stat-crops">Alerts</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowRadiusSettings(true)}
                            className="flex items-center gap-2 px-4 py-3 bg-fm-bg-elevated border border-fm-border-default text-fm-text-secondary font-syne font-bold rounded-lg hover:border-fm-accent transition-colors">
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Alert Radius</span>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-fm-stat-crops text-fm-text-primary font-syne font-bold rounded-lg">
                            <Plus className="w-5 h-5" />Report Disease
                        </motion.button>
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div variants={staggerItem} className="flex flex-wrap gap-3 items-center">
                    <Filter className="w-4 h-4 text-fm-text-muted" />
                    <select value={filters.severity} onChange={(e) => setFilters((p) => ({ ...p, severity: e.target.value }))}
                        className="px-3 py-2 bg-fm-bg-elevated border border-fm-border rounded-lg text-sm text-fm-text-primary font-dm">
                        <option value="">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={loadAlerts}
                        className="px-4 py-2 bg-fm-bg-elevated border border-fm-border rounded-lg text-sm text-fm-text-primary hover:border-fm-accent transition-colors">
                        Apply
                    </motion.button>
                </motion.div>

                {/* Timeline Slider */}
                <motion.div variants={staggerItem}>
                    <TimelineSlider onChange={setDateRange} />
                </motion.div>

                {/* Map */}
                {loading ? <LoadingSpinner text="Loading disease alerts..." /> : (
                    <motion.div variants={staggerItem}>
                        <AlertMap
                            alerts={filteredAlerts}
                            onMarkerClick={setSelectedAlert}
                            farmLocation={farmLocation}
                            alertRadiusKm={alertRadius}
                        />
                    </motion.div>
                )}

                {/* Alert Count */}
                <motion.div variants={staggerItem} className="text-sm text-fm-text-muted font-mono">
                    {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} shown
                    {filteredAlerts.length !== diseaseAlerts.length && (
                        <span className="text-fm-text-secondary"> (of {diseaseAlerts.length} total)</span>
                    )}
                </motion.div>

                {/* Selected Alert Detail */}
                <AnimatePresence>
                    {selectedAlert && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className="bg-fm-bg-elevated border-l-4 border-fm-stat-crops p-6 rounded-r-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-syne font-bold text-xl text-fm-text-primary">{selectedAlert.disease_name}</h3>
                                    <p className="text-sm text-fm-text-secondary mt-1">Crop: {selectedAlert.crop_name}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-xs text-fm-text-muted">Reported by {selectedAlert.reporter_name}</p>
                                        {user?.id === selectedAlert.user_id && (
                                            <button 
                                                onClick={handleDeleteAlert} 
                                                disabled={deleting}
                                                className="text-xs px-2 py-0.5 rounded bg-farm-danger/10 text-fm-stat-disease hover:bg-fm-stat-disease hover:text-fm-text-primary transition-colors disabled:opacity-50"
                                            >
                                                {deleting ? 'Deleting...' : 'Delete'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedAlert(null)}>
                                    <X className="w-5 h-5 text-fm-text-muted" />
                                </button>
                            </div>
                            {selectedAlert.description && <p className="text-sm text-fm-text-secondary mt-3">{selectedAlert.description}</p>}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Report Form Modal */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowForm(false)}>
                            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                                className="bg-fm-bg-surface border border-fm-border rounded-xl p-6 w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-syne font-bold text-xl text-fm-text-primary">Report Disease Alert</h2>
                                    <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-fm-text-muted" /></button>
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
                                        className="w-full py-3 bg-fm-stat-crops text-fm-text-primary font-syne font-bold rounded-lg disabled:opacity-50">
                                        {submitting ? 'Reporting...' : 'Submit Report'}
                                    </motion.button>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Alert Radius Settings Modal */}
                <AlertRadiusSettings open={showRadiusSettings} onClose={() => setShowRadiusSettings(false)} />
            </motion.div>
        </PageWrapper>
    );
}
