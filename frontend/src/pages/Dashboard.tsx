import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Plus, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  Filter,
  Search
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { EscrowContractService } from '../services/EscrowContractService';
import { EscrowStatus } from '../types';
import logger from '../utils/logger';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(false);
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

  const [escrows, setEscrows] = useState<EscrowSummary[]>([
    {
      id: 'ESC-001',
      propertyId: 'PROP-2024-001',
      address: '123 Blockchain Ave, Web3 City',
      salePrice: '750,000',
      status: EscrowStatus.DEPOSITED,
      buyer: '0x742d35Cc6aB4C24C26d4c85b53B4c85b53B4c85',
      seller: '0x123abc456def789ghi012jkl345mno678pqr901',
      agent: '0x456def789abc123ghi456jkl789mno012pqr345',
      createdAt: new Date('2024-06-01'),
      progress: 60,
      nextAction: 'Await property verification'
    },
    {
      id: 'ESC-002',
      propertyId: 'PROP-2024-002',
      address: '456 Smart Contract St, DeFi District',
      salePrice: '920,000',
      status: EscrowStatus.VERIFIED,
      buyer: '0x789ghi012jkl345mno678pqr901stu234vwx567',
      seller: '0x012jkl345mno678pqr901stu234vwx567yza890',
      agent: '0x345mno678pqr901stu234vwx567yza890bcd123',
      createdAt: new Date('2024-05-28'),
      progress: 85,
      nextAction: 'Ready for approval'
    },
    {
      id: 'ESC-003',
      propertyId: 'PROP-2024-003',
      address: '789 Ethereum Blvd, Polygon Plaza',
      salePrice: '1,200,000',
      status: EscrowStatus.RELEASED,
      buyer: '0x678pqr901stu234vwx567yza890bcd123efg456',
      seller: '0x901stu234vwx567yza890bcd123efg456hij789',
      agent: '0x234vwx567yza890bcd123efg456hij789klm012',
      createdAt: new Date('2024-05-15'),
      progress: 100,
      nextAction: 'Transaction completed'
    }
  ]);

  useEffect(() => {
    logger.uiAction('Dashboard loaded');
    if (!isConnected) {
      toast.error('Please connect your wallet to access dashboard');
      navigate('/');
    }
  }, [isConnected, navigate]);

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case EscrowStatus.CREATED:
        return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
      case EscrowStatus.DEPOSITED:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40';
      case EscrowStatus.VERIFIED:
        return 'text-purple-400 bg-purple-500/20 border-purple-500/40';
      case EscrowStatus.RELEASED:
        return 'text-green-400 bg-green-500/20 border-green-500/40';
      case EscrowStatus.DISPUTED:
        return 'text-red-400 bg-red-500/20 border-red-500/40';
      case EscrowStatus.REFUNDED:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
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
          <Building className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-300 mb-6">Please connect your wallet to access the dashboard</p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
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
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Building className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold">{dashboardStats.totalEscrows}</div>
                <div className="text-sm text-gray-300">Total Escrows</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">{dashboardStats.activeDeals}</div>
                <div className="text-sm text-gray-300">Active Deals</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold">{dashboardStats.completedDeals}</div>
                <div className="text-sm text-gray-300">Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold">${dashboardStats.totalValue}</div>
                <div className="text-sm text-gray-300">Total Value</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold">{dashboardStats.pendingActions}</div>
                <div className="text-sm text-gray-300">Pending Actions</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
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
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('disputed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'disputed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Disputed
            </button>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Property ID or Address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-white/40 focus:outline-none"
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
                      <span className="text-gray-400">Sale Price:</span>
                      <div className="font-semibold text-green-400">${escrow.salePrice}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Created:</span>
                      <div className="font-semibold">{escrow.createdAt.toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Progress:</span>
                      <div className="font-semibold">{escrow.progress}%</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Next Action:</span>
                      <div className="font-semibold text-blue-400">{escrow.nextAction}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-32">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{escrow.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${escrow.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewEscrow(escrow.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
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
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No escrows found</h3>
            <p className="text-gray-400 mb-6">
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
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
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