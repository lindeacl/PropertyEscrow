import { ethers } from 'ethers';
import { RobustProvider } from './robustProvider';

let cachedProvider: ethers.Provider | null = null;
let connectionMode: 'metamask' | 'alchemy' | 'offline' = 'offline';

export const getProvider = async () => {
  if (cachedProvider && connectionMode !== 'offline') {
    return cachedProvider;
  }

  console.log('Initializing Alchemy provider connection...');
  
  try {
    const provider = await RobustProvider.getProvider();
    
    if (provider) {
      cachedProvider = provider;
      
      // Detect connection type based on provider
      if (provider instanceof ethers.BrowserProvider) {
        connectionMode = 'metamask';
        console.log('Connected via MetaMask wallet');
      } else {
        connectionMode = 'alchemy';
        console.log('Connected to Alchemy blockchain network');
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

export const connectToAlchemyNetwork = async () => {
  try {
    const alchemyApiKey = process.env.REACT_APP_ALCHEMY_RPC_URL;
    if (!alchemyApiKey || alchemyApiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('Alchemy API key not configured. Please set REACT_APP_ALCHEMY_RPC_URL');
    }

    const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;
    const provider = new ethers.JsonRpcProvider(alchemyUrl, undefined, {
      staticNetwork: true
    });
    
    // Test connection with proper error handling
    const blockNumber = await Promise.race([
      provider.getBlockNumber(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    if (typeof blockNumber === 'number') {
      cachedProvider = provider;
      connectionMode = 'alchemy';
      console.log('Alchemy network connected, block:', blockNumber);
      return provider;
    } else {
      throw new Error('Invalid response from blockchain');
    }
  } catch (error) {
    console.warn('Alchemy network unavailable:', error);
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