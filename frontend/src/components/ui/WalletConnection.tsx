import React from 'react';
import { Wallet, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';

interface WalletConnectionProps {
  account?: string | null;
  isConnected?: boolean;
  isConnecting?: boolean;
  balance?: string;
  chainId?: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onSwitchNetwork?: () => void;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  account = null,
  isConnected = false,
  isConnecting = false,
  balance = '0',
  chainId = null,
  onConnect = () => {},
  onDisconnect = () => {},
  onSwitchNetwork = () => {}
}) => {
  const isPolygon = chainId === '0x89';
  const isWrongNetwork = isConnected && !isPolygon;

  if (!window.ethereum) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gold-50 border border-gold-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-gold-600" />
        <div>
          <p className="text-sm font-medium text-gold-800">MetaMask Not Detected</p>
          <a 
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-1 px-3 py-1 bg-gold-500 text-grey-900 text-xs rounded-lg hover:bg-gold-600 transition-colors"
            aria-label="Install MetaMask browser extension"
          >
            Install MetaMask
          </a>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <button 
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-grey-400 text-white rounded-xl cursor-not-allowed"
        aria-label="Connecting to wallet"
      >
        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
        Connecting...
      </button>
    );
  }

  if (!isConnected) {
    return (
      <button 
        onClick={onConnect}
        className="flex items-center gap-2 px-6 py-3 bg-royal-500 text-white rounded-xl hover:bg-royal-600 hover:scale-105 transition-all duration-200 font-semibold shadow-lg"
        aria-label="Connect wallet to access escrow platform"
      >
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    );
  }

  if (isWrongNetwork) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
        <WifiOff className="w-5 h-5 text-red-600" />
        <div>
          <p className="text-sm font-medium text-red-800">Wrong Network</p>
          <button 
            onClick={onSwitchNetwork}
            className="inline-block mt-1 px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
            aria-label="Switch to Polygon network"
          >
            Switch to Polygon
          </button>
        </div>
      </div>
    );
  }

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-800">
          {formatAddress(account!)}
        </p>
        <p className="text-xs text-green-600">
          {balance} MATIC
        </p>
      </div>
      <button 
        onClick={onDisconnect}
        className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        aria-label="Disconnect wallet"
      >
        Disconnect
      </button>
    </div>
  );
};

export default WalletConnection;