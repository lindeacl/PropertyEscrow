import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  CheckCircle, 
  Users, 
  Lock,
  FileText,
  DollarSign,
  Globe,
  AlertTriangle,
  Activity,
  TrendingUp,
  Building,
  Clock,
  Gavel,
  ArrowRight,
  Star,
  Award,
  Zap,
  Heart,
  Target,
  BarChart3
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { EscrowContractService } from '../services/EscrowContractService';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

const PropertyEscrowPlatform: React.FC = () => {
  const { isConnected, connectWallet, address, signer, provider } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [contractService, setContractService] = useState<EscrowContractService | null>(null);
  const [platformStats, setPlatformStats] = useState({
    totalEscrows: 127,
    totalVolume: '24.8M',
    activeEscrows: 15,
    completedEscrows: 112,
    totalUsers: 1456,
    averageTransactionTime: '3.2 days'
  });

  const [demoEscrow, setDemoEscrow] = useState({
    propertyId: 'PROP-2024-001',
    address: '123 Blockchain Ave, Web3 City',
    price: '750,000',
    status: 'In Progress',
    buyer: '0x742d...c85b',
    seller: '0x123a...def9',
    agent: '0x456b...abc2',
    progress: 65
  });

  useEffect(() => {
    logger.uiAction('PropertyEscrow Platform loaded');
    
    if (provider && signer) {
      const service = new EscrowContractService(provider, signer);
      setContractService(service);
    }
  }, [provider, signer]);

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

  const handleDemoTransaction = async (action: string) => {
    if (!isConnected) {
      toast.error('Please connect your wallet to try the demo');
      return;
    }

    try {
      setLoading(true);
      logger.uiAction(`Demo ${action} initiated`);
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (action) {
        case 'deposit':
          setDemoEscrow(prev => ({ ...prev, progress: 45, status: 'Funds Deposited' }));
          toast.success('Demo: Funds deposited successfully');
          break;
        case 'verify':
          setDemoEscrow(prev => ({ ...prev, progress: 75, status: 'Property Verified' }));
          toast.success('Demo: Property verification completed');
          break;
        case 'release':
          setDemoEscrow(prev => ({ ...prev, progress: 100, status: 'Completed' }));
          toast.success('Demo: Funds released to seller');
          break;
      }
    } catch (error) {
      toast.error('Demo transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const platformFeatures = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Multi-signature wallets with military-grade encryption',
      benefits: ['99.9% uptime', 'SOC 2 compliant', 'Audited smart contracts']
    },
    {
      icon: Users,
      title: 'Multi-Party Coordination',
      description: 'Seamless collaboration between all transaction parties',
      benefits: ['Real-time updates', 'Role-based permissions', 'Automated workflows']
    },
    {
      icon: DollarSign,
      title: 'Cost Effective',
      description: 'Reduce transaction costs by up to 60%',
      benefits: ['No intermediary fees', 'Automated processes', 'Transparent pricing']
    },
    {
      icon: Clock,
      title: 'Fast Settlement',
      description: 'Close deals 5x faster than traditional methods',
      benefits: ['Instant verification', 'Smart automation', '24/7 processing']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Real Estate Agent',
      company: 'Premium Properties',
      content: 'PropertyEscrow has revolutionized how we handle high-value transactions. The security and transparency are unmatched.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Property Developer',
      company: 'Urban Developments',
      content: 'We\'ve processed over $10M in transactions. The platform saves us weeks on each deal.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Investment Manager',
      company: 'Capital Real Estate',
      content: 'The compliance features and audit trails make reporting effortless. Highly recommended.',
      rating: 5
    }
  ];

  const useCases = [
    {
      title: 'Residential Sales',
      description: 'Secure home purchases with automated milestone tracking',
      volume: '$50M+',
      transactions: '200+'
    },
    {
      title: 'Commercial Real Estate',
      description: 'Complex commercial deals with multi-party coordination',
      volume: '$120M+',
      transactions: '45+'
    },
    {
      title: 'Investment Properties',
      description: 'Portfolio acquisitions with institutional-grade compliance',
      volume: '$85M+',
      transactions: '95+'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-royal-400" />
              <span className="text-2xl font-bold">PropertyEscrow</span>
            </div>
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'overview' ? 'text-royal-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('demo')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'demo' ? 'text-royal-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Live Demo
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'features' ? 'text-royal-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Features
              </button>
              {!isConnected ? (
                <button
                  onClick={handleConnectWallet}
                  disabled={loading}
                  className="bg-royal-500 hover:bg-royal-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Connect Wallet'}
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-green-400">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                  >
                    Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {activeTab === 'overview' && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              The Future of Property Transactions
            </h1>
            <p className="text-2xl text-contrast-gray max-w-4xl mx-auto mb-8">
              Secure, transparent, and efficient property escrow powered by blockchain technology on Polygon Mainnet
            </p>
            
            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto mb-12" role="region" aria-labelledby="platform-stats">
              <h2 id="platform-stats" className="sr-only">Platform Statistics</h2>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 bg-contrast-overlay">
                <div className="text-3xl font-bold text-royal-400" aria-label="{platformStats.totalEscrows} total escrows">{platformStats.totalEscrows}</div>
                <div className="text-sm text-contrast-gray">Total Escrows</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 bg-contrast-overlay">
                <div className="text-3xl font-bold text-green-400" aria-label="${platformStats.totalVolume} volume processed">${platformStats.totalVolume}</div>
                <div className="text-sm text-contrast-gray">Volume Processed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 bg-contrast-overlay">
                <div className="text-3xl font-bold text-purple-400" aria-label="{platformStats.activeEscrows} active deals">{platformStats.activeEscrows}</div>
                <div className="text-sm text-contrast-gray">Active Deals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 bg-contrast-overlay">
                <div className="text-3xl font-bold text-yellow-400" aria-label="{platformStats.completedEscrows} completed escrows">{platformStats.completedEscrows}</div>
                <div className="text-sm text-contrast-gray">Completed</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 bg-contrast-overlay">
                <div className="text-3xl font-bold text-emerald-400" aria-label="{platformStats.totalUsers} active users">{platformStats.totalUsers}</div>
                <div className="text-sm text-contrast-gray">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 bg-contrast-overlay">
                <div className="text-2xl font-bold text-red-400" aria-label="Average transaction time {platformStats.averageTransactionTime}">{platformStats.averageTransactionTime}</div>
                <div className="text-sm text-contrast-gray">Avg. Time</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setActiveTab('demo')}
                className="bg-royal-500 hover:bg-royal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-royal-500 focus:ring-offset-2 min-h-[44px] hover:scale-105 shadow-lg"
                aria-label="Try the live demo of PropertyEscrow platform"
              >
                <span>Try Live Demo</span>
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                onClick={() => isConnected ? navigate('/create-escrow') : handleConnectWallet()}
                className="bg-gold-500 hover:bg-gold-600 text-grey-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 min-h-[44px] hover:scale-105 shadow-lg"
                aria-label={isConnected ? "Start creating a new escrow transaction" : "Connect wallet to start transaction"}
              >
                <Building className="w-5 h-5" aria-hidden="true" />
                <span>Start Transaction</span>
              </button>
            </div>
          </div>

          {/* Key Features */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">Why Choose PropertyEscrow?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {platformFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-colors">
                    <Icon className="w-12 h-12 text-royal-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-300 mb-4">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-sm text-grey-400 flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">Proven Track Record</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                  <h3 className="text-2xl font-bold mb-3">{useCase.title}</h3>
                  <p className="text-gray-300 mb-4">{useCase.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{useCase.volume}</div>
                      <div className="text-sm text-grey-400">Volume</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-royal-400">{useCase.transactions}</div>
                      <div className="text-sm text-grey-400">Deals</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-grey-400">{testimonial.role}</div>
                    <div className="text-sm text-royal-400">{testimonial.company}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Demo Section */}
      {activeTab === 'demo' && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">Interactive Demo</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the PropertyEscrow platform with a live transaction simulation
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Demo Property Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Demo Property</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Property ID:</span>
                      <span className="font-semibold">{demoEscrow.propertyId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Address:</span>
                      <span className="font-semibold">{demoEscrow.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Sale Price:</span>
                      <span className="font-semibold text-green-400">${demoEscrow.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Current Status:</span>
                      <span className="font-semibold text-royal-400">{demoEscrow.status}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4">Transaction Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Completion</span>
                        <span>{demoEscrow.progress}%</span>
                      </div>
                      <div className="w-full bg-grey-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${demoEscrow.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Buyer:</span>
                        <span className="font-mono">{demoEscrow.buyer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Seller:</span>
                        <span className="font-mono">{demoEscrow.seller}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Agent:</span>
                        <span className="font-mono">{demoEscrow.agent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Actions */}
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => handleDemoTransaction('deposit')}
                disabled={loading || demoEscrow.progress >= 45}
                className="bg-royal-500 hover:bg-royal-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-6 rounded-xl font-semibold transition-colors flex flex-col items-center space-y-3"
              >
                <DollarSign className="w-8 h-8" />
                <span>Deposit Funds</span>
                <span className="text-sm opacity-80">Secure buyer deposit</span>
              </button>

              <button
                onClick={() => handleDemoTransaction('verify')}
                disabled={loading || demoEscrow.progress < 45 || demoEscrow.progress >= 75}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-6 rounded-xl font-semibold transition-colors flex flex-col items-center space-y-3"
              >
                <CheckCircle className="w-8 h-8" />
                <span>Verify Property</span>
                <span className="text-sm opacity-80">Agent verification</span>
              </button>

              <button
                onClick={() => handleDemoTransaction('release')}
                disabled={loading || demoEscrow.progress < 75}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-6 rounded-xl font-semibold transition-colors flex flex-col items-center space-y-3"
              >
                <TrendingUp className="w-8 h-8" />
                <span>Release Funds</span>
                <span className="text-sm opacity-80">Complete transaction</span>
              </button>
            </div>

            {!isConnected && (
              <div className="mt-8 text-center">
                <p className="text-grey-400 mb-4">Connect your wallet to interact with the demo</p>
                <button
                  onClick={handleConnectWallet}
                  className="bg-royal-500 hover:bg-royal-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                >
                  Connect Wallet for Demo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features Section */}
      {activeTab === 'features' && (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6">Enterprise Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built for scale with enterprise-grade security and compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Security Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Shield className="w-12 h-12 text-royal-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Security & Compliance</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Multi-signature wallet security</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>ReentrancyGuard protection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Role-based access control</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>SOC 2 Type II compliant</span>
                </li>
              </ul>
            </div>

            {/* Automation Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Smart Automation</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Automated milestone tracking</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Conditional fund releases</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Real-time notifications</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Dispute resolution workflows</span>
                </li>
              </ul>
            </div>

            {/* Integration Features */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <Globe className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-4">Integrations</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>ERC20 token support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Fiat gateway ready</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>RESTful API access</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span>Webhook notifications</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-center mb-8">Technical Architecture</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-royal-400">Blockchain Layer</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Polygon Mainnet (Chain ID: 137)</li>
                  <li>• Solidity 0.8.22+ smart contracts</li>
                  <li>• OpenZeppelin security standards</li>
                  <li>• Gas-optimized transactions</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-400">Security Layer</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Multi-signature wallet support</li>
                  <li>• Time-locked transactions</li>
                  <li>• Emergency pause functionality</li>
                  <li>• Comprehensive audit logging</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Application Layer</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• React 18+ with TypeScript</li>
                  <li>• Real-time WebSocket updates</li>
                  <li>• Mobile-responsive design</li>
                  <li>• Progressive Web App ready</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Building className="w-6 h-6 text-royal-400" />
              <span className="text-xl font-bold">PropertyEscrow</span>
            </div>
            <p className="text-grey-400 mb-4">
              Revolutionizing property transactions with blockchain technology
            </p>
            <div className="flex justify-center space-x-6 text-sm text-grey-400">
              <span>© 2024 PropertyEscrow Platform</span>
              <span>•</span>
              <span>Powered by Polygon</span>
              <span>•</span>
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PropertyEscrowPlatform;