import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TypewriterText({ text, speed = 30, className = '', onComplete }) {
    const [displayed, setDisplayed] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!text) return;
        setDisplayed('');
        setIsComplete(false);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, i + 1));
                i++;
            } else {
                setIsComplete(true);
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={className}
        >
            <span className="whitespace-pre-wrap">{displayed}</span>
            {!isComplete && <span className="typewriter-cursor" />}
        </motion.div>
    );
}
