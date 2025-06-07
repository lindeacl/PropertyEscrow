import { ethers } from 'ethers';
import { RobustProvider } from './robustProvider';

let cachedProvider: ethers.Provider | null = null;
let connectionMode: 'metamask' | 'local' | 'offline' = 'offline';

export const getProvider = async () => {
  if (cachedProvider && connectionMode !== 'offline') {
    return cachedProvider;
  }

  console.log('Initializing robust provider connection...');
  
  try {
    const provider = await RobustProvider.getProvider();
    
    if (provider) {
      cachedProvider = provider;
      
      // Detect connection type based on provider
      if (provider instanceof ethers.BrowserProvider) {
        connectionMode = 'metamask';
        console.log('Connected via MetaMask wallet');
      } else {
        connectionMode = 'local';
        console.log('Connected to local blockchain network');
      }
      
      return cachedProvider;
    } else {
      throw new Error('All provider connection strategies failed');
    }
  } catch (error) {
    console.error('Provider initialization failed:', error);
    connectionMode = 'offline';
    cachedProvider = null;
    return null;
  }
};

export const connectToLocalNetwork = async () => {
  try {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8546/rpc', undefined, {
      staticNetwork: true
    });
    
    // Test connection with proper error handling
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      )
    ]);
    
    if (typeof blockNumber === 'number') {
      cachedProvider = provider;
      connectionMode = 'local';
      console.log('Local network connected, block:', blockNumber);
      return provider;
    } else {
      throw new Error('Invalid response from blockchain');
    }
  } catch (error) {
    console.warn('Local network unavailable:', error);
    connectionMode = 'offline';
    cachedProvider = null;
    throw error;
  }
};

export const getWalletProvider = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Test the connection
      await provider.send('eth_requestAccounts', []);
      return provider;
    } catch (error) {
      console.warn('Wallet connection failed:', error);
      return null;
    }
  }
  return null;
};

export const getConnectionStatus = () => {
  return {
    mode: connectionMode,
    isConnected: cachedProvider !== null && connectionMode !== 'offline',
    provider: cachedProvider
  };
};

export const resetProvider = () => {
  cachedProvider = null;
  connectionMode = 'offline';
};