import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
    const sizeMap = { sm: 'w-8 h-8', md: 'w-16 h-16', lg: 'w-24 h-24' };
    const leafSize = sizeMap[size] || sizeMap.md;

    return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
            <motion.div
                className={`${leafSize} relative`}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
                {/* Rotating leaf SVG */}
                <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
                    <motion.path
                        d="M32 4C32 4 12 16 12 36C12 46 18 54 28 58C30 58.5 31 59 32 60C33 59 34 58.5 36 58C46 54 52 46 52 36C52 16 32 4 32 4Z"
                        fill="url(#leafGrad)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.path
                        d="M32 14V54"
                        stroke="#0A1A0F"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        opacity={0.3}
                    />
                    <motion.path
                        d="M32 24L22 32M32 30L24 38M32 36L26 44M32 24L42 32M32 30L40 38M32 36L38 44"
                        stroke="#0A1A0F"
                        strokeWidth="1"
                        strokeLinecap="round"
                        opacity={0.2}
                    />
                    <defs>
                        <linearGradient id="leafGrad" x1="12" y1="4" x2="52" y2="60">
                            <stop offset="0%" stopColor="#4ADE80" />
                            <stop offset="100%" stopColor="#86EFAC" />
                        </linearGradient>
                    </defs>
                </svg>
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm text-farm-text-muted font-dm"
            >
                {text}
            </motion.p>
        </div>
    );
}
