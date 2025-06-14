import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { ToastProvider } from './components/ui/ToastManager';
import PropertyEscrowPlatform from './pages/PropertyEscrowPlatform';
import Dashboard from './pages/Dashboard';
import CreateEscrow from './pages/CreateEscrow';
import EscrowDetails from './pages/EscrowDetails';
import Settings from './pages/Settings';
import logger from './utils/logger';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  useEffect(() => {
    logger.uiAction('PropertyEscrow Platform initialized - Enterprise-grade blockchain escrow system');
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <WalletProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
              <Routes>
                <Route path="/" element={<PropertyEscrowPlatform />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-escrow" element={<CreateEscrow />} />
                <Route path="/escrow/:id" element={<EscrowDetails />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </Router>
        </WalletProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;