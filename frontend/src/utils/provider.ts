import { ethers } from 'ethers';

let cachedProvider: ethers.Provider | null = null;
let connectionMode: 'metamask' | 'local' | 'offline' = 'offline';

export const getProvider = async () => {
  if (cachedProvider && connectionMode !== 'offline') {
    return cachedProvider;
  }

  // First try local network via CORS-enabled proxy
  try {
    const localProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8546/rpc', undefined, {
      staticNetwork: true
    });
    
    // Test the connection with timeout and proper error handling
    const blockNumber = await Promise.race([
      localProvider.getBlockNumber(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    if (typeof blockNumber === 'number' && blockNumber >= 0) {
      cachedProvider = localProvider;
      connectionMode = 'local';
      console.log('Connected to local blockchain, block:', blockNumber);
      return cachedProvider;
    } else {
      throw new Error('Invalid block number response');
    }
  } catch (error) {
    console.warn('Local network unavailable:', error);
    cachedProvider = null;
  }

  // Try MetaMask if available
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const metamaskProvider = new ethers.BrowserProvider(window.ethereum);
      // Test the connection
      await metamaskProvider.getNetwork();
      cachedProvider = metamaskProvider;
      connectionMode = 'metamask';
      console.log('Connected to MetaMask');
      return cachedProvider;
    } catch (error) {
      console.warn('MetaMask connection failed:', error);
    }
  }

  // Return null instead of broken provider to prevent JSON-RPC errors
  connectionMode = 'offline';
  console.warn('No blockchain connection available');
  return null;
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