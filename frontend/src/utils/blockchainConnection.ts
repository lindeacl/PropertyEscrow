import { ethers } from 'ethers';
import { getProvider } from './provider';
import { ConnectionDebugger } from './debugConnection';
import ConnectionManager from './connectionManager';

export interface BlockchainConnection {
  provider: ethers.Provider;
  isConnected: boolean;
  chainId: number;
}

let cachedConnection: BlockchainConnection | null = null;

export const initializeBlockchainConnection = async (): Promise<BlockchainConnection> => {
  if (cachedConnection?.isConnected) {
    ConnectionDebugger.log('Using cached connection');
    return cachedConnection;
  }

  ConnectionDebugger.log('Initializing new blockchain connection');

  try {
    // Run diagnostic first to identify issues
    const diagnostic = await ConnectionDebugger.runFullDiagnostic();
    
    if (!diagnostic.proxy.success) {
      throw new Error(`Proxy connection failed: ${diagnostic.proxy.error}`);
    }
    
    if (!diagnostic.jsonRpc.success) {
      throw new Error(`JSON-RPC connection failed: ${diagnostic.jsonRpc.error}`);
    }
    
    if (!diagnostic.ethers.success) {
      throw new Error(`Ethers provider failed: ${diagnostic.ethers.error}`);
    }

    // If all diagnostics pass, get the provider
    const provider = await getProvider();
    
    if (!provider) {
      throw new Error('No provider available after successful diagnostics');
    }
    
    ConnectionDebugger.log('Provider obtained successfully');

    // Test with a simple call
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      )
    ]);

    ConnectionDebugger.log(`Block number retrieved: ${blockNumber}`);

    // Get network info
    const network = await provider.getNetwork();
    ConnectionDebugger.log('Network info retrieved', { chainId: network.chainId.toString() });

    const connection: BlockchainConnection = {
      provider,
      isConnected: true,
      chainId: Number(network.chainId)
    };

    cachedConnection = connection;
    ConnectionDebugger.log('Connection initialized successfully');
    return connection;
  } catch (error) {
    ConnectionDebugger.error('Blockchain connection failed', error);
    
    // Log the diagnostic results for debugging
    console.error('Connection diagnostic logs:', ConnectionDebugger.getLogs());
    
    // Return fallback without attempting provider calls
    const fallbackConnection: BlockchainConnection = {
      provider: null as any,
      isConnected: false,
      chainId: 31337
    };

    cachedConnection = fallbackConnection;
    return fallbackConnection;
  }
};

export const getBlockchainConnection = (): BlockchainConnection | null => {
  return cachedConnection;
};

export const resetConnection = (): void => {
  cachedConnection = null;
};