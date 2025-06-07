// Comprehensive connection debugging utilities
import { ethers } from 'ethers';

export class ConnectionDebugger {
  private static logs: string[] = [];

  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);
    console.log(logEntry, data || '');
  }

  static error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}`;
    this.logs.push(logEntry);
    console.error(logEntry, error || '');
  }

  static getLogs() {
    return this.logs;
  }

  static clearLogs() {
    this.logs = [];
  }

  static async testProxyConnection() {
    this.log('Starting proxy connection test');
    
    try {
      // Test basic HTTP connectivity
      const response = await fetch('http://127.0.0.1:8546/api/status', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      this.log(`Proxy HTTP response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.log('Proxy status data received', data);
      
      return { success: true, data };
    } catch (error) {
      this.error('Proxy connection failed', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async testJsonRpcConnection() {
    this.log('Starting JSON-RPC connection test');
    
    try {
      // Test direct JSON-RPC call
      const response = await fetch('http://127.0.0.1:8546/rpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });
      
      this.log(`JSON-RPC HTTP response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseText = await response.text();
      this.log('Raw JSON-RPC response:', responseText);
      
      if (!responseText.trim()) {
        throw new Error('Empty response body');
      }
      
      const data = JSON.parse(responseText);
      this.log('Parsed JSON-RPC response', data);
      
      if (data.error) {
        throw new Error(`JSON-RPC error: ${data.error.message || 'Unknown RPC error'}`);
      }
      
      return { success: true, data };
    } catch (error) {
      this.error('JSON-RPC connection failed', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async testEthersProvider() {
    this.log('Starting ethers provider test');
    
    try {
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8546/rpc', undefined, {
        staticNetwork: true
      });
      
      this.log('Created ethers provider');
      
      // Test with timeout
      const blockNumber = await Promise.race([
        provider.getBlockNumber(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Provider timeout')), 5000)
        )
      ]);
      
      this.log(`Provider block number: ${blockNumber}`);
      
      // Test network info
      const network = await provider.getNetwork();
      this.log('Network info', {
        chainId: network.chainId.toString(),
        name: network.name
      });
      
      return { success: true, blockNumber, network };
    } catch (error) {
      this.error('Ethers provider test failed', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async runFullDiagnostic() {
    this.clearLogs();
    this.log('Starting full connection diagnostic');
    
    const results = {
      proxy: await this.testProxyConnection(),
      jsonRpc: await this.testJsonRpcConnection(),
      ethers: await this.testEthersProvider(),
      logs: this.getLogs()
    };
    
    this.log('Full diagnostic completed');
    return results;
  }
}