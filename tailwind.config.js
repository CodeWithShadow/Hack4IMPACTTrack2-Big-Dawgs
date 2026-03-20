/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                farm: {
                    bg: '#0A1A0F',
                    'bg-secondary': '#0F2318',
                    card: '#112A1A',
                    accent: '#4ADE80',
                    'accent-secondary': '#86EFAC',
                    warm: '#FCD34D',
                    earth: '#92400E',
                    text: '#F0FDF4',
                    'text-secondary': '#86EFAC',
                    'text-muted': 'rgba(74, 222, 128, 0.53)',
                    border: '#1A3A25',
                    danger: '#EF4444',
                    warning: '#F59E0B',
                }
            },
            fontFamily: {
                syne: ['Syne', 'sans-serif'],
                dm: ['DM Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'gradient-mesh': 'gradientMesh 15s ease infinite',
                'pulse-border': 'pulseBorder 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'spin-slow': 'spin 8s linear infinite',
                'slide-indicator': 'slideIndicator 0.3s ease-out',
                'grain': 'grain 0.5s steps(10) infinite',
            },
            keyframes: {
                gradientMesh: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                pulseBorder: {
                    '0%, 100%': { borderColor: 'rgba(74, 222, 128, 0.3)' },
                    '50%': { borderColor: 'rgba(74, 222, 128, 0.8)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                slideIndicator: {
                    '0%': { transform: 'scaleX(0)' },
                    '100%': { transform: 'scaleX(1)' },
                },
                grain: {
                    '0%, 100%': { transform: 'translate(0, 0)' },
                    '10%': { transform: 'translate(-5%, -10%)' },
                    '20%': { transform: 'translate(-15%, 5%)' },
                    '30%': { transform: 'translate(7%, -25%)' },
                    '40%': { transform: 'translate(-5%, 25%)' },
                    '50%': { transform: 'translate(-15%, 10%)' },
                    '60%': { transform: 'translate(15%, 0%)' },
                    '70%': { transform: 'translate(0%, 15%)' },
                    '80%': { transform: 'translate(3%, 35%)' },
                    '90%': { transform: 'translate(-10%, 10%)' },
                }
            },
            backgroundSize: {
                '300%': '300% 300%',
            }
        },
    },
    plugins: [],
};
