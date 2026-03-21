import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';

const TOTAL_DAYS = 90;

function dayToDate(day) {
    return subDays(new Date(), TOTAL_DAYS - day);
}

function formatDateLabel(date) {
    return format(date, 'MMM d');
}

export default function TimelineSlider({ onChange }) {
    const [minVal, setMinVal] = useState(0);
    const [maxVal, setMaxVal] = useState(TOTAL_DAYS);
    const rangeRef = useRef(null);

    const startDate = dayToDate(minVal);
    const endDate = dayToDate(maxVal);

    // Calculate the filled track percentage
    const minPercent = (minVal / TOTAL_DAYS) * 100;
    const maxPercent = (maxVal / TOTAL_DAYS) * 100;

    const emitChange = useCallback((min, max) => {
        if (onChange) {
            onChange({
                startDate: dayToDate(min),
                endDate: dayToDate(max),
            });
        }
    }, [onChange]);

    const handleMinChange = (e) => {
        const value = Math.min(Number(e.target.value), maxVal - 1);
        setMinVal(value);
        emitChange(value, maxVal);
    };

    const handleMaxChange = (e) => {
        const value = Math.max(Number(e.target.value), minVal + 1);
        setMaxVal(value);
        emitChange(minVal, value);
    };

    // Emit initial range on mount
    useEffect(() => {
        emitChange(minVal, maxVal);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-fm-bg-elevated border border-fm-border rounded-lg p-4 md:p-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-fm-accent" />
                    <span className="text-xs text-fm-text-secondary uppercase tracking-wider font-mono">Timeline</span>
                </div>
                <motion.span
                    key={`${minVal}-${maxVal}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-sm font-medium text-fm-text-primary font-dm"
                >
                    {formatDateLabel(startDate)} – {formatDateLabel(endDate)}
                </motion.span>
            </div>

            {/* Dual-handle Range Slider */}
            <div className="timeline-slider-container">
                {/* Filled track */}
                <div
                    className="timeline-slider-track"
                    style={{
                        left: `${minPercent}%`,
                        width: `${maxPercent - minPercent}%`,
                    }}
                />

                {/* Min handle */}
                <input
                    type="range"
                    min={0}
                    max={TOTAL_DAYS}
                    value={minVal}
                    onChange={handleMinChange}
                    className="timeline-slider-thumb timeline-slider-thumb--left"
                    style={{ zIndex: minVal > TOTAL_DAYS - 5 ? 5 : 3 }}
                />

                {/* Max handle */}
                <input
                    type="range"
                    min={0}
                    max={TOTAL_DAYS}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="timeline-slider-thumb timeline-slider-thumb--right"
                    style={{ zIndex: 4 }}
                />
            </div>

            {/* Axis labels */}
            <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-fm-text-secondary font-mono">
                    {formatDateLabel(dayToDate(0))}
                </span>
                <span className="text-[10px] text-fm-text-secondary font-mono">
                    Today
                </span>
            </div>
        </motion.div>
    );
}
