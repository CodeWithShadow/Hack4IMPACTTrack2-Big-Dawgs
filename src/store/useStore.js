import { create } from 'zustand';

const useStore = create((set, get) => ({
    // Auth
    user: null,
    session: null,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),

    // Settings
    geminiApiKey: localStorage.getItem('farmflux_gemini_api_key') || '',
    setGeminiApiKey: (key) => {
        if (key) {
            localStorage.setItem('farmflux_gemini_api_key', key);
        } else {
            localStorage.removeItem('farmflux_gemini_api_key');
        }
        set({ geminiApiKey: key });
    },

    // UI
    isDarkMode: localStorage.getItem('farmflux_theme') === 'dark',
    toggleDarkMode: () => set((s) => {
        const newTheme = !s.isDarkMode;
        localStorage.setItem('farmflux_theme', newTheme ? 'dark' : 'light');
        if (newTheme) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newTheme };
    }),
    sidebarOpen: true,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    isMobile: window.innerWidth < 768,
    setIsMobile: (v) => set({ isMobile: v }),

    // Weather
    weather: null,
    weatherLoading: false,
    setWeather: (weather) => set({ weather, weatherLoading: false }),
    setWeatherLoading: (v) => set({ weatherLoading: v }),

    // Stats
    stats: { totalAnalyses: 0, diseasesDetected: 0, cropsMonitored: 0, waterSaved: 0 },
    setStats: (stats) => set({ stats }),

    // Disease Detection
    diseaseResult: null,
    diseaseLoading: false,
    setDiseaseResult: (result) => set({ diseaseResult: result, diseaseLoading: false }),
    setDiseaseLoading: (v) => set({ diseaseLoading: v }),
    clearDiseaseResult: () => set({ diseaseResult: null }),

    // Soil Analysis
    soilResult: null,
    soilLoading: false,
    setSoilResult: (result) => set({ soilResult: result, soilLoading: false }),
    setSoilLoading: (v) => set({ soilLoading: v }),
    clearSoilResult: () => set({ soilResult: null }),

    // Offline
    isOnline: navigator.onLine,
    setOnline: (v) => set({ isOnline: v }),
    pendingSync: [],
    addPendingSync: (item) => set((s) => ({ pendingSync: [...s.pendingSync, item] })),
    clearPendingSync: () => set({ pendingSync: [] }),

    // Notifications
    notifications: [],
    addNotification: (notification) => set((s) => {
        // Prevent duplicate notifications if a custom ID is provided
        if (notification.id && s.notifications.some(n => n.id === notification.id)) return s;
        return {
            notifications: [{
                id: notification.id || Date.now().toString(),
                date: new Date().toISOString(),
                read: false,
                ...notification
            }, ...s.notifications]
        };
    }),
    markNotificationsRead: () => set((s) => ({
        notifications: s.notifications.map(n => ({ ...n, read: true }))
    })),
    clearNotifications: () => set({ notifications: [] }),

    // Recent Analyses
    recentAnalyses: [],
    setRecentAnalyses: (data) => set({ recentAnalyses: data }),

    // Marketplace
    listings: [],
    myListings: [],
    setListings: (data) => set({ listings: data }),
    setMyListings: (data) => set({ myListings: data }),

    // Alert Radius & Farm Location
    alertRadius: parseInt(localStorage.getItem('farmflux_alert_radius')) || 30,
    setAlertRadius: (km) => {
        localStorage.setItem('farmflux_alert_radius', km.toString());
        set({ alertRadius: km });
    },
    farmLocation: JSON.parse(localStorage.getItem('farmflux_farm_location') || 'null'),
    setFarmLocation: (loc) => {
        localStorage.setItem('farmflux_farm_location', JSON.stringify(loc));
        set({ farmLocation: loc });
    },

    // Alerts
    diseaseAlerts: [],
    setDiseaseAlerts: (data) => set({ diseaseAlerts: data }),

    // Model Status
    diseaseModelLoaded: false,
    soilModelLoaded: false,
    modelLoadProgress: 0,
    setDiseaseModelLoaded: (v) => set({ diseaseModelLoaded: v }),
    setSoilModelLoaded: (v) => set({ soilModelLoaded: v }),
    setModelLoadProgress: (v) => set({ modelLoadProgress: v }),
}));

export default useStore;
