import React, { useState, useEffect, useCallback } from 'react';
import { JsonRpcValidator } from '../utils/jsonRpcValidator';
import { initializeBlockchainConnection } from '../utils/blockchainConnection';
import { AlertCircle, CheckCircle, Loader, RefreshCw } from 'lucide-react';

const ConnectionDiagnostic: React.FC = () => {
  const [tests, setTests] = useState<Record<string, 'pending' | 'success' | 'error'>>({
    alchemy: 'pending',
    jsonRpc: 'pending',
    blockchain: 'pending',
    provider: 'pending'
  });
  const [results, setResults] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (test: string, status: 'pending' | 'success' | 'error', message: string) => {
    setTests(prev => ({ ...prev, [test]: status }));
    setResults(prev => ({ ...prev, [test]: message }));
  };

  const runDiagnostic = useCallback(async () => {
    setIsRunning(true);
    
    // Reset all tests
    const initialTests: Record<string, 'pending' | 'success' | 'error'> = { 
      alchemy: 'pending', 
      jsonRpc: 'pending', 
      blockchain: 'pending', 
      provider: 'pending' 
    };
    setTests(initialTests);
    setResults({});

    // Test 1: Alchemy configuration check
    const alchemyUrl = process.env.REACT_APP_ALCHEMY_RPC_URL;
    if (!alchemyUrl || alchemyUrl === 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE') {
      updateTest('alchemy', 'error', 'Alchemy RPC URL not configured. Please set REACT_APP_ALCHEMY_RPC_URL in your environment.');
    } else {
      updateTest('alchemy', 'success', `Alchemy RPC URL configured: ${alchemyUrl.substring(0, 50)}...`);
    }

    // Test 2: JSON-RPC communication with Alchemy
    try {
      const rpcUrl = alchemyUrl || 'https://polygon-rpc.com/';
      const rpcResponse = await JsonRpcValidator.safeJsonRpcCall(
        rpcUrl,
        'eth_chainId',
        [],
        10000
      );

      if (rpcResponse) {
        if (rpcResponse.error) {
          updateTest('jsonRpc', 'error', `RPC Error: ${JsonRpcValidator.handleJsonRpcError(rpcResponse)}`);
        } else {
          const chainId = parseInt(rpcResponse.result, 16);
          updateTest('jsonRpc', 'success', `Chain ID retrieved: ${chainId} (${chainId === 137 ? 'Polygon Mainnet' : 'Unknown Network'})`);
        }
      } else {
        updateTest('jsonRpc', 'error', 'JSON-RPC call returned null - possible network issue');
      }
    } catch (error) {
      updateTest('jsonRpc', 'error', `JSON-RPC failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Blockchain data retrieval
    try {
      const rpcUrl = alchemyUrl || 'https://polygon-rpc.com/';
      const blockResponse = await JsonRpcValidator.safeJsonRpcCall(
        rpcUrl,
        'eth_blockNumber',
        [],
        10000
      );

      if (blockResponse && blockResponse.result) {
        const blockNumber = parseInt(blockResponse.result, 16);
        updateTest('blockchain', 'success', `Current block: ${blockNumber.toLocaleString()}`);
      } else {
        updateTest('blockchain', 'error', 'Failed to retrieve block number');
      }
    } catch (error) {
      updateTest('blockchain', 'error', `Blockchain test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 4: Provider initialization
    try {
      const connection = await initializeBlockchainConnection();
      if (connection.isConnected) {
        updateTest('provider', 'success', `Provider initialized successfully. Chain ID: ${connection.chainId}`);
      } else {
        updateTest('provider', 'error', 'Provider initialization failed - connection not established');
      }
    } catch (error) {
      updateTest('provider', 'error', `Provider error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setIsRunning(false);
  }, []);

  useEffect(() => {
    runDiagnostic();
  }, [runDiagnostic]);

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'pending':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Blockchain Connection Diagnostic</h1>
            <button
              onClick={runDiagnostic}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running...' : 'Run Again'}
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(tests).map(([test, status]) => (
              <div key={test} className={`border rounded-lg p-4 ${getStatusColor(status)}`}>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(status)}
                  <h3 className="font-semibold capitalize">{test} Test</h3>
                </div>
                <p className="text-sm text-gray-700">
                  {results[test] || 'Waiting to run...'}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Summary</h3>
            <p className="text-sm text-gray-600">
              This diagnostic tests the complete blockchain connection pipeline to identify JSON-RPC parsing issues.
              If any test fails, the specific error will help identify the root cause of connection problems.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDiagnostic;