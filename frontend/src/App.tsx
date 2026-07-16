import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VoiceAssistant from './components/VoiceAssistant';
import LedgerHistory from './components/LedgerHistory';
import Inventory from './components/Inventory';
import Profile from './components/Profile';
import { AuthProvider, useAuth } from './lib/AuthContext';
import './App.css';

// A simple wrapper to protect routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Remove the splash screen smoothly once React is fully mounted and ready
    const splash = document.getElementById('splash-screen');
    if (splash) {
      // Increased delay to ensure Tailwind CSS and large background images are fully processed
      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => {
          splash.remove();
        }, 600); // Matches the CSS transition time
      }, 800);
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login has no nav */}
          <Route path="/" element={<Login />} />

          {/* All other pages wrapped in Layout (TopNav desktop + BottomNav mobile) AND ProtectedRoute */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/voice" element={<ProtectedRoute><Layout><VoiceAssistant /></Layout></ProtectedRoute>} />
          <Route path="/ledger" element={<ProtectedRoute><Layout><LedgerHistory /></Layout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Layout><Inventory /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
