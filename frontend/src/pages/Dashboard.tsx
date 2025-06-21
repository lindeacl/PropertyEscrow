import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { cryptoConverter } from '../services/cryptoConverter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  FileText, 
  Users, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Banknote,
  User
} from 'lucide-react';

interface SystemStatus {
  message: string;
  version: string;
  blockchain_connected: boolean;
}

interface TransactionRecord {
  id: number;
  transaction_hash: string;
  transaction_type: string;
  status: string;
  amount?: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transactionPrices, setTransactionPrices] = useState<{ [key: number]: { primary: string; secondary: string } }>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statusData, transactionData] = await Promise.all([
          apiService.getSystemStatus(),
          apiService.getUserTransactions()
        ]);
        
        setSystemStatus(statusData);
        const recentTransactions = transactionData.slice(0, 5);
        setTransactions(recentTransactions);
        
        const priceConversions: { [key: number]: { primary: string; secondary: string } } = {};
        for (const transaction of recentTransactions) {
          if (transaction.amount && transaction.amount.includes('ETH')) {
            try {
              const ethAmount = transaction.amount.replace(' ETH', '');
              const conversion = await cryptoConverter.getDisplayPrice(ethAmount);
              priceConversions[transaction.id] = conversion;
            } catch (error) {
              console.error(`Failed to convert price for transaction ${transaction.id}:`, error);
            }
          }
        }
        setTransactionPrices(priceConversions);
      } catch (err: any) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const formatTransactionType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {user?.role}
          </Badge>
          {systemStatus?.blockchain_connected ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Blockchain Connected
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Blockchain Disconnected
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">Recent activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Escrows</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => t.status.toLowerCase() === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Pending completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemStatus?.blockchain_connected ? 'Online' : 'Offline'}
            </div>
            <p className="text-xs text-muted-foreground">
              Version {systemStatus?.version || 'Unknown'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.role}</div>
            <p className="text-xs text-muted-foreground">Access level</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest blockchain transactions and escrow activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a property listing or escrow transaction.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {transaction.transaction_type.includes('PROPERTY') ? (
                        <Building className="h-8 w-8 text-blue-600" />
                      ) : transaction.transaction_type.includes('ESCROW') ? (
                        <FileText className="h-8 w-8 text-green-600" />
                      ) : (
                        <Banknote className="h-8 w-8 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatTransactionType(transaction.transaction_type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {transaction.amount && (
                      <div className="text-right">
                        {transactionPrices[transaction.id] ? (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {transactionPrices[transaction.id].primary}
                            </div>
                            <div className="text-xs text-gray-500">
                              {transactionPrices[transaction.id].secondary}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {transaction.amount}
                          </span>
                        )}
                      </div>
                    )}
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks based on your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(user?.role === 'seller' || user?.role === 'admin') && (
              <Button 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/properties')}
              >
                <Building className="h-6 w-6" />
                <span>List Property</span>
              </Button>
            )}
            
            {(user?.role === 'buyer' || user?.role === 'admin') && (
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate('/escrow')}
              >
                <FileText className="h-6 w-6" />
                <span>Create Escrow</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/profile')}
            >
              <User className="h-6 w-6" />
              <span>Update Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
