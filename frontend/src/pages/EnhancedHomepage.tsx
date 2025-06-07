import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Lock,
  FileText,
  DollarSign,
  Globe,
  Zap,
  AlertTriangle,
  Activity,
  TrendingUp,
  Building,
  Clock,
  Gavel
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { EscrowContractService } from '../services/EscrowContractService';
import { EscrowStatus } from '../types';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

const EnhancedHomepage: React.FC = () => {
  const { isConnected, connectWallet, address, signer, provider } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [contractService, setContractService] = useState<EscrowContractService | null>(null);
  const [platformStats, setPlatformStats] = useState({
    totalEscrows: 0,
    totalVolume: '0',
    activeEscrows: 0,
    completedEscrows: 0
  });

  useEffect(() => {
    logger.uiAction('Enhanced homepage mounted');
    
    if (provider && signer) {
      const service = new EscrowContractService(provider, signer);
      setContractService(service);
      loadPlatformStats(service);
    }
  }, [provider, signer]);

  const loadPlatformStats = async (service: EscrowContractService) => {
    try {
      // This would normally fetch real data from the smart contracts
      setPlatformStats({
        totalEscrows: 45,
        totalVolume: '12.5M',
        activeEscrows: 8,
        completedEscrows: 37
      });
    } catch (error) {
      logger.error('Failed to load platform stats', error as Error);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      logger.walletConnectAttempt('MetaMask');
      await connectWallet();
      toast.success('Wallet connected successfully');
      logger.walletConnected(address || 'unknown', 'Polygon Mainnet');
    } catch (error) {
      logger.error('Wallet connection failed', error as Error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEscrow = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    logger.uiAction('Create escrow navigation');
    navigate('/create-escrow');
  };

  const handleViewDashboard = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    logger.uiAction('Dashboard navigation');
    navigate('/dashboard');
  };

  const coreFeatures = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Multi-signature security with re-entrancy protection and role-based access control',
      details: [
        'ReentrancyGuard implementation',
        'Role-based permissions (Buyer, Seller, Agent, Arbiter)',
        'Secure fund management with SafeERC20',
        'Pausable contracts for emergency stops'
      ]
    },
    {
      icon: FileText,
      title: 'Complete Escrow Lifecycle',
      description: 'Full property sale flow from creation to settlement',
      details: [
        'Escrow creation with property terms',
        'Secure fund deposits with deadlines',
        'Agent verification of property conditions',
        'Multi-party approval system',
        'Automated fund release'
      ]
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Granular permissions for all escrow participants',
      details: [
        'Buyer: Deposit funds and approve release',
        'Seller: Receive funds and approve terms',
        'Agent: Verify property conditions',
        'Arbiter: Resolve disputes fairly'
      ]
    },
    {
      icon: Gavel,
      title: 'Dispute Resolution',
      description: 'Built-in dispute handling with trusted arbitration',
      details: [
        'Dispute initiation by any party',
        'Arbiter-mediated resolution process',
        'Fair fund distribution based on ruling',
        'Transparent resolution tracking'
      ]
    },
    {
      icon: Activity,
      title: 'Full Auditability',
      description: 'Complete transparency with on-chain event logging',
      details: [
        'All state changes recorded on-chain',
        'Detailed event emissions for tracking',
        'Transaction history preservation',
        'Compliance-ready audit trails'
      ]
    },
    {
      icon: Globe,
      title: 'Extensible Payments',
      description: 'ERC20 support with future fiat gateway integration',
      details: [
        'Native ERC20 token support',
        'Token whitelisting for security',
        'Payment adapter interface',
        'Future fiat on/off-ramp support'
      ]
    }
  ];

  const escrowStates = [
    { state: 'Created', description: 'Property listed, terms set', icon: FileText, color: 'blue' },
    { state: 'Deposited', description: 'Buyer funds secured in escrow', icon: DollarSign, color: 'yellow' },
    { state: 'Verified', description: 'Property conditions confirmed', icon: CheckCircle, color: 'green' },
    { state: 'Released', description: 'Funds transferred to seller', icon: TrendingUp, color: 'emerald' },
    { state: 'Disputed', description: 'Issue raised, arbiter reviewing', icon: AlertTriangle, color: 'red' },
    { state: 'Refunded', description: 'Funds returned to buyer', icon: Clock, color: 'gray' }
  ];

  const complianceFeatures = [
    {
      title: 'KYC/AML Integration',
      description: 'Built-in compliance hooks for regulatory requirements',
      icon: Shield
    },
    {
      title: 'Transaction Monitoring',
      description: 'Real-time monitoring of all escrow activities',
      icon: Activity
    },
    {
      title: 'Audit Trail',
      description: 'Complete immutable record of all transactions',
      icon: FileText
    },
    {
      title: 'Risk Assessment',
      description: 'Automated risk scoring for transactions',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            PropertyEscrow Platform
          </h1>
          <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
            Enterprise-grade blockchain escrow platform for secure property transactions on Polygon Mainnet
          </p>
          
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-blue-400">{platformStats.totalEscrows}</div>
              <div className="text-sm text-gray-300">Total Escrows</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-green-400">${platformStats.totalVolume}</div>
              <div className="text-sm text-gray-300">Total Volume</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-yellow-400">{platformStats.activeEscrows}</div>
              <div className="text-sm text-gray-300">Active Escrows</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-3xl font-bold text-purple-400">{platformStats.completedEscrows}</div>
              <div className="text-sm text-gray-300">Completed</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isConnected ? (
              <button
                onClick={handleConnectWallet}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCreateEscrow}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
                >
                  <Building className="w-5 h-5" />
                  <span>Create Escrow</span>
                </button>
                <button
                  onClick={handleViewDashboard}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center space-x-2"
                >
                  <Activity className="w-5 h-5" />
                  <span>View Dashboard</span>
                </button>
              </div>
            )}
          </div>

          {isConnected && (
            <div className="mt-6 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg inline-flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Connected to {address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
          )}
        </div>

        {/* Core Features */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Enterprise Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className="w-8 h-8 text-blue-400" />
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-gray-300 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-400 flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Escrow Lifecycle */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Escrow Lifecycle</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {escrowStates.map((state, index) => {
              const Icon = state.icon;
              const colorClasses = {
                blue: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
                yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
                green: 'bg-green-500/20 text-green-300 border-green-500/40',
                emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                red: 'bg-red-500/20 text-red-300 border-red-500/40',
                gray: 'bg-gray-500/20 text-gray-300 border-gray-500/40'
              }[state.color];

              return (
                <div key={index} className={`${colorClasses} rounded-lg p-4 border text-center`}>
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold text-sm mb-1">{state.state}</div>
                  <div className="text-xs opacity-80">{state.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compliance & Security */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">Compliance & Security</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
                  <Icon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-8">Technical Specifications</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-blue-400">Blockchain</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Polygon Mainnet (Chain ID: 137)</li>
                <li>• EVM-compatible smart contracts</li>
                <li>• Solidity 0.8.22+</li>
                <li>• OpenZeppelin security standards</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-400">Security</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• ReentrancyGuard protection</li>
                <li>• Role-based access control</li>
                <li>• SafeERC20 token handling</li>
                <li>• Emergency pause functionality</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Integration</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• ERC20 token support</li>
                <li>• Payment adapter interface</li>
                <li>• Event-driven architecture</li>
                <li>• Compliance manager hooks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHomepage;