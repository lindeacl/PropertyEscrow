// Connection diagnostic tool to identify and fix JSON-RPC parsing issues
import { JsonRpcValidator } from './jsonRpcValidator';

export class ConnectionDiagnostic {
  static async runCompleteDiagnostic(): Promise<void> {
    console.log('=== Connection Diagnostic Starting ===');
    
    // Test 1: Basic connectivity to proxy
    console.log('Testing proxy server connectivity...');
    try {
      const proxyResponse = await fetch('http://127.0.0.1:8546/api/status');
      console.log('Proxy status response:', proxyResponse.status, proxyResponse.statusText);
      
      if (proxyResponse.ok) {
        const proxyText = await proxyResponse.text();
        console.log('Proxy response body:', proxyText);
        
        if (proxyText.trim()) {
          try {
            const proxyData = JSON.parse(proxyText);
            console.log('Proxy data parsed successfully:', proxyData);
          } catch (parseError) {
            console.error('Proxy response JSON parse failed:', parseError);
          }
        } else {
          console.warn('Proxy returned empty response');
        }
      }
    } catch (proxyError) {
      console.error('Proxy connectivity failed:', proxyError);
    }

    // Test 2: Direct JSON-RPC call to proxy
    console.log('Testing JSON-RPC call through proxy...');
    const rpcResponse = await JsonRpcValidator.safeJsonRpcCall(
      'http://127.0.0.1:8546/rpc', 
      'eth_chainId', 
      [], 
      5000
    );
    
    if (rpcResponse) {
      console.log('JSON-RPC call successful:', rpcResponse);
    } else {
      console.error('JSON-RPC call failed');
    }

    // Test 3: Direct connection to hardhat node
    console.log('Testing direct connection to Hardhat node...');
    const directResponse = await JsonRpcValidator.safeJsonRpcCall(
      'http://127.0.0.1:8545', 
      'eth_chainId', 
      [], 
      5000
    );
    
    if (directResponse) {
      console.log('Direct Hardhat connection successful:', directResponse);
    } else {
      console.error('Direct Hardhat connection failed');
    }

    // Test 4: Check for CORS issues
    console.log('Testing CORS configuration...');
    try {
      const corsTest = await fetch('http://127.0.0.1:8546/rpc', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('CORS preflight response:', corsTest.status);
    } catch (corsError) {
      console.error('CORS test failed:', corsError);
    }

    console.log('=== Connection Diagnostic Complete ===');
  }

  static async identifyConnectionIssue(): Promise<string> {
    // Quick diagnostic to identify the primary connection issue
    try {
      const proxyCheck = await fetch('http://127.0.0.1:8546/api/status', { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      if (!proxyCheck.ok) {
        return `Proxy server error: ${proxyCheck.status} ${proxyCheck.statusText}`;
      }
      
      const rpcCheck = await JsonRpcValidator.safeJsonRpcCall(
        'http://127.0.0.1:8546/rpc',
        'eth_chainId',
        [],
        3000
      );
      
      if (!rpcCheck) {
        return 'JSON-RPC communication failed - proxy not forwarding requests correctly';
      }
      
      if (rpcCheck.error) {
        return `RPC Error: ${JsonRpcValidator.handleJsonRpcError(rpcCheck)}`;
      }
      
      return 'Connection appears healthy';
    } catch (error) {
      return `Connection diagnostic failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}