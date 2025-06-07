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
  const connectionManager = ConnectionManager.getInstance();
  const state = connectionManager.getState();
  
  if (state.isConnected && state.provider) {
    ConnectionDebugger.log('Using existing connection manager state');
    return {
      provider: state.provider,
      isConnected: true,
      chainId: state.chainId
    };
  }

  ConnectionDebugger.log('Initializing connection through manager');

  try {
    const success = await connectionManager.initialize();
    
    if (success) {
      const newState = connectionManager.getState();
      const connection: BlockchainConnection = {
        provider: newState.provider!,
        isConnected: true,
        chainId: newState.chainId
      };
      
      cachedConnection = connection;
      ConnectionDebugger.log('Connection manager initialization successful');
      return connection;
    } else {
      throw new Error('Connection manager initialization failed');
    }
  } catch (error) {
    ConnectionDebugger.error('Connection manager failed', error);
    
    // Fallback to direct provider method
    try {
      ConnectionDebugger.log('Attempting fallback provider connection');
      const provider = await getProvider();
      
      if (provider) {
        const network = await provider.getNetwork();
        const connection: BlockchainConnection = {
          provider,
          isConnected: true,
          chainId: Number(network.chainId)
        };
        
        cachedConnection = connection;
        return connection;
      }
    } catch (fallbackError) {
      ConnectionDebugger.error('Fallback provider also failed', fallbackError);
    }
    
    // Return safe offline state
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