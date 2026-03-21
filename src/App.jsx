import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './components/auth/AuthProvider';
import useStore from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import TopBar from './components/layout/TopBar';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import SoilAnalysis from './pages/SoilAnalysis';
import YieldPrediction from './pages/YieldPrediction';
import Irrigation from './pages/Irrigation';
import Marketplace from './pages/Marketplace';
import DiseaseAlerts from './pages/DiseaseAlerts';
import UrbanFarming from './pages/UrbanFarming';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
    const { user } = useStore();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function AppLayout({ children }) {
    const { sidebarOpen, isMobile, setIsMobile } = useStore();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        
        // Ensure theme matches store on mount
        if (useStore.getState().isDarkMode) {
            document.documentElement.classList.add('dark');
        }
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex min-h-screen bg-fm-bg-base">
            {/* Sidebar — desktop only */}
            {!isMobile && <Sidebar />}

            {/* Main Content */}
            <main
                className="flex-1 transition-all duration-300"
                style={{ marginLeft: !isMobile && sidebarOpen ? '260px' : '0' }}
            >
                <TopBar />
                {children}
            </main>

            {/* Bottom Nav — mobile only */}
            {isMobile && <BottomNav />}
        </div>
    );
}

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout><Dashboard /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/disease"
                    element={
                        <ProtectedRoute>
                            <AppLayout><DiseaseDetection /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/soil"
                    element={
                        <ProtectedRoute>
                            <AppLayout><SoilAnalysis /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/yield"
                    element={
                        <ProtectedRoute>
                            <AppLayout><YieldPrediction /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/irrigation"
                    element={
                        <ProtectedRoute>
                            <AppLayout><Irrigation /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/marketplace"
                    element={
                        <ProtectedRoute>
                            <AppLayout><Marketplace /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/alerts"
                    element={
                        <ProtectedRoute>
                            <AppLayout><DiseaseAlerts /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/urban"
                    element={
                        <ProtectedRoute>
                            <AppLayout><UrbanFarming /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <AppLayout><Profile /></AppLayout>
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AnimatedRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
