export const NETWORK_CONFIG = {
  polygon: {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [process.env.REACT_APP_ALCHEMY_RPC_URL || 'https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  polygonMumbai: {
    chainId: 80001,
    chainName: 'Polygon Mumbai Testnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-mumbai.g.alchemy.com/v2/demo'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
  },
};

export const DEFAULT_NETWORK = 'polygon';