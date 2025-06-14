import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building, 
  Users, 
  DollarSign, 
  FileText, 
  ArrowLeft,
  CheckCircle,
  Clock,
  Upload,
  Download,
  Eye,
  MessageSquare,
  Activity,
  TrendingUp,
  Gavel,
  RefreshCw,
  ExternalLink,
  Copy
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { EscrowContractService } from '../services/EscrowContractService';
import { EscrowData, EscrowStatus, UserRole } from '../types';
import logger from '../utils/logger';
import { useToastHelpers } from '../components/ui/ToastManager';

interface TimelineEvent {
  id: string;
  type: 'creation' | 'deposit' | 'verification' | 'approval' | 'dispute' | 'resolution' | 'completion';
  title: string;
  description: string;
  timestamp: Date;
  actor: string;
  txHash?: string;
}

interface DocumentInfo {
  id: string;
  name: string;
  type: 'contract' | 'title' | 'inspection' | 'verification' | 'other';
  hash: string;
  uploadedBy: string;
  uploadedAt: Date;
  size: string;
}

const EscrowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConnected, address, signer, provider } = useWallet();

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [contractService, setContractService] = useState<EscrowContractService | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock escrow data - in production this would be fetched from the blockchain
  const [escrowData] = useState<EscrowData | null>({
    escrowId: parseInt(id || '1'),
    buyer: '0x742d35Cc6aB4C24C26d4c85b53B4c85b53B4c85',
    seller: '0x123abc456def789ghi012jkl345mno678pqr901',
    agent: '0x456def789abc123ghi456jkl789mno012pqr345',
    arbiter: '0x789def012abc345ghi678jkl901mno234pqr567',
    tokenAddress: '0xa0b86a33e6d9f8c1f5b3c7d0e6f8e1b2d4c6a8f0',
    depositAmount: '750000000000000000000000',
    depositDeadline: Math.floor(Date.now() / 1000) + 86400 * 7,
    propertyId: 'PROP-2024-001',
    status: EscrowStatus.DEPOSITED,
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
    buyerApproval: false,
    sellerApproval: false,
    agentApproval: false,
    isVerified: false
  });

  const [userRole, setUserRole] = useState<UserRole>({
    isBuyer: false,
    isSeller: false,
    isAgent: false,
    isArbiter: false
  });

  const [timeline] = useState<TimelineEvent[]>([
    {
      id: '1',
      type: 'creation',
      title: 'Escrow Created',
      description: 'Property escrow initiated for 123 Blockchain Ave',
      timestamp: new Date(Date.now() - 86400000 * 3),
      actor: '0x123abc456def789ghi012jkl345mno678pqr901'
    },
    {
      id: '2',
      type: 'deposit',
      title: 'Buyer Deposit Completed',
      description: 'Deposit of 750,000 USDC received and secured',
      timestamp: new Date(Date.now() - 86400000 * 2),
      actor: '0x742d35Cc6aB4C24C26d4c85b53B4c85b53B4c85',
      txHash: '0xabc123def456ghi789jkl012mno345pqr678stu901'
    },
    {
      id: '3',
      type: 'verification',
      title: 'Property Inspection Scheduled',
      description: 'Agent scheduled property verification for tomorrow',
      timestamp: new Date(Date.now() - 86400000),
      actor: '0x456def789abc123ghi456jkl789mno012pqr345'
    }
  ]);

  const [documents] = useState<DocumentInfo[]>([
    {
      id: '1',
      name: 'Purchase Agreement.pdf',
      type: 'contract',
      hash: '0xdef456abc789ghi012jkl345mno678pqr901stu234',
      uploadedBy: '0x123abc456def789ghi012jkl345mno678pqr901',
      uploadedAt: new Date(Date.now() - 86400000 * 3),
      size: '2.4 MB'
    },
    {
      id: '2',
      name: 'Property Title.pdf',
      type: 'title',
      hash: '0x789ghi012jkl345mno678pqr901stu234vwx567yza',
      uploadedBy: '0x123abc456def789ghi012jkl345mno678pqr901',
      uploadedAt: new Date(Date.now() - 86400000 * 2),
      size: '1.8 MB'
    }
  ]);

  useEffect(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet to view escrow details');
      navigate('/');
      return;
    }

    // Initialize contract service
    if (provider && signer) {
      const service = new EscrowContractService(provider, signer);
      setContractService(service);
    }

    // Determine user role
    if (escrowData && address) {
      setUserRole({
        isBuyer: escrowData.buyer.toLowerCase() === address.toLowerCase(),
        isSeller: escrowData.seller.toLowerCase() === address.toLowerCase(),
        isAgent: escrowData.agent.toLowerCase() === address.toLowerCase(),
        isArbiter: escrowData.arbiter.toLowerCase() === address.toLowerCase()
      });
    }

    logger.uiAction(`Escrow details loaded for ID: ${id}`);
  }, [isConnected, signer, provider, address, escrowData, id, navigate]);

  const handleAction = async (action: string) => {
    if (!contractService || !escrowData) {
      toast.error('Contract service not available');
      return;
    }

    setActionLoading(action);
    try {
      switch (action) {
        case 'deposit':
          // Handle buyer deposit
          toast.success('Deposit functionality will be implemented');
          break;
        case 'verify':
          // Handle agent verification
          toast.success('Verification functionality will be implemented');
          break;
        case 'approve':
          // Handle participant approval
          toast.success('Approval functionality will be implemented');
          break;
        case 'dispute':
          // Handle dispute initiation
          toast.success('Dispute functionality will be implemented');
          break;
        case 'release':
          // Handle fund release
          toast.success('Release functionality will be implemented');
          break;
        default:
          toast.error('Unknown action');
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      case EscrowStatus.CREATED: return 'Created';
      case EscrowStatus.DEPOSITED: return 'Deposited';
      case EscrowStatus.VERIFIED: return 'Verified';
      case EscrowStatus.RELEASED: return 'Completed';
      case EscrowStatus.DISPUTED: return 'Disputed';
      case EscrowStatus.REFUNDED: return 'Refunded';
      default: return 'Unknown';
    }
  };

  if (!escrowData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Escrow Not Found</h1>
            <p className="text-gray-300 mb-8">The requested escrow could not be found.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-royal-500 hover:bg-royal-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-4xl font-bold">Escrow #{escrowData.escrowId}</h1>
              <p className="text-gray-300">{escrowData.propertyId}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(escrowData.status)}`}>
            {getStatusText(escrowData.status)}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-6 mb-8 border-b border-gray-700">
          {['overview', 'timeline', 'documents', 'actions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-royal-400 border-b-2 border-royal-400'
                  : 'text-grey-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Property Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Property Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-grey-400">Property ID</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-mono">{escrowData.propertyId}</p>
                      <button onClick={() => copyToClipboard(escrowData.propertyId)}>
                        <Copy className="w-4 h-4 text-grey-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-grey-400">Address</label>
                    <p className="text-white">123 Blockchain Ave, Web3 City, DeFi State 12345</p>
                  </div>
                  <div>
                    <label className="text-sm text-grey-400">Sale Price</label>
                    <p className="text-white text-xl font-semibold">750,000 USDC</p>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Financial Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-grey-400">Deposit Amount</label>
                    <p className="text-white font-semibold">750,000 USDC</p>
                  </div>
                  <div>
                    <label className="text-sm text-grey-400">Token Contract</label>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-mono text-sm">{formatAddress(escrowData.tokenAddress)}</p>
                      <button onClick={() => copyToClipboard(escrowData.tokenAddress)}>
                        <Copy className="w-4 h-4 text-grey-400 hover:text-white" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-grey-400">Agent Fee</label>
                    <p className="text-white">2.5% (18,750 USDC)</p>
                  </div>
                  <div>
                    <label className="text-sm text-grey-400">Platform Fee</label>
                    <p className="text-white">0.5% (3,750 USDC)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Participants
                </h3>
                <div className="space-y-4">
                  {[
                    { role: 'Buyer', address: escrowData.buyer, isYou: userRole.isBuyer },
                    { role: 'Seller', address: escrowData.seller, isYou: userRole.isSeller },
                    { role: 'Agent', address: escrowData.agent, isYou: userRole.isAgent },
                    { role: 'Arbiter', address: escrowData.arbiter, isYou: userRole.isArbiter }
                  ].map((participant) => (
                    <div key={participant.role} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-grey-400">{participant.role}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-mono text-sm">{formatAddress(participant.address)}</p>
                          {participant.isYou && (
                            <span className="text-xs bg-blue-500/20 text-royal-400 px-2 py-1 rounded">You</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => copyToClipboard(participant.address)}>
                        <Copy className="w-4 h-4 text-grey-400 hover:text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Available Actions
                </h3>
                <div className="space-y-3">
                  {userRole.isBuyer && escrowData.status === EscrowStatus.CREATED && (
                    <button
                      onClick={() => handleAction('deposit')}
                      disabled={actionLoading === 'deposit'}
                      className="w-full bg-royal-500 hover:bg-royal-600 disabled:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                    >
                      {actionLoading === 'deposit' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Make Deposit
                        </>
                      )}
                    </button>
                  )}
                  
                  {userRole.isAgent && escrowData.status === EscrowStatus.DEPOSITED && (
                    <button
                      onClick={() => handleAction('verify')}
                      disabled={actionLoading === 'verify'}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                    >
                      {actionLoading === 'verify' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Property
                        </>
                      )}
                    </button>
                  )}

                  {(userRole.isBuyer || userRole.isSeller) && escrowData.status === EscrowStatus.VERIFIED && (
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading === 'approve'}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                    >
                      {actionLoading === 'approve' ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Give Approval
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleAction('dispute')}
                    disabled={actionLoading === 'dispute' || escrowData.status === EscrowStatus.RELEASED}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                  >
                    {actionLoading === 'dispute' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Gavel className="w-4 h-4 mr-2" />
                        Raise Dispute
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Activity Timeline
              </h3>
              <div className="space-y-6">
                {timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.type === 'creation' ? 'bg-blue-500/20 text-royal-400' :
                      event.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                      event.type === 'verification' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-grey-400'
                    }`}>
                      {event.type === 'creation' && <Building className="w-5 h-5" />}
                      {event.type === 'deposit' && <DollarSign className="w-5 h-5" />}
                      {event.type === 'verification' && <CheckCircle className="w-5 h-5" />}
                      {event.type === 'approval' && <TrendingUp className="w-5 h-5" />}
                      {event.type === 'dispute' && <Gavel className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{event.title}</h4>
                        <span className="text-sm text-grey-400">
                          {event.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1">{event.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-grey-400">
                          By: {formatAddress(event.actor)}
                        </span>
                        {event.txHash && (
                          <button
                            onClick={() => copyToClipboard(event.txHash!)}
                            className="text-xs text-royal-400 hover:text-blue-300 flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Transaction
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Documents & Attachments
                </h3>
                <button className="bg-royal-500 hover:bg-royal-600 text-white px-4 py-2 rounded-xl flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </button>
              </div>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        doc.type === 'contract' ? 'bg-blue-500/20 text-royal-400' :
                        doc.type === 'title' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-grey-400'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{doc.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-grey-400">
                          <span>Uploaded by {formatAddress(doc.uploadedBy)}</span>
                          <span>{doc.uploadedAt.toLocaleDateString()}</span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-grey-400 hover:text-white p-2">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-grey-400 hover:text-white p-2">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Transaction Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Primary Actions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-300">Primary Actions</h4>
                  
                  {userRole.isBuyer && escrowData.status === EscrowStatus.CREATED && (
                    <button
                      onClick={() => handleAction('deposit')}
                      disabled={actionLoading === 'deposit'}
                      className="w-full bg-royal-500 hover:bg-royal-600 disabled:bg-gray-600 text-white p-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                    >
                      {actionLoading === 'deposit' ? (
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <DollarSign className="w-5 h-5 mr-2" />
                      )}
                      Make Security Deposit
                    </button>
                  )}

                  {userRole.isAgent && escrowData.status === EscrowStatus.DEPOSITED && (
                    <button
                      onClick={() => handleAction('verify')}
                      disabled={actionLoading === 'verify'}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white p-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                    >
                      {actionLoading === 'verify' ? (
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      )}
                      Complete Property Verification
                    </button>
                  )}

                  {(userRole.isBuyer || userRole.isSeller) && escrowData.status === EscrowStatus.VERIFIED && (
                    <button
                      onClick={() => handleAction('approve')}
                      disabled={actionLoading === 'approve'}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white p-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                    >
                      {actionLoading === 'approve' ? (
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                      ) : (
                        <TrendingUp className="w-5 h-5 mr-2" />
                      )}
                      Approve Transaction
                    </button>
                  )}
                </div>

                {/* Secondary Actions */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-300">Secondary Actions</h4>
                  
                  <button
                    onClick={() => handleAction('dispute')}
                    disabled={actionLoading === 'dispute' || escrowData.status === EscrowStatus.RELEASED}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white p-4 rounded-xl font-semibold transition-colors flex items-center justify-center"
                  >
                    {actionLoading === 'dispute' ? (
                      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Gavel className="w-5 h-5 mr-2" />
                    )}
                    Initiate Dispute Resolution
                  </button>

                  <button className="w-full bg-gray-600 hover:bg-grey-700 text-white p-4 rounded-xl font-semibold transition-colors flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Contact Support
                  </button>

                  <button className="w-full bg-gray-600 hover:bg-grey-700 text-white p-4 rounded-xl font-semibold transition-colors flex items-center justify-center">
                    <Download className="w-5 h-5 mr-2" />
                    Export Transaction Data
                  </button>
                </div>
              </div>

              {/* Action Status */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="font-semibold text-gray-300 mb-3">Current Status & Next Steps</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-grey-400">Buyer Approval</span>
                    <span className={escrowData.buyerApproval ? 'text-green-400' : 'text-grey-400'}>
                      {escrowData.buyerApproval ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-grey-400">Seller Approval</span>
                    <span className={escrowData.sellerApproval ? 'text-green-400' : 'text-grey-400'}>
                      {escrowData.sellerApproval ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-grey-400">Agent Verification</span>
                    <span className={escrowData.isVerified ? 'text-green-400' : 'text-grey-400'}>
                      {escrowData.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EscrowDetails;