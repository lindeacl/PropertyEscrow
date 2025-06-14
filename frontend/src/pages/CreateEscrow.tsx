import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Users, 
  DollarSign, 
  Calendar,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { EscrowContractService, CreateEscrowParams } from '../services/EscrowContractService';
import logger from '../utils/logger';
import { useToastHelpers } from '../components/ui/ToastManager';

interface FormData {
  // Property Information
  propertyId: string;
  propertyAddress: string;
  propertyDescription: string;
  salePrice: string;
  
  // Participants
  buyer: string;
  seller: string;
  agent: string;
  arbiter: string;
  
  // Token & Fees
  tokenAddress: string;
  depositAmount: string;
  agentFee: number;
  platformFee: number;
  
  // Deadlines
  depositDeadline: string;
  verificationDeadline: string;
  
  // Documents
  documentHash: string;
  propertyVerified: boolean;
}

const CreateEscrow: React.FC = () => {
  const { isConnected, address, signer, provider, connectWallet } = useWallet();
  const navigate = useNavigate();
  const { success, error: showError } = useToastHelpers();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [contractService, setContractService] = useState<EscrowContractService | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    propertyId: '',
    propertyAddress: '',
    propertyDescription: '',
    salePrice: '',
    buyer: address || '',
    seller: '',
    agent: '',
    arbiter: '',
    tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
    depositAmount: '',
    agentFee: 2.5,
    platformFee: 0.5,
    depositDeadline: '',
    verificationDeadline: '',
    documentHash: '',
    propertyVerified: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    logger.uiAction('Create Escrow page loaded');
    
    if (!isConnected) {
      showError('Please connect your wallet to create escrow');
      navigate('/');
      return;
    }

    if (provider && signer) {
      const service = new EscrowContractService(provider, signer);
      setContractService(service);
    }

    // Set default deadlines
    const now = new Date();
    const depositDeadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const verificationDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    setFormData(prev => ({
      ...prev,
      buyer: address || '',
      depositDeadline: depositDeadline.toISOString().split('T')[0],
      verificationDeadline: verificationDeadline.toISOString().split('T')[0]
    }));
  }, [isConnected, address, provider, signer, navigate]);

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 1: // Property Information
        if (!formData.propertyId) newErrors.propertyId = 'Property ID is required';
        if (!formData.propertyAddress) newErrors.propertyAddress = 'Property address is required';
        if (!formData.propertyDescription) newErrors.propertyDescription = 'Property description is required';
        if (!formData.salePrice) newErrors.salePrice = 'Sale price is required';
        if (parseFloat(formData.salePrice) <= 0) newErrors.salePrice = 'Sale price must be greater than 0';
        break;
        
      case 2: // Participants
        if (!formData.buyer) newErrors.buyer = 'Buyer address is required';
        if (!formData.seller) newErrors.seller = 'Seller address is required';
        if (!formData.agent) newErrors.agent = 'Agent address is required';
        if (!formData.arbiter) newErrors.arbiter = 'Arbiter address is required';
        
        // Validate Ethereum addresses
        const addressPattern = /^0x[a-fA-F0-9]{40}$/;
        if (formData.buyer && !addressPattern.test(formData.buyer)) newErrors.buyer = 'Invalid Ethereum address';
        if (formData.seller && !addressPattern.test(formData.seller)) newErrors.seller = 'Invalid Ethereum address';
        if (formData.agent && !addressPattern.test(formData.agent)) newErrors.agent = 'Invalid Ethereum address';
        if (formData.arbiter && !addressPattern.test(formData.arbiter)) newErrors.arbiter = 'Invalid Ethereum address';
        break;
        
      case 3: // Financial Terms
        if (!formData.depositAmount) newErrors.depositAmount = 'Deposit amount is required';
        if (parseFloat(formData.depositAmount) <= 0) newErrors.depositAmount = 'Deposit amount must be greater than 0';
        if (parseFloat(formData.depositAmount) > parseFloat(formData.salePrice)) {
          newErrors.depositAmount = 'Deposit amount cannot exceed sale price';
        }
        if (formData.agentFee < 0 || formData.agentFee > 10) newErrors.agentFee = 'Agent fee must be between 0-10%';
        break;
        
      case 4: // Timeline & Documents
        if (!formData.depositDeadline) newErrors.depositDeadline = 'Deposit deadline is required';
        if (!formData.verificationDeadline) newErrors.verificationDeadline = 'Verification deadline is required';
        
        const depositDate = new Date(formData.depositDeadline);
        const verificationDate = new Date(formData.verificationDeadline);
        const now = new Date();
        
        if (depositDate <= now) newErrors.depositDeadline = 'Deposit deadline must be in the future';
        if (verificationDate <= depositDate) newErrors.verificationDeadline = 'Verification deadline must be after deposit deadline';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!contractService) {
      showError('Contract service not initialized');
      return;
    }

    if (!validateStep(4)) {
      return;
    }

    try {
      setLoading(true);
      logger.uiAction('Creating escrow contract', formData);

      const params: CreateEscrowParams = {
        buyer: formData.buyer,
        seller: formData.seller,
        agent: formData.agent,
        arbiter: formData.arbiter,
        tokenAddress: formData.tokenAddress,
        depositAmount: formData.depositAmount,
        agentFee: formData.agentFee,
        platformFee: formData.platformFee,
        property: {
          propertyId: formData.propertyId,
          description: formData.propertyDescription,
          salePrice: formData.salePrice,
          documentHash: formData.documentHash || '0x0000000000000000000000000000000000000000000000000000000000000000',
          verified: formData.propertyVerified
        },
        depositDeadline: Math.floor(new Date(formData.depositDeadline).getTime() / 1000),
        verificationDeadline: Math.floor(new Date(formData.verificationDeadline).getTime() / 1000)
      };

      const result = await contractService.createEscrow(params);
      
      success('Escrow created successfully!');
      logger.uiAction('Escrow created successfully', result);
      
      setCurrentStep(5);
      
      setTimeout(() => {
        navigate(`/escrow/${result.escrowId}`);
      }, 2000);

    } catch (err) {
      logger.error('Failed to create escrow', err as Error);
      showError('Failed to create escrow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-royal-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-300 mb-6">Please connect your wallet to create escrow</p>
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
              <h1 className="text-3xl font-bold">Create New Escrow</h1>
              <p className="text-gray-300">Set up a secure property transaction</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    step <= currentStep
                      ? 'bg-royal-500 border-blue-600 text-white'
                      : 'border-grey-400 text-grey-400'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                {step < 5 && (
                  <div
                    className={`w-16 h-1 transition-colors ${
                      step < currentStep ? 'bg-royal-500' : 'bg-grey-400'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Property Information */}
          {currentStep === 1 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                <Building className="w-8 h-8 text-royal-400" />
                <span>Property Information</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Property ID</label>
                  <input
                    type="text"
                    value={formData.propertyId}
                    onChange={(e) => handleInputChange('propertyId', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.propertyId ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="e.g., PROP-2024-001"
                  />
                  {errors.propertyId && <p className="text-red-400 text-sm mt-1">{errors.propertyId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sale Price (USD)</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.salePrice ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="750000"
                  />
                  {errors.salePrice && <p className="text-red-400 text-sm mt-1">{errors.salePrice}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Property Address</label>
                  <input
                    type="text"
                    value={formData.propertyAddress}
                    onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.propertyAddress ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="123 Blockchain Ave, Web3 City, State 12345"
                  />
                  {errors.propertyAddress && <p className="text-red-400 text-sm mt-1">{errors.propertyAddress}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Property Description</label>
                  <textarea
                    value={formData.propertyDescription}
                    onChange={(e) => handleInputChange('propertyDescription', e.target.value)}
                    rows={4}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.propertyDescription ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Detailed description of the property, including key features, condition, and any relevant information..."
                  />
                  {errors.propertyDescription && <p className="text-red-400 text-sm mt-1">{errors.propertyDescription}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Participants */}
          {currentStep === 2 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                <Users className="w-8 h-8 text-green-400" />
                <span>Transaction Participants</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Buyer Address</label>
                  <input
                    type="text"
                    value={formData.buyer}
                    onChange={(e) => handleInputChange('buyer', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.buyer ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="0x..."
                  />
                  {errors.buyer && <p className="text-red-400 text-sm mt-1">{errors.buyer}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Seller Address</label>
                  <input
                    type="text"
                    value={formData.seller}
                    onChange={(e) => handleInputChange('seller', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.seller ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="0x..."
                  />
                  {errors.seller && <p className="text-red-400 text-sm mt-1">{errors.seller}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Agent Address</label>
                  <input
                    type="text"
                    value={formData.agent}
                    onChange={(e) => handleInputChange('agent', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.agent ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="0x..."
                  />
                  {errors.agent && <p className="text-red-400 text-sm mt-1">{errors.agent}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Arbiter Address</label>
                  <input
                    type="text"
                    value={formData.arbiter}
                    onChange={(e) => handleInputChange('arbiter', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.arbiter ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="0x..."
                  />
                  {errors.arbiter && <p className="text-red-400 text-sm mt-1">{errors.arbiter}</p>}
                </div>
              </div>

              <div className="mt-6 p-4 bg-royal-500/20 border border-royal-500/40 rounded-xl">
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Role Descriptions</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <strong>Buyer:</strong> Deposits funds and approves final release
                  </div>
                  <div>
                    <strong>Seller:</strong> Receives funds upon successful completion
                  </div>
                  <div>
                    <strong>Agent:</strong> Verifies property conditions and approves transaction
                  </div>
                  <div>
                    <strong>Arbiter:</strong> Resolves disputes if they arise
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Terms */}
          {currentStep === 3 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                <DollarSign className="w-8 h-8 text-yellow-400" />
                <span>Financial Terms</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Deposit Amount</label>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) => handleInputChange('depositAmount', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.depositAmount ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="75000"
                  />
                  {errors.depositAmount && <p className="text-red-400 text-sm mt-1">{errors.depositAmount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Token Address</label>
                  <select
                    value={formData.tokenAddress}
                    onChange={(e) => handleInputChange('tokenAddress', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-white/40 focus:outline-none"
                  >
                    <option value="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174">USDC (Polygon)</option>
                    <option value="0xc2132D05D31c914a87C6611C10748AEb04B58e8F">USDT (Polygon)</option>
                    <option value="0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063">DAI (Polygon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Agent Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.agentFee}
                    onChange={(e) => handleInputChange('agentFee', parseFloat(e.target.value))}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none ${
                      errors.agentFee ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.agentFee && <p className="text-red-400 text-sm mt-1">{errors.agentFee}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Platform Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.platformFee}
                    onChange={(e) => handleInputChange('platformFee', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white bg-gray-600 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-grey-400 text-sm mt-1">Platform fee is fixed</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/40 rounded-xl">
                <h3 className="font-semibold mb-2">Fee Breakdown</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Sale Price:</span>
                    <span>${formData.salePrice || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agent Fee ({formData.agentFee}%):</span>
                    <span>${formData.salePrice ? ((parseFloat(formData.salePrice) * formData.agentFee) / 100).toFixed(2) : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee ({formData.platformFee}%):</span>
                    <span>${formData.salePrice ? ((parseFloat(formData.salePrice) * formData.platformFee) / 100).toFixed(2) : '0'}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t border-gray-500 pt-1 mt-2">
                    <span>Net to Seller:</span>
                    <span>${formData.salePrice ? (parseFloat(formData.salePrice) * (1 - (formData.agentFee + formData.platformFee) / 100)).toFixed(2) : '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Timeline & Documents */}
          {currentStep === 4 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-purple-400" />
                <span>Timeline & Documents</span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Deposit Deadline</label>
                  <input
                    type="date"
                    value={formData.depositDeadline}
                    onChange={(e) => handleInputChange('depositDeadline', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:border-white/40 focus:outline-none ${
                      errors.depositDeadline ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.depositDeadline && <p className="text-red-400 text-sm mt-1">{errors.depositDeadline}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Verification Deadline</label>
                  <input
                    type="date"
                    value={formData.verificationDeadline}
                    onChange={(e) => handleInputChange('verificationDeadline', e.target.value)}
                    className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white focus:border-white/40 focus:outline-none ${
                      errors.verificationDeadline ? 'border-red-500' : 'border-white/20'
                    }`}
                  />
                  {errors.verificationDeadline && <p className="text-red-400 text-sm mt-1">{errors.verificationDeadline}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Document Hash (Optional)</label>
                  <input
                    type="text"
                    value={formData.documentHash}
                    onChange={(e) => handleInputChange('documentHash', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-white/40 focus:outline-none"
                    placeholder="0x... (IPFS hash or document fingerprint)"
                  />
                  <p className="text-grey-400 text-sm mt-1">Optional: Hash of property documents for verification</p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.propertyVerified}
                      onChange={(e) => handleInputChange('propertyVerified', e.target.checked)}
                      className="w-4 h-4 text-royal-500 bg-white/10 border-white/20 rounded focus:ring-royal-500"
                    />
                    <span className="text-sm">Property has been pre-verified</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/40 rounded-xl">
                <h3 className="font-semibold mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Important Notes</span>
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• All participants must approve the transaction for funds to be released</li>
                  <li>• Deposit deadline: When buyer must deposit funds into escrow</li>
                  <li>• Verification deadline: When agent must complete property verification</li>
                  <li>• All addresses and details will be immutable once the escrow is created</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {currentStep === 5 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Escrow Created Successfully!</h2>
              <p className="text-gray-300 mb-6">
                Your property escrow has been deployed to the blockchain. All participants will be notified.
              </p>
              <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 mb-6">
                <p className="text-sm">
                  You will be redirected to the escrow details page in a few seconds...
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-royal-500 hover:bg-royal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-gray-600 hover:bg-grey-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Previous</span>
              </button>

              {currentStep === 4 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Escrow</span>
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="bg-royal-500 hover:bg-royal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEscrow;