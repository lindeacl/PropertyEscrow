import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import EnhancedHomepage from './pages/EnhancedHomepage';
import Dashboard from './pages/Dashboard';
import CreateEscrow from './pages/CreateEscrow';
import EscrowDetails from './pages/EscrowDetails';
import Settings from './pages/Settings';
import { Toaster } from 'react-hot-toast';
import logger from './utils/logger';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  useEffect(() => {
    logger.uiAction('PropertyEscrow Platform initialized - Enterprise-grade blockchain escrow system');
  }, []);

  return (
    <ErrorBoundary>
      <WalletProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <Routes>
              <Route path="/" element={<EnhancedHomepage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-escrow" element={<CreateEscrow />} />
              <Route path="/escrow/:id" element={<EscrowDetails />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f3f4f6',
                  border: '1px solid #374151'
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#f3f4f6'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#f3f4f6'
                  }
                }
              }}
            />
          </div>
        </Router>
      </WalletProvider>
    </ErrorBoundary>
  );
};

export default App;