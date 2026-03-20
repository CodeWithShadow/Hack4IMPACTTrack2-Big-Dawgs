import { useEffect } from 'react';
import useStore from '../store/useStore';

export function useOffline() {
    const { isOnline, setOnline, pendingSync, clearPendingSync } = useStore();

    useEffect(() => {
        const handleOnline = () => {
            setOnline(true);
            syncPendingData();
        };
        const handleOffline = () => setOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const syncPendingData = async () => {
        const { pendingSync } = useStore.getState();
        if (pendingSync.length === 0) return;

        for (const item of pendingSync) {
            try {
                if (item.type === 'disease_analysis') {
                    const { saveDiseaseAnalysis } = await import('../services/supabase');
                    await saveDiseaseAnalysis(item.data);
                } else if (item.type === 'soil_analysis') {
                    const { saveSoilAnalysis } = await import('../services/supabase');
                    await saveSoilAnalysis(item.data);
                }
            } catch (err) {
                console.error('Sync failed for item:', item, err);
            }
        }
        clearPendingSync();
    };

    const saveForSync = (type, data) => {
        if (!isOnline) {
            // Save to localStorage for offline persistence
            const offlineData = JSON.parse(localStorage.getItem('farmflux_offline_data') || '[]');
            offlineData.push({ type, data, timestamp: Date.now() });
            localStorage.setItem('farmflux_offline_data', JSON.stringify(offlineData));
            useStore.getState().addPendingSync({ type, data });
        }
    };

    return { isOnline, saveForSync, syncPendingData };
}
