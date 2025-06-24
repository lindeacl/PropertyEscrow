import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { cryptoConverter } from '../services/cryptoConverter';
import { isValidEthereumAddress, validateEscrowData } from '../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Banknote,
  Calendar
} from 'lucide-react';

interface TransactionRecord {
  id: number;
  user_id: number;
  transaction_hash: string;
  contract_transaction_id?: number;
  property_id?: number;
  transaction_type: string;
  status: string;
  amount?: string;
  gas_used?: string;
  gas_price?: string;
  block_number?: number;
  created_at: string;
  updated_at?: string;
}

const Escrow: React.FC = () => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [priceDisplays, setPriceDisplays] = useState<{ [key: string]: { primary: string; secondary: string } }>({});
  const [earnestMoneyZar, setEarnestMoneyZar] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [loading, setLoading] = useState(true);
  const [transactionError, setTransactionError] = useState('');
  const [escrowTransactions, setEscrowTransactions] = useState<TransactionRecord[]>([]);
  
  const [newEscrow, setNewEscrow] = useState({
    property_id: '',
    agent_address: '',
    inspection_days: '7',
    closing_date: '',
    terms: '',
    earnest_money: ''
  });

  const canCreateEscrow = user?.role?.toLowerCase() === 'buyer' || user?.role?.toLowerCase() === 'admin';

  const formatTransactionType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterTransactionsByStatus = (status: string) => {
    if (status === 'all') return escrowTransactions;
    if (status === 'active') return escrowTransactions.filter((tx: TransactionRecord) => tx.status.toLowerCase() === 'pending');
    if (status === 'completed') return escrowTransactions.filter((tx: TransactionRecord) => tx.status.toLowerCase() === 'completed');
    return escrowTransactions;
  };

  useEffect(() => {
    const loadPriceConversions = async () => {
      try {
        const conversions = await Promise.all([
          cryptoConverter.getDisplayPrice('1.5'),
          cryptoConverter.getDisplayPrice('0.15')
        ]);
        
        setPriceDisplays({
          '1.5': conversions[0],
          '0.15': conversions[1]
        });
      } catch (error) {
        console.error('Failed to load price conversions:', error);
      }
    };

    loadPriceConversions();
  }, []);

  useEffect(() => {
    const fetchEscrowTransactions = async () => {
      try {
        setLoading(true);
        const allTransactions = await apiService.getUserTransactions();
        const escrowTxs = allTransactions.filter(tx => tx.transaction_type === 'CREATE_ESCROW');
        setEscrowTransactions(escrowTxs);
        setTransactionError('');
      } catch (err: any) {
        setTransactionError('Failed to load escrow transactions');
        console.error('Escrow transactions error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEscrowTransactions();
  }, []);

  const handleEarnestMoneyChange = async (value: string) => {
    setNewEscrow(prev => ({ ...prev, earnest_money: value }));
    
    if (value && !isNaN(parseFloat(value))) {
      try {
        const conversion = await cryptoConverter.getDisplayPrice(value);
        setEarnestMoneyZar(conversion.primary);
      } catch (error) {
        setEarnestMoneyZar('');
      }
    } else {
      setEarnestMoneyZar('');
    }
  };

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    try {
      const closingTimestamp = Math.floor(new Date(newEscrow.closing_date).getTime() / 1000);
      
      const escrowData = {
        property_id: parseInt(newEscrow.property_id),
        agent_address: newEscrow.agent_address,
        inspection_days: parseInt(newEscrow.inspection_days),
        closing_date: closingTimestamp,
        terms: newEscrow.terms,
        earnest_money: parseFloat(newEscrow.earnest_money)
      };

      const validation = validateEscrowData(escrowData);
      if (!validation.isValid) {
        setError(validation.errors.join('. '));
        return;
      }

      const result = await apiService.createEscrow(escrowData);
      setSuccess(`Escrow created successfully! Transaction hash: ${result.transaction_hash}`);
      setShowCreateDialog(false);
      setNewEscrow({
        property_id: '',
        agent_address: '',
        inspection_days: '7',
        closing_date: '',
        terms: '',
        earnest_money: ''
      });

      const allTransactions = await apiService.getUserTransactions();
      const escrowTxs = allTransactions.filter(tx => tx.transaction_type === 'CREATE_ESCROW');
      setEscrowTransactions(escrowTxs);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to create escrow';
      setError(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAgentAddressChange = (value: string) => {
    setNewEscrow(prev => ({ ...prev, agent_address: value }));
    
    if (value && !isValidEthereumAddress(value)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        agent_address: 'Must be a valid Ethereum address (0x followed by 40 characters)' 
      }));
    } else {
      setFieldErrors(prev => {
        const { agent_address, ...rest } = prev;
        return rest;
      });
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Escrow Management</h1>
          <p className="text-gray-600">Manage escrow transactions and approvals</p>
        </div>
        {canCreateEscrow && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Escrow
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Escrow</DialogTitle>
                <DialogDescription>
                  Set up a new escrow transaction for a property purchase
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEscrow} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="property_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Property ID *
                    </label>
                    <Input
                      id="property_id"
                      type="number"
                      value={newEscrow.property_id}
                      onChange={(e) => setNewEscrow(prev => ({ ...prev, property_id: e.target.value }))}
                      placeholder="1"
                      required
                      disabled={createLoading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="inspection_days" className="block text-sm font-medium text-gray-700 mb-1">
                      Inspection Days *
                    </label>
                    <Input
                      id="inspection_days"
                      type="number"
                      value={newEscrow.inspection_days}
                      onChange={(e) => setNewEscrow(prev => ({ ...prev, inspection_days: e.target.value }))}
                      placeholder="7"
                      required
                      disabled={createLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="agent_address" className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Wallet Address *
                  </label>
                  <Input
                    id="agent_address"
                    value={newEscrow.agent_address}
                    onChange={(e) => handleAgentAddressChange(e.target.value)}
                    placeholder="0x1234567890123456789012345678901234567890"
                    required
                    disabled={createLoading}
                    className={fieldErrors.agent_address ? 'border-red-500' : ''}
                  />
                  {fieldErrors.agent_address && (
                    <p className="text-sm text-red-600 mt-1">{fieldErrors.agent_address}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the Ethereum wallet address of the real estate agent
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="closing_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Closing Date *
                    </label>
                    <Input
                      id="closing_date"
                      type="date"
                      value={newEscrow.closing_date}
                      onChange={(e) => setNewEscrow(prev => ({ ...prev, closing_date: e.target.value }))}
                      required
                      disabled={createLoading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="earnest_money" className="block text-sm font-medium text-gray-700 mb-1">
                      Earnest Money (ETH) *
                    </label>
                    <Input
                      id="earnest_money"
                      type="number"
                      step="0.001"
                      value={newEscrow.earnest_money}
                      onChange={(e) => handleEarnestMoneyChange(e.target.value)}
                      placeholder="0.1"
                      required
                      disabled={createLoading}
                    />
                    {earnestMoneyZar && (
                      <p className="text-sm text-gray-500 mt-1">≈ {earnestMoneyZar}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">
                    Terms &amp; Conditions *
                  </label>
                  <Textarea
                    id="terms"
                    value={newEscrow.terms}
                    onChange={(e) => setNewEscrow(prev => ({ ...prev, terms: e.target.value }))}
                    placeholder="Enter the terms and conditions for this escrow..."
                    required
                    disabled={createLoading}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    disabled={createLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLoading}>
                    {createLoading ? 'Creating...' : 'Create Escrow'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {transactionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{transactionError}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Escrows</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filterTransactionsByStatus('active').length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No active escrows</h3>
              <p className="mt-1 text-sm text-gray-500">
                {canCreateEscrow 
                  ? "Create your first escrow transaction to get started."
                  : "Active escrow transactions will appear here."
                }
              </p>
            </div>
          ) : (
            filterTransactionsByStatus('active').map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Escrow #{transaction.id}
                      </CardTitle>
                      <CardDescription>
                        Property ID: {transaction.property_id} • Created: {new Date(transaction.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transaction.amount && (
                      <div className="flex items-center space-x-2">
                        <Banknote className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">Earnest Money</p>
                          <p className="text-sm font-semibold text-green-600">
                            {priceDisplays[transaction.amount.replace(' ETH', '')]?.primary || 'Loading...'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {priceDisplays[transaction.amount.replace(' ETH', '')]?.secondary || transaction.amount}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm font-medium">Transaction Hash</p>
                        <p className="text-xs text-gray-600 font-mono">
                          {transaction.transaction_hash.slice(0, 10)}...{transaction.transaction_hash.slice(-8)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Transaction Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Status:</span>
                        <span className="ml-2 font-medium">{formatTransactionType(transaction.status)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 font-medium">{formatTransactionType(transaction.transaction_type)}</span>
                      </div>
                      {transaction.gas_used && (
                        <div>
                          <span className="text-gray-500">Gas Used:</span>
                          <span className="ml-2 font-medium">{transaction.gas_used}</span>
                        </div>
                      )}
                      {transaction.block_number && (
                        <div>
                          <span className="text-gray-500">Block:</span>
                          <span className="ml-2 font-medium">{transaction.block_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {user?.role?.toLowerCase() !== 'admin' && (
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">
                        Give Approval
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filterTransactionsByStatus('completed').length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No completed escrows</h3>
              <p className="mt-1 text-sm text-gray-500">
                Completed escrow transactions will appear here.
              </p>
            </div>
          ) : (
            filterTransactionsByStatus('completed').map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Escrow #{transaction.id}
                      </CardTitle>
                      <CardDescription>
                        Property ID: {transaction.property_id} • Completed: {new Date(transaction.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    Transaction Hash: {transaction.transaction_hash}
                  </div>
                  {transaction.amount && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Amount:</span>
                      <span className="ml-2 font-medium">{transaction.amount}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filterTransactionsByStatus('all').length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No escrow transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                {canCreateEscrow 
                  ? "Get started by creating your first escrow transaction."
                  : "Escrow transactions you're involved in will appear here."
                }
              </p>
            </div>
          ) : (
            filterTransactionsByStatus('all').map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Escrow #{transaction.id}
                      </CardTitle>
                      <CardDescription>
                        Property ID: {transaction.property_id} • {new Date(transaction.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Transaction Hash:</span>
                      <div className="font-mono text-xs mt-1">
                        {transaction.transaction_hash}
                      </div>
                    </div>
                    {transaction.amount && (
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <div className="font-medium mt-1">{transaction.amount}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Escrow;
