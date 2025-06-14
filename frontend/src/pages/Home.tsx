import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  Users, 
  DollarSign,
  Globe,
  TrendingUp,
  Building,
  ArrowRight,
  Star,
  Zap,
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useToastHelpers } from '../components/ui/ToastManager';
import logger from '../utils/logger';

const Home: React.FC = () => {
  const { isConnected, connectWallet, address } = useWallet();
  const navigate = useNavigate();
  const { success, error } = useToastHelpers();
  const [loading, setLoading] = useState(false);

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      logger.walletConnectAttempt('MetaMask');
      await connectWallet();
      success('Wallet connected successfully');
      logger.walletConnected(address || 'unknown', 'Polygon Mainnet');
    } catch (err) {
      logger.error('Wallet connection failed', err as Error);
      error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const platformStats = {
    totalEscrows: 127,
    totalVolume: '24.8M',
    activeEscrows: 15,
    successRate: 99.2
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-gold-400 mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gold-200 bg-clip-text text-transparent">
              Property Escrow Platform
            </h1>
          </div>
          
          <p className="text-xl text-grey-300 max-w-3xl mx-auto mb-8">
            Secure blockchain-powered property transactions with smart contract escrow management on Polygon network
          </p>

          {!isConnected ? (
            <button
              onClick={handleConnectWallet}
              disabled={loading}
              className="bg-royal-500 hover:bg-royal-600 disabled:bg-grey-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center mx-auto"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              ) : (
                <Zap className="w-6 h-6 mr-3" />
              )}
              Connect Wallet to Get Started
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400 mr-2" />
                  <span className="text-green-300">Wallet Connected</span>
                </div>
                <p className="text-sm text-green-200 mt-1">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-royal-500 hover:bg-royal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center mx-auto"
              >
                Go to Dashboard
                <ArrowRight className="w-6 h-6 ml-3" />
              </button>
            </div>
          )}
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Building className="w-8 h-8 text-royal-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{platformStats.totalEscrows}</div>
            <div className="text-grey-300">Total Escrows</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <DollarSign className="w-8 h-8 text-gold-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">${platformStats.totalVolume}</div>
            <div className="text-grey-300">Total Volume</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{platformStats.activeEscrows}</div>
            <div className="text-grey-300">Active Escrows</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{platformStats.successRate}%</div>
            <div className="text-grey-300">Success Rate</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <Shield className="w-12 h-12 text-royal-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Secure Escrow</h3>
            <p className="text-grey-300">
              Smart contract-based escrow with multi-signature security and automated fund release
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <Users className="w-12 h-12 text-gold-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Multi-Role Support</h3>
            <p className="text-grey-300">
              Support for buyers, sellers, agents, and arbiters with role-based access control
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <Globe className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Polygon Network</h3>
            <p className="text-grey-300">
              Fast, low-cost transactions on Polygon mainnet with USDC, USDT, and DAI support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;