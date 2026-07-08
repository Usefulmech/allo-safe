import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import VoiceAssistant from './components/VoiceAssistant';
import LedgerHistory from './components/LedgerHistory';
import Inventory from './components/Inventory';
import Profile from './components/Profile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login has no nav */}
        <Route path="/" element={<Login />} />

        {/* All other pages wrapped in Layout (TopNav desktop + BottomNav mobile) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/voice" element={<Layout><VoiceAssistant /></Layout>} />
        <Route path="/ledger" element={<Layout><LedgerHistory /></Layout>} />
        <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
