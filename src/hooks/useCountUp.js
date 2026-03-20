import { useState, useEffect, useRef } from 'react';

export function useCountUp(end, duration = 2000, start = 0, decimals = 0) {
    const [value, setValue] = useState(start);
    const frameRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (end === start) { setValue(start); return; }

        startTimeRef.current = null;

        const animate = (timestamp) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);

            // Ease out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;

            setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [end, duration, start, decimals]);

    return value;
}
