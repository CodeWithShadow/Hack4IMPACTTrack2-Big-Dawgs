import React from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../../hooks/useCountUp';

export default function AnimatedNumber({
    value,
    duration = 2000,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = '',
    labelClassName = '',
    label = '',
}) {
    const animatedValue = useCountUp(value, duration, 0, decimals);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="select-none"
        >
            <p className={`font-mono font-bold tabular-nums ${className}`}>
                {prefix}{typeof animatedValue === 'number' ? animatedValue.toLocaleString() : animatedValue}{suffix}
            </p>
            {label && <p className={`text-sm text-fm-text-muted mt-1 font-dm ${labelClassName}`}>{label}</p>}
        </motion.div>
    );
}
