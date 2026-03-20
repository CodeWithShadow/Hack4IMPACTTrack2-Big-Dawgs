import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register PWA service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((reg) => {
                console.log('FarmFlux SW registered:', reg.scope);
            })
            .catch((err) => {
                console.log('FarmFlux SW registration failed:', err);
            });
    });
}

// PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Could show a custom install button
    console.log('FarmFlux install prompt ready');
});

window.addEventListener('appinstalled', () => {
    console.log('FarmFlux installed as PWA');
    deferredPrompt = null;
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
