import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Locate, Shield } from 'lucide-react';
import useStore from '../../store/useStore';

export default function AlertRadiusSettings({ open, onClose }) {
    const { alertRadius, setAlertRadius, farmLocation, setFarmLocation } = useStore();
    const [localRadius, setLocalRadius] = useState(alertRadius);
    const [lat, setLat] = useState(farmLocation?.lat?.toString() || '');
    const [lng, setLng] = useState(farmLocation?.lng?.toString() || '');
    const [locating, setLocating] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleDetectLocation = async () => {
        if (!navigator.geolocation) return;
        setLocating(true);
        try {
            const pos = await new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
            );
            setLat(pos.coords.latitude.toFixed(6));
            setLng(pos.coords.longitude.toFixed(6));
        } catch (err) {
            console.error('Geolocation error:', err);
        }
        setLocating(false);
    };

    const handleSave = () => {
        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);
        setAlertRadius(localRadius);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            setFarmLocation({ lat: parsedLat, lng: parsedLng });
        }
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    const inputClass = "w-full px-4 py-3 bg-farm-bg border border-farm-border rounded-lg text-farm-text font-dm text-sm input-animated";
    const labelClass = "text-xs text-farm-text-muted uppercase tracking-wider font-mono mb-1.5 block";

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 30 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 30 }}
                        className="bg-farm-bg-secondary border border-farm-border rounded-xl p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-farm-accent/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-farm-accent" />
                                </div>
                                <div>
                                    <h2 className="font-syne font-bold text-lg text-farm-text">Alert Radius</h2>
                                    <p className="text-xs text-farm-text-muted font-dm">Get notified for nearby disease reports</p>
                                </div>
                            </div>
                            <button onClick={onClose}>
                                <X className="w-5 h-5 text-farm-text-muted hover:text-farm-text transition-colors" />
                            </button>
                        </div>

                        {/* Radius Slider */}
                        <div className="mb-6">
                            <label className={labelClass}>Notification Radius</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min={5}
                                    max={200}
                                    step={5}
                                    value={localRadius}
                                    onChange={(e) => setLocalRadius(parseInt(e.target.value))}
                                    className="radius-slider flex-1"
                                />
                                <div className="min-w-[60px] text-right">
                                    <span className="text-lg font-bold text-farm-accent font-mono">{localRadius}</span>
                                    <span className="text-xs text-farm-text-muted ml-1">km</span>
                                </div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-[10px] text-farm-text-muted font-mono">5 km</span>
                                <span className="text-[10px] text-farm-text-muted font-mono">200 km</span>
                            </div>
                        </div>

                        {/* Farm Location */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className={labelClass + " mb-0"}>Farm Location</label>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDetectLocation}
                                    disabled={locating}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-farm-accent bg-farm-accent/10 rounded-lg hover:bg-farm-accent/20 transition-colors disabled:opacity-50"
                                >
                                    <Locate className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                                    {locating ? 'Detecting...' : 'Use My Location'}
                                </motion.button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="number"
                                        step="any"
                                        value={lat}
                                        onChange={(e) => setLat(e.target.value)}
                                        className={inputClass}
                                        placeholder="Latitude"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="number"
                                        step="any"
                                        value={lng}
                                        onChange={(e) => setLng(e.target.value)}
                                        className={inputClass}
                                        placeholder="Longitude"
                                    />
                                </div>
                            </div>
                            {farmLocation && (
                                <div className="flex items-center gap-1.5 mt-2">
                                    <MapPin className="w-3 h-3 text-farm-accent" />
                                    <span className="text-[11px] text-farm-text-muted font-mono">
                                        Current: {farmLocation.lat.toFixed(4)}, {farmLocation.lng.toFixed(4)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Preview Info */}
                        <div className="bg-farm-bg/50 border border-farm-border rounded-lg p-3 mb-6">
                            <p className="text-xs text-farm-text-secondary font-dm leading-relaxed">
                                <span className="text-farm-warning">⚠</span> You'll be notified when a new disease alert is reported within <strong className="text-farm-accent">{localRadius} km</strong> of your farm location.
                            </p>
                        </div>

                        {/* Save Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            className={`w-full py-3 font-syne font-bold rounded-lg transition-colors ${
                                saved
                                    ? 'bg-farm-accent text-farm-bg'
                                    : 'bg-farm-warning text-farm-bg hover:bg-farm-warning/90'
                            }`}
                        >
                            {saved ? '✓ Saved!' : 'Save Settings'}
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
