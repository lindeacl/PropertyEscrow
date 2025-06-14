import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Plus, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  DollarSign,
  Activity,
  Search,
  Shield,
  Zap,
  Users,
  Globe,
  TrendingUp,
  Star
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { EscrowContractService } from '../services/EscrowContractService';
import { EscrowStatus } from '../types';
import logger from '../utils/logger';
import { useToastHelpers } from '../components/ui/ToastManager';

interface EscrowSummary {
  id: string;
  propertyId: string;
  address: string;
  salePrice: string;
  status: EscrowStatus;
  buyer: string;
  seller: string;
  agent: string;
  createdAt: Date;
  progress: number;
  nextAction: string;
}

const Dashboard: React.FC = () => {
  const { isConnected, address, signer, provider, connectWallet } = useWallet();
  const navigate = useNavigate();
  const { success, error, warning } = useToastHelpers();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dashboardStats, setDashboardStats] = useState({
    totalEscrows: 8,
    activeDeals: 3,
    completedDeals: 5,
    totalValue: '2.4M',
    pendingActions: 2,
    averageTime: '4.2 days'
  });

  const [escrows, setEscrows] = useState<EscrowSummary[]>([]);


  useEffect(() => {
    logger.uiAction('Dashboard loaded');
    if (!isConnected) {
      error('Please connect your wallet to access dashboard');
      navigate('/');
      return;
    }

    // Initialize contract service and load escrow data
    if (signer && provider) {
      const service = new EscrowContractService(provider, signer);
      loadEscrowData(service);
    }

    // Determine user role based on connected address
    if (address) {
      determineUserRole(address);
    }
  }, [isConnected, navigate, signer, provider, address]);

  const loadEscrowData = async (service: EscrowContractService) => {
    try {
      // Load escrows from blockchain - this would be actual contract calls in production
      // For now, using representative data structure
      const escrowData: EscrowSummary[] = [];
      setEscrows(escrowData);
      
      // Update dashboard stats based on loaded data
      setDashboardStats({
        totalEscrows: escrowData.length,
        activeDeals: escrowData.filter(e => [EscrowStatus.CREATED, EscrowStatus.DEPOSITED, EscrowStatus.VERIFIED].includes(e.status)).length,
        completedDeals: escrowData.filter(e => e.status === EscrowStatus.RELEASED).length,
        totalValue: '0',
        pendingActions: escrowData.filter(e => e.nextAction !== 'Transaction completed').length,
        averageTime: '0 days'
      });
    } catch (err) {
      console.error('Failed to load escrow data:', err);
      logger.error('Failed to load escrow data', err as Error);
      error('Failed to load escrow data');
    }
  };

  const determineUserRole = (walletAddress: string) => {
    // In production, this would check the blockchain for user roles
    // For now, logging user role determination
    logger.uiAction('Determining user role for address: ' + walletAddress);
  };

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.CREATED:
        return 'text-royal-400 bg-blue-500/20 border-royal-500/40';
      case EscrowStatus.DEPOSITED:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case EscrowStatus.VERIFIED:
        return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
      case EscrowStatus.RELEASED:
        return 'text-green-400 bg-green-500/20 border-green-500/40';
      case EscrowStatus.DISPUTED:
        return 'text-red-400 bg-red-500/20 border-red-500/40';
      case EscrowStatus.REFUNDED:
        return 'text-grey-400 bg-gray-500/20 border-gray-500/40';
      default:
        return 'text-grey-400 bg-gray-500/20 border-gray-500/40';
    }
  };

  const getStatusText = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.CREATED:
        return 'Created';
      case EscrowStatus.DEPOSITED:
        return 'Deposited';
      case EscrowStatus.VERIFIED:
        return 'Verified';
      case EscrowStatus.RELEASED:
        return 'Completed';
      case EscrowStatus.DISPUTED:
        return 'Disputed';
      case EscrowStatus.REFUNDED:
        return 'Refunded';
      default:
        return 'Unknown';
    }
  };

  const filteredEscrows = escrows.filter(escrow => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && [EscrowStatus.CREATED, EscrowStatus.DEPOSITED, EscrowStatus.VERIFIED].includes(escrow.status)) ||
      (filter === 'completed' && escrow.status === EscrowStatus.RELEASED) ||
      (filter === 'disputed' && escrow.status === EscrowStatus.DISPUTED);
    
    const matchesSearch = searchTerm === '' || 
      escrow.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escrow.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleCreateEscrow = () => {
    logger.uiAction('Navigate to create escrow from dashboard');
    navigate('/create-escrow');
  };

  const handleViewEscrow = (escrowId: string) => {
    logger.uiAction('View escrow details', { escrowId });
    navigate(`/escrow/${escrowId}`);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-royal-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-300 mb-6">Please connect your wallet to access the dashboard</p>
          <button
            onClick={connectWallet}
            className="bg-royal-500 hover:bg-royal-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-300">Manage your property escrow transactions</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={handleCreateEscrow}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Escrow</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-royal-400" />
              <div>
                <div className="text-2xl font-bold">{dashboardStats.totalEscrows}</div>
                <div className="text-sm text-gray-300">Total Escrows</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">{dashboardStats.activeDeals}</div>
                <div className="text-sm text-gray-300">Active Deals</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold">{dashboardStats.completedDeals}</div>
                <div className="text-sm text-gray-300">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold">${dashboardStats.totalValue}</div>
                <div className="text-sm text-gray-300">Total Value</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold">{dashboardStats.pendingActions}</div>
                <div className="text-sm text-gray-300">Pending Actions</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-xl font-bold">{dashboardStats.averageTime}</div>
                <div className="text-sm text-gray-300">Avg. Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-royal-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === 'active' 
                  ? 'bg-royal-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-royal-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('disputed')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                filter === 'disputed' 
                  ? 'bg-royal-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Disputed
            </button>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-grey-400" />
              <input
                type="text"
                placeholder="Search by Property ID or Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Escrow List */}
        <div className="space-y-4">
          {filteredEscrows.map((escrow) => (
            <div
              key={escrow.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-white/40 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold">{escrow.propertyId}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(escrow.status)}`}>
                      {getStatusText(escrow.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-2">{escrow.address}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-grey-400">Sale Price:</span>
                      <div className="font-semibold text-green-400">${escrow.salePrice}</div>
                    </div>
                    <div>
                      <span className="text-grey-400">Created:</span>
                      <div className="font-semibold">{escrow.createdAt.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-grey-400">Progress:</span>
                      <div className="font-semibold">{escrow.progress}%</div>
                    </div>
                    <div>
                      <span className="text-grey-400">Next Action:</span>
                      <div className="font-semibold text-royal-400">{escrow.nextAction}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-32">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{escrow.progress}%</span>
                    </div>
                    <div className="w-full bg-grey-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${escrow.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewEscrow(escrow.id)}
                    className="bg-royal-500 hover:bg-royal-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEscrows.length === 0 && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-grey-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No escrows found</h3>
            <p className="text-grey-400 mb-6">
              {searchTerm 
                ? `No escrows match "${searchTerm}"`
                : filter === 'all' 
                  ? 'Create your first escrow to get started'
                  : `No ${filter} escrows found`
              }
            </p>
            {filter === 'all' && !searchTerm && (
              <button
                onClick={handleCreateEscrow}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Escrow</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;