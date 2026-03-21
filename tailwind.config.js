/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                fm: {
                    'bg-base':        'var(--fm-bg-base)',
                    'bg-surface':     'var(--fm-bg-surface)',
                    'bg-elevated':    'var(--fm-bg-elevated)',
                    'bg-subtle':      'var(--fm-bg-subtle)',
                    'accent':         'var(--fm-accent)',
                    'accent-hover':   'var(--fm-accent-hover)',
                    'accent-deep':    'var(--fm-accent-deep)',
                    'accent-muted':   'var(--fm-accent-muted)',
                    'text-primary':   'var(--fm-text-primary)',
                    'text-secondary': 'var(--fm-text-secondary)',
                    'text-muted':     'var(--fm-text-muted)',
                    'border':         'var(--fm-border-default)',
                    'border-strong':  'var(--fm-border-strong)',
                    'stat-analyses':  'var(--fm-stat-analyses)',
                    'stat-disease':   'var(--fm-stat-disease)',
                    'stat-crops':     'var(--fm-stat-crops)',
                    'stat-water':     'var(--fm-stat-water)',
                },
                gc: {
                    'bg-base':        'var(--gc-bg-base, #1A1814)',
                    'bg-surface':     'var(--gc-bg-surface, #201E19)',
                    'bg-elevated':    'var(--gc-bg-elevated, #2C2820)',
                    'bg-subtle':      'var(--gc-bg-subtle, #383024)',
                    'accent':         'var(--gc-accent, #C27A3A)',
                    'accent-hover':   'var(--gc-accent-hover, #A8642A)',
                    'accent-deep':    'var(--gc-accent-deep, #8A4E1E)',
                    'accent-muted':   'var(--gc-accent-muted, #352510)',
                    'text-primary':   'var(--gc-text-primary, #EBE3D8)',
                    'text-secondary': 'var(--gc-text-secondary, #9A9180)',
                    'text-muted':     'var(--gc-text-muted, #6A6258)',
                    'border':         'var(--gc-border-default, #3A3228)',
                    'border-strong':  'var(--gc-border-strong, #5A5040)',
                    'stat-analyses':  'var(--gc-stat-analyses, #C27A3A)',
                    'stat-disease':   'var(--gc-stat-disease, #B85C5C)',
                    'stat-crops':     'var(--gc-stat-crops, #9AB848)',
                    'stat-water':     'var(--gc-stat-water, #5A96C4)',
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
