import React, { useState, useEffect } from 'react';
import { ConnectionDiagnostic } from '../utils/connectionDiagnostic';
import { JsonRpcValidator } from '../utils/jsonRpcValidator';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

const ConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [message, setMessage] = useState<string>('Initializing connection test...');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    runConnectionTest();
  }, []);

  const addLog = (log: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${log}`]);
  };

  const runConnectionTest = async () => {
    setStatus('testing');
    setMessage('Running comprehensive connection diagnostic...');
    addLog('Starting connection test');

    try {
      // Test 1: Check proxy server
      addLog('Testing proxy server connectivity');
      const proxyResponse = await fetch('http://127.0.0.1:8546/api/status');
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy server error: ${proxyResponse.status}`);
      }

      const proxyText = await proxyResponse.text();
      addLog(`Proxy response: ${proxyText.substring(0, 100)}...`);

      if (!proxyText.trim()) {
        throw new Error('Proxy returned empty response');
      }

      // Test 2: Validate JSON response
      let proxyData;
      try {
        proxyData = JSON.parse(proxyText);
        addLog('Proxy JSON parsed successfully');
      } catch (parseError) {
        throw new Error(`JSON parse failed: ${parseError}`);
      }

      // Test 3: Test JSON-RPC call
      addLog('Testing JSON-RPC communication');
      const rpcResponse = await JsonRpcValidator.safeJsonRpcCall(
        'http://127.0.0.1:8546/rpc',
        'eth_chainId',
        [],
        5000
      );

      if (!rpcResponse) {
        throw new Error('JSON-RPC call returned null');
      }

      if (rpcResponse.error) {
        throw new Error(`RPC Error: ${JsonRpcValidator.handleJsonRpcError(rpcResponse)}`);
      }

      addLog(`Chain ID: ${rpcResponse.result}`);

      // Test 4: Test block number retrieval
      addLog('Testing block number retrieval');
      const blockResponse = await JsonRpcValidator.safeJsonRpcCall(
        'http://127.0.0.1:8546/rpc',
        'eth_blockNumber',
        [],
        5000
      );

      if (blockResponse && blockResponse.result) {
        const blockNumber = parseInt(blockResponse.result, 16);
        addLog(`Current block: ${blockNumber}`);
      }

      setStatus('success');
      setMessage('All connection tests passed successfully');
      addLog('Connection test completed successfully');

    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Connection test failed: ${errorMessage}`);
      addLog(`Error: ${errorMessage}`);
    }
  };

  const retryTest = () => {
    setLogs([]);
    runConnectionTest();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        {status === 'testing' && <Loader className="w-6 h-6 animate-spin text-blue-500" />}
        {status === 'success' && <CheckCircle className="w-6 h-6 text-green-500" />}
        {status === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
        
        <h2 className="text-xl font-semibold">Blockchain Connection Test</h2>
      </div>

      <div className={`p-4 rounded-md mb-4 ${
        status === 'testing' ? 'bg-blue-50 border border-blue-200' :
        status === 'success' ? 'bg-green-50 border border-green-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <p className="text-sm font-medium">{message}</p>
      </div>

      {status === 'error' && (
        <button
          onClick={retryTest}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry Test
        </button>
      )}

      <div className="bg-gray-50 rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Test Logs:</h3>
        <div className="max-h-40 overflow-y-auto text-xs font-mono space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="text-gray-700">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;