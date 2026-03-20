import { create } from 'zustand';

const useStore = create((set, get) => ({
    // Auth
    user: null,
    session: null,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),

    // UI
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

    // Recent Analyses
    recentAnalyses: [],
    setRecentAnalyses: (data) => set({ recentAnalyses: data }),

    // Marketplace
    listings: [],
    myListings: [],
    setListings: (data) => set({ listings: data }),
    setMyListings: (data) => set({ myListings: data }),

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
