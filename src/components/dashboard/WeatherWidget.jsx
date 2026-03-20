import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Droplets, Wind, Sun, Eye, Gauge } from 'lucide-react';
import { getWeather, getUserLocation } from '../../services/weather';
import useStore from '../../store/useStore';

const staggerItem = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
};

export default function WeatherWidget() {
    const { weather, setWeather, setWeatherLoading } = useStore();
    const [loading, setLoading] = useState(!weather);

    useEffect(() => {
        if (weather) return;
        (async () => {
            setLoading(true);
            setWeatherLoading(true);
            try {
                const loc = await getUserLocation();
                const data = await getWeather(loc);
                setWeather(data);
            } catch {
                const data = await getWeather('auto');
                setWeather(data);
            }
            setLoading(false);
        })();
    }, []);

    if (loading || !weather) {
        return (
            <div className="bg-farm-card border-l-4 border-farm-accent p-6 rounded-r-lg animate-pulse">
                <div className="h-6 w-32 bg-farm-border rounded mb-4" />
                <div className="h-16 w-24 bg-farm-border rounded" />
            </div>
        );
    }

    const { current, location } = weather;

    return (
        <motion.div
            variants={staggerItem}
            className="bg-farm-card border-l-4 border-farm-accent p-6 rounded-r-lg relative overflow-hidden"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-farm-accent/5 to-transparent pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                {/* Main temp */}
                <div className="flex items-start gap-4">
                    <span className="text-5xl">{current.icon}</span>
                    <div>
                        <p className="font-mono text-5xl font-bold text-farm-text leading-none">{current.temp}°</p>
                        <p className="text-sm text-farm-text-muted mt-1 font-dm">{current.description} • {location}</p>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: Droplets, label: 'Humidity', value: `${current.humidity}%`, color: 'text-blue-400' },
                        { icon: Wind, label: 'Wind', value: `${current.windSpeed} km/h`, color: 'text-farm-text-secondary' },
                        { icon: Sun, label: 'UV Index', value: current.uvIndex, color: 'text-farm-warm' },
                        { icon: Gauge, label: 'Pressure', value: `${current.pressure} hPa`, color: 'text-farm-accent-secondary' },
                    ].map((stat) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -2 }}
                            className="flex items-center gap-2"
                        >
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <div>
                                <p className="font-mono text-sm font-semibold text-farm-text">{stat.value}</p>
                                <p className="text-[10px] text-farm-text-muted uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
