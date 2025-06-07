import React, { useState, useEffect } from 'react';
import logger from './utils/logger';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  useEffect(() => {
    logger.uiAction('Application mounted');
  }, []);

  const handleWalletConnect = () => {
    logger.walletConnectAttempt('MetaMask');
    
    setTimeout(() => {
      const mockAddress = '0x742d35Cc6aB4C24C26d4c85b53B4c85b53B4c85';
      setCurrentAddress(mockAddress);
      setWalletConnected(true);
      logger.walletConnected(mockAddress, 'Polygon Mainnet');
    }, 1000);
  };

  const handleWalletDisconnect = () => {
    logger.walletDisconnected(currentAddress);
    setWalletConnected(false);
    setCurrentAddress('');
  };

  const handleCreateEscrow = () => {
    const params = {
      propertyId: 'PROP001',
      depositAmount: '250000',
      buyer: '0x123...abc',
      seller: '0x456...def'
    };
    
    logger.escrowCreateAttempt(params, currentAddress);
    logger.uiAction('Escrow creation form submitted', { propertyId: params.propertyId });
    
    setTimeout(() => {
      const txHash = '0x123abc...def';
      const escrowAddress = '0xEscrow123...abc';
      logger.transactionSent('Create Escrow', txHash, currentAddress, escrowAddress);
      
      setTimeout(() => {
        logger.transactionMined('Create Escrow', txHash, 18234567, '157492');
        logger.escrowCreated(escrowAddress, 'escrow_001', txHash, currentAddress);
      }, 2000);
    }, 500);
  };

  const handleDepositFunds = () => {
    logger.escrowDepositAttempt('0xEscrow123...abc', '250000', currentAddress);
    
    setTimeout(() => {
      const txHash = '0x456def...ghi';
      logger.transactionSent('Deposit Funds', txHash, currentAddress, '0xEscrow123...abc');
      
      setTimeout(() => {
        logger.transactionMined('Deposit Funds', txHash, 18234568, '89234');
        logger.escrowDeposited('0xEscrow123...abc', '250000', txHash, currentAddress);
      }, 1500);
    }, 500);
  };

  const handleRaiseDispute = () => {
    logger.uiAction('Dispute form opened');
    
    setTimeout(() => {
      const txHash = '0x789ghi...jkl';
      const reason = 'Property condition issues discovered during inspection';
      logger.transactionSent('Raise Dispute', txHash, currentAddress, '0xEscrow123...abc');
      
      setTimeout(() => {
        logger.transactionMined('Raise Dispute', txHash, 18234569, '95432');
        logger.escrowDisputeRaised('0xEscrow123...abc', reason, txHash, currentAddress);
      }, 1500);
    }, 500);
  };

  const handleTransactionError = () => {
    const error = new Error('Insufficient funds for intrinsic transaction cost');
    logger.transactionFailed('Release Funds', '0xFailed123...xyz', error, currentAddress);
  };

  const handleUIError = () => {
    try {
      throw new Error('Simulated UI error for testing');
    } catch (error) {
      logger.uiError(error as Error, 'TestComponent', 'Button click');
    }
  };

  return (
    <ErrorBoundary>
      <div style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        background: '#f8fafc'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '10px',
          marginBottom: '30px'
        }}>
          <h1>Property Escrow Platform - Logging System Demo</h1>
          <p>Comprehensive logging for all user actions, transactions, and contract interactions</p>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            Open browser console (F12) to see detailed structured logs
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '25px',
          borderRadius: '10px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2>Wallet Connection</h2>
          <p>Status: {walletConnected ? `Connected (${currentAddress})` : 'Disconnected'}</p>
          <button
            onClick={walletConnected ? handleWalletDisconnect : handleWalletConnect}
            style={{
              background: walletConnected ? '#ef4444' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
          </button>
        </div>

        {walletConnected && (
          <>
            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '10px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2>Escrow Operations</h2>
              <p>Simulate escrow lifecycle with comprehensive logging</p>
              <button
                onClick={handleCreateEscrow}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  margin: '5px'
                }}
              >
                Create Escrow
              </button>
              <button
                onClick={handleDepositFunds}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  margin: '5px'
                }}
              >
                Deposit Funds
              </button>
              <button
                onClick={handleRaiseDispute}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  margin: '5px'
                }}
              >
                Raise Dispute
              </button>
            </div>

            <div style={{
              background: 'white',
              padding: '25px',
              borderRadius: '10px',
              marginBottom: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <h2>Error Simulation</h2>
              <p>Test error logging and handling</p>
              <button
                onClick={handleTransactionError}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  margin: '5px'
                }}
              >
                Transaction Error
              </button>
              <button
                onClick={handleUIError}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  margin: '5px'
                }}
              >
                UI Error
              </button>
            </div>
          </>
        )}

        <div style={{
          background: '#1f2937',
          color: '#e5e7eb',
          padding: '20px',
          borderRadius: '10px',
          fontSize: '12px'
        }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>Console Instructions</h3>
          <p>1. Open browser developer tools (F12)</p>
          <p>2. Navigate to Console tab</p>
          <p>3. Click buttons above to see structured logs</p>
          <p>4. All logs include timestamps, categories, and detailed context</p>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;