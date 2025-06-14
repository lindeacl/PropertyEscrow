import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { ToastProvider } from './components/ui/ToastManager';

import Dashboard from './pages/Dashboard';
import CreateEscrow from './pages/CreateEscrow';
import EscrowDetails from './pages/EscrowDetails';
import Settings from './pages/Settings';
import logger from './utils/logger';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  useEffect(() => {
    logger.uiAction('Property Escrow Platform initialized - Enterprise-grade blockchain escrow system');
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <WalletProvider>
          <Router>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-escrow" element={<CreateEscrow />} />
              <Route path="/escrow/:id" element={<EscrowDetails />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Router>
        </WalletProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;