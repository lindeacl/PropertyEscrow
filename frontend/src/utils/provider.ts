import { ethers } from 'ethers';

let cachedProvider: ethers.Provider | null = null;
let connectionMode: 'metamask' | 'alchemy' | 'offline' = 'offline';

export const getProvider = async () => {
  if (cachedProvider && connectionMode !== 'offline') {
    return cachedProvider;
  }

  console.log('Initializing provider connection...');
  
  try {
    // Try wallet first
    const walletProvider = await getWalletProvider();
    if (walletProvider) {
      cachedProvider = walletProvider;
      connectionMode = 'metamask';
      console.log('Connected via MetaMask wallet');
      return cachedProvider;
    }
    
    // Fallback to Alchemy
    const alchemyProvider = await connectToAlchemyNetwork();
    if (alchemyProvider) {
      return alchemyProvider;
    }
    
    throw new Error('All provider connection strategies failed');
  } catch (error) {
    console.error('Provider initialization failed:', error);
    connectionMode = 'offline';
    cachedProvider = null;
    return null;
  }
};

export const connectToAlchemyNetwork = async () => {
  try {
    const alchemyUrl = process.env.REACT_APP_ALCHEMY_RPC_URL;
    if (!alchemyUrl || !alchemyUrl.startsWith('https://polygon-mainnet.g.alchemy.com/v2/')) {
      throw new Error('Alchemy RPC URL not configured. Please set REACT_APP_ALCHEMY_RPC_URL');
    }

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